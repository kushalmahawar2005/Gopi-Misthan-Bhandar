import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const order = await Order.findOne({ orderNumber: params.id }).lean();
    
    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Create PDF
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(186, 6, 6); // Primary red
    doc.text('Gopi Misthan Bhandar', 14, 20);
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text('Traditional Indian Sweets & Snacks', 14, 27);
    doc.text('Neemuch, Madhya Pradesh', 14, 32);
    doc.text(`Invoice #${order.orderNumber}`, 14, 37);

    // Order Details
    doc.setFontSize(12);
    doc.text('Order Details', 14, 50);
    
    const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    doc.setFontSize(10);
    doc.text(`Order Date: ${orderDate}`, 14, 58);
    doc.text(`Order Number: ${order.orderNumber}`, 14, 64);
    doc.text(`Payment Method: ${order.paymentMethod.toUpperCase()}`, 14, 70);
    doc.text(`Status: ${order.status}`, 14, 76);

    // Shipping Address
    doc.setFontSize(12);
    doc.text('Shipping Address', 14, 88);
    doc.setFontSize(10);
    doc.text(order.shipping.name, 14, 96);
    doc.text(order.shipping.street, 14, 102);
    doc.text(`${order.shipping.city}, ${order.shipping.state} ${order.shipping.zipCode}`, 14, 108);
    doc.text(`Phone: ${order.shipping.phone}`, 14, 114);

    // Items Table
    const tableData = order.items.map((item: any) => [
      item.name,
      item.quantity.toString(),
      `₹${item.price.toLocaleString()}`,
      `₹${(item.price * item.quantity).toLocaleString()}`,
    ]);

    autoTable(doc, {
      startY: 125,
      head: [['Product', 'Qty', 'Price', 'Total']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [186, 6, 6] },
      styles: { fontSize: 9 },
    });

    // Calculate final Y position
    const finalY = (doc as any).lastAutoTable.finalY || 125;

    // Price Summary
    doc.setFontSize(10);
    doc.text('Subtotal:', 140, finalY + 10);
    doc.text(`₹${order.subtotal.toLocaleString()}`, 170, finalY + 10, { align: 'right' });
    
    doc.text('Shipping:', 140, finalY + 16);
    doc.text(`₹${order.shippingCost.toLocaleString()}`, 170, finalY + 16, { align: 'right' });
    
    const tax = order.total - order.subtotal - order.shippingCost;
    doc.text('Tax (GST):', 140, finalY + 22);
    doc.text(`₹${tax.toLocaleString()}`, 170, finalY + 22, { align: 'right' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Total:', 140, finalY + 30);
    doc.text(`₹${order.total.toLocaleString()}`, 170, finalY + 30, { align: 'right' });

    // Footer
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('Thank you for your order!', 14, 280);
    doc.text('For queries, contact: info@gopimisthanbhandar.com', 14, 285);

    // Generate PDF buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

    // Return PDF
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${order.orderNumber}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error('Error generating invoice:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

