import Order from '@/models/Order';
import Product from '@/models/Product';
import Coupon from '@/models/Coupon';
import { createShipment, resolveCourierForShipment } from '@/lib/nimbuspost';
import { calculateTotalWeightKg } from '@/lib/weight';

/**
 * Post-payment side effects, safe to call from both /api/payment/verify and
 * the Razorpay webhook.
 *
 * A payment is confirmed twice: once by the browser calling verify, once by
 * the webhook. Previously both paths were gated on `paymentStatus === 'paid'`,
 * so whichever arrived second did nothing — and since verify almost always
 * wins, stock, coupon usage and the shipment were silently never processed.
 *
 * Each effect now claims its own flag with an atomic findOneAndUpdate, so it
 * runs exactly once no matter who gets there first.
 */

/** Marks the order paid. Returns true if this call was the one that flipped it. */
export async function markOrderPaidOnce(orderId: string, paymentId: string): Promise<boolean> {
  try {
    const claimed = await Order.findOneAndUpdate(
      { _id: orderId, paymentStatus: { $ne: 'paid' } },
      { $set: { paymentStatus: 'paid', status: 'confirmed', paymentId } },
      { new: true }
    );
    return Boolean(claimed);
  } catch (error: any) {
    // paymentId carries a unique sparse index — a duplicate means the other
    // path already recorded this exact payment, which is not an error.
    if (error?.code === 11000) {
      return false;
    }
    throw error;
  }
}

/** Decrements stock and increments coupon usage. Runs at most once per order. */
export async function applyInventoryAndCouponOnce(orderId: string): Promise<boolean> {
  const claimed = await Order.findOneAndUpdate(
    { _id: orderId, paymentStatus: 'paid', inventoryApplied: { $ne: true } },
    { $set: { inventoryApplied: true } },
    { new: true }
  );

  if (!claimed) return false;

  const items = Array.isArray(claimed.items) ? claimed.items : [];

  await Promise.allSettled(
    items.map((item: any) =>
      Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } })
    )
  );

  // Stock must never read negative on the storefront, so clamp anything the
  // decrement pushed below zero.
  await Promise.allSettled(
    items.map((item: any) =>
      Product.updateOne({ _id: item.productId, stock: { $lt: 0 } }, { $set: { stock: 0 } })
    )
  );

  const appliedCouponCode = String(claimed.appliedCouponCode || '').trim().toUpperCase();
  const hasCouponApplied = Boolean(appliedCouponCode && Number(claimed.couponDiscount || 0) > 0);

  if (hasCouponApplied) {
    const couponClaimed = await Order.findOneAndUpdate(
      { _id: orderId, couponUsageApplied: { $ne: true } },
      { $set: { couponUsageApplied: true } },
      { new: true }
    );

    if (couponClaimed) {
      await Coupon.findOneAndUpdate(
        {
          code: appliedCouponCode,
          isActive: true,
          $or: [{ usageLimit: null }, { $expr: { $lt: ['$usedCount', '$usageLimit'] } }],
        },
        { $inc: { usedCount: 1 } }
      );
    }
  }

  return true;
}

const SHIPMENT_TIMEOUT_MS = 8000;

/**
 * Books the NimbusPost shipment. Runs at most once per order.
 *
 * Bounded by a timeout because this used to be awaited inline in the webhook —
 * a slow Nimbus call would blow the webhook's response budget, Razorpay would
 * retry, and the retry found the order already paid and skipped everything.
 * On timeout the claim is deliberately kept so we never risk double-booking;
 * the admin Delivery page can still create the shipment manually.
 */
export async function createShipmentForPaidOrderOnce(orderId: string): Promise<boolean> {
  const claimed = await Order.findOneAndUpdate(
    {
      _id: orderId,
      paymentStatus: 'paid',
      $and: [
        { $or: [{ awbNumber: { $in: [null, ''] } }, { awbNumber: { $exists: false } }] },
        { shipmentRequestedAt: null },
      ],
    },
    { $set: { shipmentRequestedAt: new Date() } },
    { new: true }
  );

  if (!claimed) return false;

  const releaseClaim = async () => {
    await Order.updateOne({ _id: orderId }, { $set: { shipmentRequestedAt: null } });
  };

  try {
    const totalWeight = calculateTotalWeightKg(claimed.items || []);
    const nimbusPaymentType = claimed.paymentMethod === 'cod' ? 'cod' : 'prepaid';
    const shippingPincode = String(claimed.shipping?.zipCode || '').trim();

    const resolvedCourier = /^\d{6}$/.test(shippingPincode)
      ? await resolveCourierForShipment({
          pincode: shippingPincode,
          weight: totalWeight,
          order_amount: Math.max(0, Number(claimed.total || 0)),
          payment_method: nimbusPaymentType,
          preferredCourierName: String(claimed.selectedCourier || ''),
          preferredCourierId: String(claimed.selectedCourierId || ''),
        })
      : null;

    const shipmentPromise = createShipment({
      order_id: claimed.orderNumber,
      consignee: {
        name: claimed.shipping.name,
        address: claimed.shipping.street,
        city: claimed.shipping.city,
        state: claimed.shipping.state,
        pincode: claimed.shipping.zipCode,
        phone: claimed.shipping.phone,
        email: claimed.shipping.email,
      },
      pickup: {
        name: process.env.SENDER_NAME || 'Gopi Misthan Bhandar',
        address: process.env.SENDER_ADDRESS || '',
        city: process.env.SENDER_CITY || '',
        state: process.env.SENDER_STATE || '',
        pincode: process.env.SENDER_PINCODE || '',
        phone: process.env.SENDER_PHONE || '',
        email: process.env.SENDER_EMAIL || '',
      },
      pickup_warehouse_name:
        process.env.NIMBUSPOST_PICKUP_WAREHOUSE_NAME ||
        process.env.SENDER_NAME ||
        'Gopi Misthan Bhandar',
      order_items: (claimed.items || []).map((item: any) => ({
        name: item.name,
        qty: item.quantity,
        price: item.price,
        weight: item.weight,
      })),
      payment_method: nimbusPaymentType,
      total_amount: claimed.total,
      order_amount: String(claimed.total),
      courier_id: String(claimed.selectedCourierId || resolvedCourier?.id || '').trim() || undefined,
      weight: totalWeight,
      length: 10,
      breadth: 10,
      height: 10,
    });

    const timedOut = Symbol('shipment-timeout');
    const shipmentResult: any = await Promise.race([
      shipmentPromise,
      new Promise((resolve) => setTimeout(() => resolve(timedOut), SHIPMENT_TIMEOUT_MS)),
    ]);

    if (shipmentResult === timedOut) {
      console.error(`Shipment creation timed out for ${claimed.orderNumber}; claim kept to avoid double booking.`);
      return false;
    }

    if (!shipmentResult?.status || !shipmentResult?.data) {
      console.error('Shipment creation failed:', shipmentResult?.message || shipmentResult);
      await releaseClaim();
      return false;
    }

    const awb = String(
      shipmentResult.data.awb_number || shipmentResult.data.awb || shipmentResult.data.waybill || ''
    ).trim();

    if (!awb) {
      console.error('Shipment created without an AWB in the response:', shipmentResult);
      await releaseClaim();
      return false;
    }

    await Order.updateOne(
      { _id: orderId },
      {
        $set: {
          awbNumber: awb,
          courierName:
            shipmentResult.data.courier_name ||
            resolvedCourier?.name ||
            claimed.selectedCourier ||
            claimed.courierName,
          ...(claimed.selectedCourier ? {} : resolvedCourier?.name ? { selectedCourier: resolvedCourier.name } : {}),
          ...(claimed.selectedCourierId ? {} : resolvedCourier?.id ? { selectedCourierId: resolvedCourier.id } : {}),
          trackingUrl: `https://nimbuspost.com/track?awb=${awb}`,
          status: 'shipped',
          shipmentStatus: 'shipped',
        },
      }
    );

    return true;
  } catch (error) {
    console.error('Shipment creation threw:', error);
    await releaseClaim();
    return false;
  }
}

/** Everything that must happen once a payment is confirmed. Never throws. */
export async function runPostPaymentFulfillment(orderId: string): Promise<void> {
  try {
    await applyInventoryAndCouponOnce(orderId);
  } catch (error) {
    console.error('Inventory/coupon fulfilment failed:', error);
  }

  try {
    await createShipmentForPaidOrderOnce(orderId);
  } catch (error) {
    console.error('Shipment fulfilment failed:', error);
  }
}
