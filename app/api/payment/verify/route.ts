import { NextRequest, NextResponse } from 'next/server';
import { verifyPayment } from '@/lib/razorpay';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { sendOrderConfirmationEmail } from '@/lib/email';
import { sendOrderConfirmationSMS } from '@/lib/sms';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, paymentId, signature, razorpayOrderId } = body;

    if (!orderId || !paymentId || !signature || !razorpayOrderId) {
      return NextResponse.json(
        { success: false, error: 'Missing required payment details' },
        { status: 400 }
      );
    }

    // Verify payment signature
    const verification = await verifyPayment(razorpayOrderId, paymentId, signature);

    if (!verification.success) {
      return NextResponse.json(
        { success: false, error: verification.error || 'Payment verification failed' },
        { status: 400 }
      );
    }

    // Update order status in database
    await connectDB();
    const order = await Order.findOneAndUpdate(
      { orderNumber: orderId },
      {
        $set: {
          paymentStatus: 'paid',
          paymentId: paymentId,
          razorpayOrderId: razorpayOrderId,
        },
      },
      { new: true }
    );

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Send order confirmation email
    if (order.shipping?.email) {
      sendOrderConfirmationEmail(order.shipping.email, {
        orderNumber: order.orderNumber,
        items: order.items.map((item: any) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        total: order.total,
        shipping: {
          name: order.shipping.name,
          address: order.shipping.street,
          city: order.shipping.city,
          state: order.shipping.state,
          zipCode: order.shipping.zipCode,
          phone: order.shipping.phone,
        },
        paymentMethod: order.paymentMethod,
        createdAt: order.createdAt,
      }).catch((error) => {
        console.error('Error sending order confirmation email:', error);
        // Don't fail payment verification if email fails
      });
    }

    // Send order confirmation SMS
    if (order.shipping?.phone) {
      sendOrderConfirmationSMS(
        order.shipping.phone,
        order.orderNumber,
        order.total
      ).catch((error) => {
        console.error('Error sending order confirmation SMS:', error);
        // Don't fail payment verification if SMS fails
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      order: order,
    });
  } catch (error: any) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error verifying payment' },
      { status: 500 }
    );
  }
}

