import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { getRequestAuth } from '@/lib/auth';
import {
  buildInvoiceData,
  formatINR,
  formatInvoiceDate,
  COMPANY,
} from '@/lib/invoice';

// Brand theme (saffron / brown) — matches the storefront.
const BRAND: [number, number, number] = [254, 142, 2]; // #FE8E02
const INK: [number, number, number] = [51, 24, 24]; // #331818
const MUTED: [number, number, number] = [120, 110, 105];

// jsPDF's built-in Helvetica has no ₹ glyph (it prints as "¹"), so use "Rs."
// in the PDF. The on-screen react-to-print invoice keeps the ₹ symbol.
const rupee = (n: number): string => formatINR(n).replace('₹', 'Rs. ');

// Cache the logo as a base64 data URI across requests.
let cachedLogo: string | null | undefined;
function getLogoDataUri(): string | null {
  if (cachedLogo !== undefined) return cachedLogo;
  try {
    const logoPath = path.join(process.cwd(), 'public', 'logo.png');
    const buf = fs.readFileSync(logoPath);
    cachedLogo = `data:image/png;base64,${buf.toString('base64')}`;
  } catch {
    cachedLogo = null;
  }
  return cachedLogo;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await getRequestAuth(request);
    if (!auth.isAuthenticated || !auth.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Login required.' },
        { status: 401 }
      );
    }

    await connectDB();

    const order = (await Order.findOne({ orderNumber: params.id }).lean()) as any;
    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    const isOwner = order.userId && String(order.userId) === auth.user.id;
    if (!auth.isAdmin && !isOwner) {
      return NextResponse.json(
        { success: false, error: 'Forbidden. You cannot access this invoice.' },
        { status: 403 }
      );
    }

    const invoice = buildInvoiceData(order);

    // JSON mode powers the on-screen React invoice (/orders/invoice/[id]).
    if (request.nextUrl.searchParams.get('format') === 'json') {
      return NextResponse.json({ success: true, data: invoice }, { status: 200 });
    }

    // ---------- PDF (server-side, also reusable for email/save) ----------
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const marginX = 14;
    const rightX = pageW - marginX;

    // Header band
    doc.setFillColor(...BRAND);
    doc.rect(0, 0, pageW, 3, 'F');

    const logo = getLogoDataUri();
    let textX = marginX;
    if (logo) {
      try {
        doc.addImage(logo, 'PNG', marginX, 10, 18, 18);
        textX = marginX + 22;
      } catch {
        /* ignore bad image */
      }
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(...INK);
    doc.text(COMPANY.name, textX, 16);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text(COMPANY.tagline, textX, 21);
    let hy = 25;
    for (const line of COMPANY.addressLines) {
      doc.text(line, textX, hy);
      hy += 4;
    }
    doc.text(`${COMPANY.phone}  •  ${COMPANY.email}`, textX, hy);
    hy += 4;
    doc.text(`GSTIN: ${COMPANY.gstin}`, textX, hy);

    // INVOICE label + meta (right)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(...BRAND);
    doc.text('INVOICE', rightX, 16, { align: 'right' });

    doc.setFontSize(8);
    doc.setTextColor(...INK);
    const meta: [string, string][] = [
      ['Invoice No:', invoice.invoiceNumber],
      ['Invoice Date:', formatInvoiceDate(invoice.invoiceDate)],
      ['Due Date:', formatInvoiceDate(invoice.dueDate)],
      ['Order No:', invoice.orderNumber],
    ];
    // Labels right-aligned in a fixed column, values left-aligned after them —
    // avoids overlap even when the invoice / order number is long.
    const labelRight = rightX - 55;
    const valueLeft = rightX - 53;
    let my = 23;
    for (const [label, value] of meta) {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...MUTED);
      doc.text(label, labelRight, my, { align: 'right' });
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...INK);
      doc.text(value, valueLeft, my);
      my += 5;
    }

    const headerBottom = Math.max(hy, my) + 6;
    doc.setDrawColor(...BRAND);
    doc.setLineWidth(0.5);
    doc.line(marginX, headerBottom, rightX, headerBottom);

    // Bill To
    let by = headerBottom + 8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...BRAND);
    doc.text('BILL TO', marginX, by);
    by += 5;
    doc.setTextColor(...INK);
    doc.setFontSize(10);
    doc.text(invoice.billTo.name, marginX, by);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...MUTED);
    for (const line of invoice.billTo.addressLines) {
      by += 4.5;
      doc.text(line, marginX, by);
    }
    if (invoice.billTo.phone) {
      by += 4.5;
      doc.text(`Phone: ${invoice.billTo.phone}`, marginX, by);
    }
    if (invoice.billTo.email) {
      by += 4.5;
      doc.text(`Email: ${invoice.billTo.email}`, marginX, by);
    }

    // Payment (right)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...BRAND);
    doc.text('PAYMENT', rightX, headerBottom + 8, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...MUTED);
    doc.text(`Method: ${invoice.paymentMethod}`, rightX, headerBottom + 13, { align: 'right' });
    doc.text(`Status: ${invoice.paymentStatus}`, rightX, headerBottom + 17.5, { align: 'right' });

    // Items table
    const body = invoice.items.map((item) => [
      item.weight ? `${item.name}\n${item.weight}` : item.name,
      String(item.quantity),
      rupee(item.rate),
      item.taxRate === 0 ? 'Nil' : `${item.taxRate}%`,
      rupee(item.amount),
    ]);

    autoTable(doc, {
      startY: by + 8,
      head: [['Description', 'Qty', 'Rate', 'GST%', 'Amount']],
      body,
      theme: 'striped',
      headStyles: { fillColor: INK, textColor: [255, 255, 255], fontSize: 9, halign: 'left' },
      styles: { fontSize: 9, cellPadding: 2.5, textColor: INK },
      alternateRowStyles: { fillColor: [255, 248, 240] },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { halign: 'center', cellWidth: 14 },
        2: { halign: 'right', cellWidth: 32 },
        3: { halign: 'center', cellWidth: 16 },
        4: { halign: 'right', cellWidth: 34 },
      },
      margin: { left: marginX, right: marginX },
    });

    let finalY = (doc as any).lastAutoTable.finalY || by + 8;

    // Totals block (right aligned)
    const totals: [string, string][] = [
      ['Taxable Value', rupee(invoice.taxableValue)],
      [`CGST (${invoice.taxRate / 2}%)`, rupee(invoice.cgst)],
      [`SGST (${invoice.taxRate / 2}%)`, rupee(invoice.sgst)],
      ['Shipping', rupee(invoice.shippingCost)],
    ];
    if (invoice.discount > 0) {
      totals.push([
        invoice.couponCode ? `Discount (${invoice.couponCode})` : 'Discount',
        `- ${rupee(invoice.discount)}`,
      ]);
    }
    if (Math.abs(invoice.roundOff) >= 0.01) {
      totals.push(['Round Off', rupee(invoice.roundOff)]);
    }

    const boxW = 84;
    const boxX = rightX - boxW;
    let ty = finalY + 8;
    doc.setFontSize(9);
    for (const [label, value] of totals) {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...MUTED);
      doc.text(label, boxX, ty);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...INK);
      doc.text(value, rightX, ty, { align: 'right' });
      ty += 6;
    }

    // Grand total bar
    ty += 1;
    doc.setFillColor(...BRAND);
    doc.roundedRect(boxX - 2, ty - 5, boxW + 2, 9, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text('Grand Total', boxX + 1, ty + 1);
    doc.text(rupee(invoice.grandTotal), rightX - 2, ty + 1, { align: 'right' });

    // Notes / terms footer
    const notesY = Math.max(ty + 16, 250);
    doc.setDrawColor(224, 211, 200);
    doc.setLineWidth(0.2);
    doc.line(marginX, notesY, rightX, notesY);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...INK);
    doc.text('Notes & Terms', marginX, notesY + 5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...MUTED);
    const notes = [
      'All prices are inclusive of applicable GST. This is a computer-generated invoice.',
      'Sweets & perishable food items are non-returnable once delivered.',
      `For queries about this invoice, contact ${COMPANY.email} or ${COMPANY.phone}.`,
    ];
    let ny = notesY + 10;
    for (const n of notes) {
      doc.text(`•  ${n}`, marginX, ny);
      ny += 4;
    }
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...BRAND);
    doc.setFontSize(8.5);
    doc.text(
      `Thank you for shopping with ${COMPANY.name}!  •  ${COMPANY.website}`,
      pageW / 2,
      288,
      { align: 'center' }
    );

    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
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
