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

// Brand mark (public/bill.jpg) — printed at the bottom-right corner of the bill.
let cachedBillMark: string | null | undefined;
function getBillMarkDataUri(): string | null {
  if (cachedBillMark !== undefined) return cachedBillMark;
  try {
    const markPath = path.join(process.cwd(), 'public', 'bill.jpg');
    const buf = fs.readFileSync(markPath);
    cachedBillMark = `data:image/jpeg;base64,${buf.toString('base64')}`;
  } catch {
    cachedBillMark = null;
  }
  return cachedBillMark;
}

/** bill.jpg is 567 × 657 px — keep its aspect ratio when scaling. */
const BILL_MARK_ASPECT = 657 / 567;

/**
 * Size-dependent layout tokens (all coordinates in mm, fonts in pt).
 * 'a4' — customer download; '4x6' — compact 4in × 6in for the admin counter printer.
 */
const LAYOUTS = {
  a4: {
    format: 'a4' as string | number[],
    marginX: 14,
    bandH: 3,
    logoXY: [14, 10, 18, 18],
    companyFont: 16, companyY: 16,
    taglineFont: 8, taglineY: 21,
    addrFont: 8, addrY: 25, addrStep: 4,
    invoiceFont: 20, invoiceY: 16,
    metaFont: 8, metaLabelOffset: 55, metaValueOffset: 53, metaY: 23, metaStep: 5,
    headerPad: 6, lineW: 0.5,
    sectionFont: 9, billNameFont: 10, billBodyFont: 8.5, billStep: 4.5, billPad: 8,
    payMethodDY: 13, payStatusDY: 17.5,
    tableStartPad: 8,
    tableHeadFont: 9, tableBodyFont: 9, cellPad: 2.5,
    colQty: 14, colRate: 32, colGst: 16, colAmount: 34,
    totalsBoxW: 84, totalsFont: 9, totalsStep: 6,
    grandFont: 11, grandH: 9, grandPadY: 5,
    notesMinY: 250, notesGap: 16, notesTitleFont: 8.5, notesFont: 7.5, notesStep: 4,
    footerFont: 8.5, footerY: 288,
    markW: 22, markRight: 14, markBottom: 12,
  },
  '4x6': {
    format: [101.6, 152.4] as string | number[],
    marginX: 5,
    bandH: 1.5,
    logoXY: [5, 4, 11, 11],
    companyFont: 10, companyY: 8,
    taglineFont: 5, taglineY: 11,
    addrFont: 5, addrY: 13.5, addrStep: 2.6,
    invoiceFont: 11, invoiceY: 8,
    metaFont: 5, metaLabelOffset: 30, metaValueOffset: 28.5, metaY: 12, metaStep: 3,
    headerPad: 3, lineW: 0.3,
    sectionFont: 5.5, billNameFont: 6.5, billBodyFont: 5.5, billStep: 2.8, billPad: 4,
    payMethodDY: 7.5, payStatusDY: 10.3,
    tableStartPad: 4,
    tableHeadFont: 5.5, tableBodyFont: 5.5, cellPad: 1.1,
    colQty: 7, colRate: 16, colGst: 9, colAmount: 17,
    totalsBoxW: 44, totalsFont: 5.5, totalsStep: 3.4,
    grandFont: 7, grandH: 5.5, grandPadY: 3,
    notesMinY: 122, notesGap: 8, notesTitleFont: 5.5, notesFont: 4.5, notesStep: 2.4,
    footerFont: 5.5, footerY: 148,
    markW: 12, markRight: 4, markBottom: 8,
  },
} as const;

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
    const size = request.nextUrl.searchParams.get('size') === '4x6' ? '4x6' : 'a4';
    const L = LAYOUTS[size];

    const doc = new jsPDF({ unit: 'mm', format: L.format as any });
    const pageW = doc.internal.pageSize.getWidth();
    const marginX = L.marginX;
    const rightX = pageW - marginX;

    // Header band
    doc.setFillColor(...BRAND);
    doc.rect(0, 0, pageW, L.bandH, 'F');

    const logo = getLogoDataUri();
    let textX = marginX;
    if (logo) {
      try {
        const [lx, ly, lw, lh] = L.logoXY;
        doc.addImage(logo, 'PNG', lx, ly, lw, lh);
        textX = marginX + L.logoXY[2] + 4;
      } catch {
        /* ignore bad image */
      }
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(L.companyFont);
    doc.setTextColor(...INK);
    doc.text(COMPANY.name, textX, L.companyY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(L.taglineFont);
    doc.setTextColor(...MUTED);
    doc.text(COMPANY.tagline, textX, L.taglineY);
    doc.setFontSize(L.addrFont);
    let hy = L.addrY;
    for (const line of COMPANY.addressLines) {
      doc.text(line, textX, hy);
      hy += L.addrStep;
    }
    doc.text(`${COMPANY.phone}  •  ${COMPANY.email}`, textX, hy);
    if (COMPANY.gstin) {
      hy += L.addrStep;
      doc.text(`GSTIN: ${COMPANY.gstin}`, textX, hy);
    }

    // INVOICE label + meta (right)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(L.invoiceFont);
    doc.setTextColor(...BRAND);
    doc.text('INVOICE', rightX, L.invoiceY, { align: 'right' });

    doc.setFontSize(L.metaFont);
    doc.setTextColor(...INK);
    const meta: [string, string][] = [
      ['Invoice No:', invoice.invoiceNumber],
      ['Invoice Date:', formatInvoiceDate(invoice.invoiceDate)],
      ['Due Date:', formatInvoiceDate(invoice.dueDate)],
      ['Order No:', invoice.orderNumber],
    ];
    // Labels right-aligned in a fixed column, values left-aligned after them —
    // avoids overlap even when the invoice / order number is long.
    const labelRight = rightX - L.metaLabelOffset;
    const valueLeft = rightX - L.metaValueOffset;
    let my = L.metaY;
    for (const [label, value] of meta) {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...MUTED);
      doc.text(label, labelRight, my, { align: 'right' });
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...INK);
      doc.text(value, valueLeft, my);
      my += L.metaStep;
    }

    const headerBottom = Math.max(hy, my) + L.headerPad;
    doc.setDrawColor(...BRAND);
    doc.setLineWidth(L.lineW);
    doc.line(marginX, headerBottom, rightX, headerBottom);

    // Bill To
    let by = headerBottom + L.billPad;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(L.sectionFont);
    doc.setTextColor(...BRAND);
    doc.text('BILL TO', marginX, by);
    by += L.billStep + 0.5;
    doc.setTextColor(...INK);
    doc.setFontSize(L.billNameFont);
    doc.text(invoice.billTo.name, marginX, by);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(L.billBodyFont);
    doc.setTextColor(...MUTED);
    for (const line of invoice.billTo.addressLines) {
      by += L.billStep;
      doc.text(line, marginX, by);
    }
    if (invoice.billTo.phone) {
      by += L.billStep;
      doc.text(`Phone: ${invoice.billTo.phone}`, marginX, by);
    }
    if (invoice.billTo.email) {
      by += L.billStep;
      doc.text(`Email: ${invoice.billTo.email}`, marginX, by);
    }

    // Payment (right)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(L.sectionFont);
    doc.setTextColor(...BRAND);
    doc.text('PAYMENT', rightX, headerBottom + L.billPad, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(L.billBodyFont);
    doc.setTextColor(...MUTED);
    doc.text(`Method: ${invoice.paymentMethod}`, rightX, headerBottom + L.payMethodDY, { align: 'right' });
    doc.text(`Status: ${invoice.paymentStatus}`, rightX, headerBottom + L.payStatusDY, { align: 'right' });

    // Items table
    const body = invoice.items.map((item) => [
      item.weight ? `${item.name}\n${item.weight}` : item.name,
      String(item.quantity),
      rupee(item.rate),
      item.taxRate === 0 ? 'Nil' : `${item.taxRate}%`,
      rupee(item.amount),
    ]);

    autoTable(doc, {
      startY: by + L.tableStartPad,
      head: [['Description', 'Qty', 'Rate', 'GST%', 'Amount']],
      body,
      theme: 'striped',
      headStyles: { fillColor: INK, textColor: [255, 255, 255], fontSize: L.tableHeadFont, halign: 'left' },
      styles: { fontSize: L.tableBodyFont, cellPadding: L.cellPad, textColor: INK },
      alternateRowStyles: { fillColor: [255, 248, 240] },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { halign: 'center', cellWidth: L.colQty },
        2: { halign: 'right', cellWidth: L.colRate },
        3: { halign: 'center', cellWidth: L.colGst },
        4: { halign: 'right', cellWidth: L.colAmount },
      },
      margin: { left: marginX, right: marginX },
    });

    let finalY = (doc as any).lastAutoTable.finalY || by + L.tableStartPad;

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

    const boxW = L.totalsBoxW;
    const boxX = rightX - boxW;
    let ty = finalY + L.billPad;
    doc.setFontSize(L.totalsFont);
    for (const [label, value] of totals) {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...MUTED);
      doc.text(label, boxX, ty);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...INK);
      doc.text(value, rightX, ty, { align: 'right' });
      ty += L.totalsStep;
    }

    // Grand total bar
    ty += 1;
    doc.setFillColor(...BRAND);
    doc.roundedRect(boxX - 2, ty - L.grandPadY, boxW + 2, L.grandH, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(L.grandFont);
    doc.setTextColor(255, 255, 255);
    doc.text('Grand Total', boxX + 1, ty + 1);
    doc.text(rupee(invoice.grandTotal), rightX - 2, ty + 1, { align: 'right' });

    // Notes / terms footer
    const notesY = Math.max(ty + L.notesGap, L.notesMinY);
    doc.setDrawColor(224, 211, 200);
    doc.setLineWidth(0.2);
    doc.line(marginX, notesY, rightX, notesY);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(L.notesTitleFont);
    doc.setTextColor(...INK);
    doc.text('Notes & Terms', marginX, notesY + L.notesStep + 1);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(L.notesFont);
    doc.setTextColor(...MUTED);
    const notes = [
      'All prices are inclusive of applicable GST. This is a computer-generated invoice.',
      'Sweets & perishable food items are non-returnable once delivered.',
      `For queries about this invoice, contact ${COMPANY.email} or ${COMPANY.phone}.`,
    ];
    let ny = notesY + (L.notesStep + 1) * 2;
    for (const n of notes) {
      doc.text(`•  ${n}`, marginX, ny);
      ny += L.notesStep;
    }
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...BRAND);
    doc.setFontSize(L.footerFont);
    doc.text(
      `Thank you for shopping with ${COMPANY.name}!  •  ${COMPANY.website}`,
      pageW / 2,
      L.footerY,
      { align: 'center' }
    );

    // Brand mark — bottom-right corner of the last page.
    const billMark = getBillMarkDataUri();
    if (billMark) {
      try {
        const pageH = doc.internal.pageSize.getHeight();
        const markH = L.markW * BILL_MARK_ASPECT;
        doc.addImage(
          billMark,
          'JPEG',
          rightX - L.markW + (L.marginX - L.markRight),
          pageH - L.markBottom - markH,
          L.markW,
          markH
        );
      } catch {
        /* ignore bad image */
      }
    }

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
