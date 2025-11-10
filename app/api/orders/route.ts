import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { sendOrderConfirmationEmail } from '@/lib/email';
import { sendOrderConfirmationSMS } from '@/lib/sms';

// GET all orders
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const email = searchParams.get('email');
    const status = searchParams.get('status');

    let query: any = {};

    // If userId is provided, filter by userId
    if (userId) {
      query.userId = userId;
    }
    // If email is provided but no userId, filter by shipping email
    else if (email) {
      query['shipping.email'] = email;
    }

    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: orders }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST create new order
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    // Generate order number if not provided
    if (!body.orderNumber) {
      const count = await Order.countDocuments() || 0;
      body.orderNumber = `ORD-${Date.now()}-${count + 1}`;
    }
    
    const order = await Order.create(body);

    // Send order confirmation email (async, don't wait for it)
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
        createdAt: order.createdAt instanceof Date ? order.createdAt.toISOString() : String(order.createdAt),
      }).catch((error) => {
        console.error('Error sending order confirmation email:', error);
        // Don't fail the order creation if email fails
      });
    }

    // Send order confirmation SMS (async, don't wait for it)
    if (order.shipping?.phone) {
      sendOrderConfirmationSMS(
        order.shipping.phone,
        order.orderNumber,
        order.total
      ).catch((error) => {
        console.error('Error sending order confirmation SMS:', error);
        // Don't fail the order creation if SMS fails
      });
    }

    return NextResponse.json({ success: true, data: order }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

