import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { getRequestAuth } from '@/lib/auth';
import { getShipmentManifest } from '@/lib/nimbuspost';

/**
 * Shipping label info for an order.
 *
 * NimbusPost's public API has NO label endpoint — verified against their own
 * PHP SDK and by probing /shipments/label, /shipments/labels,
 * /shipments/print-label and /shipments/label/{awb} (all 403). The printable
 * label exists only inside the NimbusPost panel (Shipments -> Print Label).
 *
 * So we return the AWB plus a panel link, and best-effort attach the manifest
 * (the one document their API does expose) when it is available.
 */
const NIMBUS_PANEL_SHIPMENTS_URL = 'https://ship.nimbuspost.com/shipping/all?page=1&limit=50';
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const wantsJson = request.nextUrl.searchParams.get('json') === '1';

  const fail = (status: number, error: string, code: string) =>
    NextResponse.json({ success: false, error, code }, { status });

  try {
    const auth = await getRequestAuth(request);
    if (!auth.isAuthenticated) {
      return fail(401, 'Unauthorized. Login required.', 'UNAUTHORIZED');
    }
    if (!auth.isAdmin) {
      return fail(403, 'Forbidden. Admin access required.', 'FORBIDDEN');
    }

    await connectDB();

    // Find order by orderNumber or _id
    let order = await Order.findOne({ orderNumber: params.id }).lean() as any;
    if (!order) {
      order = await Order.findById(params.id).lean() as any;
    }

    if (!order) {
      return fail(404, 'Order not found', 'ORDER_NOT_FOUND');
    }

    if (!order.awbNumber) {
      return fail(
        409,
        'No shipment has been created for this order yet. Create it from the Delivery (NimbusPost) page first, then the label will be available.',
        'NO_SHIPMENT'
      );
    }

    // Manifest is optional — it only exists while a pickup is pending, and it
    // is a handover sheet, not the parcel label. Never let it fail the request.
    let manifestUrl: string | null = null;
    try {
      const manifestRes = await getShipmentManifest([order.awbNumber]);
      if (manifestRes?.status && manifestRes.data) {
        const url =
          typeof manifestRes.data === 'string'
            ? manifestRes.data
            : manifestRes.data.manifest_url || manifestRes.data.label_url;
        if (url && typeof url === 'string') {
          manifestUrl = url;
        }
      }
    } catch (err) {
      console.error('Manifest fetch failed (non-fatal):', err);
    }

    if (wantsJson) {
      return NextResponse.json({
        success: true,
        awbNumber: order.awbNumber,
        courierName: order.courierName || null,
        orderNumber: order.orderNumber,
        trackingUrl: order.trackingUrl || null,
        panelUrl: NIMBUS_PANEL_SHIPMENTS_URL,
        manifestUrl,
      });
    }

    // Non-JSON callers get sent straight to the panel, where Print Label lives.
    return NextResponse.redirect(NIMBUS_PANEL_SHIPMENTS_URL);
  } catch (error: any) {
    console.error('Error fetching shipping label:', error);
    return fail(500, error?.message || 'Label fetch failed', 'SERVER_ERROR');
  }
}
