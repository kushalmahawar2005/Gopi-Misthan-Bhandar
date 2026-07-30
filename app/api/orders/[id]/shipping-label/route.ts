import { NextRequest, NextResponse } from 'next/server';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { getRequestAuth } from '@/lib/auth';
import { getShipmentManifest } from '@/lib/nimbuspost';
import { generateCode128DataUri } from '@/lib/barcode';
import { parseWeightToKg } from '@/lib/weight';

const SENDER = {
  name: process.env.SENDER_NAME || 'Gopi Misthan Bhandar',
  phone: process.env.SENDER_PHONE || '6350030483',
  address: process.env.SENDER_ADDRESS || 'G-3, PATEL PLAZA, TAGORE MARG NEEMUCH (M.P)',
  city: process.env.SENDER_CITY || 'Neemuch',
  state: process.env.SENDER_STATE || 'Madhya Pradesh',
  pincode: process.env.SENDER_PINCODE || '458441',
  gstin: '23AAAAA0000A1Z5',
};

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

    // Find order by orderNumber or _id
    let order = await Order.findOne({ orderNumber: params.id }).lean() as any;
    if (!order) {
      order = await Order.findById(params.id).lean() as any;
    }

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    const isOwner = order.userId && String(order.userId) === auth.user.id;
    if (!auth.isAdmin && !isOwner) {
      return NextResponse.json(
        { success: false, error: 'Forbidden. Access denied.' },
        { status: 403 }
      );
    }

    const mode = request.nextUrl.searchParams.get('mode'); // 'nimbus' or 'custom'

    // If Nimbus mode or order has AWB, try fetching NimbusPost manifest label PDF first unless custom requested
    if (order.awbNumber && mode !== 'custom') {
      try {
        const manifestRes = await getShipmentManifest([order.awbNumber]);
        if (manifestRes && manifestRes.status && manifestRes.data) {
          const manifestUrl = typeof manifestRes.data === 'string' ? manifestRes.data : manifestRes.data.label_url || manifestRes.data.manifest_url;
          if (manifestUrl && typeof manifestUrl === 'string') {
            return NextResponse.redirect(manifestUrl);
          }
        }
      } catch (err) {
        console.error('Failed to fetch Nimbus label, falling back to custom generated label:', err);
      }
    }

    // ---------- Generate 4in x 6in Amazon-style Thermal Shipping Label PDF ----------
    // Size: 4in x 6in = 101.6mm x 152.4mm
    const doc = new jsPDF({ unit: 'mm', format: [101.6, 152.4] });
    const pageW = 101.6;
    const pageH = 152.4;
    const margin = 3;
    const rightX = pageW - margin;

    // Outer border
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.rect(margin, margin, pageW - margin * 2, pageH - margin * 2);

    let curY = margin + 2;

    // 1. TOP SECTION: BARCODE (LEFT) & DESTINATION BOXES (RIGHT)
    const awbText = order.awbNumber || order.orderNumber;
    const barcodeUri = generateCode128DataUri(awbText, 60, 2);
    
    if (barcodeUri) {
      doc.addImage(barcodeUri, 'SVG', margin + 2, curY, 52, 16);
    }
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);
    doc.text(`AWB ${awbText}`, margin + 28, curY + 20, { align: 'center' });

    // Right Side Information Grid
    const gridX = 60;
    const gridW = pageW - margin - gridX - 2;

    // Destination station (e.g. city prefix / SUR)
    const destCode = (order.shipping?.city || 'DEL').substring(0, 3).toUpperCase();
    
    // Calculate Total Weight in KG
    let totalWeightKg = 0;
    if (Array.isArray(order.items)) {
      totalWeightKg = order.items.reduce((acc: number, item: any) => {
        const itemW = parseWeightToKg(item.weight || '');
        return acc + (itemW > 0 ? itemW : 0.25) * (item.quantity || 1);
      }, 0);
    }
    if (totalWeightKg <= 0) totalWeightKg = 0.5;

    // Draw Destination Code box
    doc.setLineWidth(0.4);
    doc.rect(gridX, curY, gridW, 7);
    doc.setFontSize(11);
    doc.text(destCode, gridX + gridW / 2, curY + 5.5, { align: 'center' });

    // Draw Weight box
    doc.rect(gridX, curY + 7, gridW, 5);
    doc.setFontSize(7.5);
    doc.text(`${totalWeightKg.toFixed(2)} kgs`, gridX + gridW / 2, curY + 10.5, { align: 'center' });

    // Draw Date box
    const orderDate = new Date(order.createdAt || Date.now());
    const dateStr = `${String(orderDate.getDate()).padStart(2, '0')}/${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
    doc.rect(gridX, curY + 12, gridW, 5);
    doc.text(dateStr, gridX + gridW / 2, curY + 15.5, { align: 'center' });

    // Draw Payment Mode Box (COD / PREPAID)
    const isCod = order.paymentMethod?.toLowerCase() === 'cod';
    doc.rect(gridX, curY + 17, gridW, 6);
    doc.setFontSize(9);
    doc.text(isCod ? 'COD' : 'PREPAID', gridX + gridW / 2, curY + 21.5, { align: 'center' });

    curY += 25;
    doc.line(margin, curY, rightX, curY);

    // 2. MIDDLE SECTION: SHIP TO & DELIVERY STATION
    curY += 3;
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.text('Ship To:', margin + 2, curY);

    // Right Box: "BOX 1 of 1"
    doc.rect(pageW - margin - 22, curY - 2.5, 20, 5);
    doc.setFontSize(7);
    doc.text('BOX 1 of 1', pageW - margin - 12, curY + 1, { align: 'center' });

    curY += 4.5;
    doc.setFontSize(8.5);
    doc.text(order.shipping?.name || 'Customer Name', margin + 2, curY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    const addrLines = [
      order.shipping?.street || '',
      `${order.shipping?.city || ''} ${order.shipping?.zipCode || ''}`,
      `${order.shipping?.state || ''} INDIA`,
    ].filter(Boolean);

    for (const line of addrLines) {
      curY += 3.8;
      doc.text(line, margin + 2, curY);
    }

    if (order.shipping?.phone) {
      curY += 3.8;
      doc.setFont('helvetica', 'bold');
      doc.text(`Phone: ${order.shipping.phone}`, margin + 2, curY);
    }

    // Delivery station boxes (right side)
    const dsY = curY - 12;
    const dsX = pageW - margin - 38;
    
    doc.setLineWidth(0.3);
    doc.rect(dsX, dsY, 12, 10);
    doc.rect(dsX + 12, dsY, 12, 10);
    doc.rect(dsX + 24, dsY, 12, 10);

    doc.setFontSize(5);
    doc.setFont('helvetica', 'bold');
    doc.text('DELIVERY STATION', dsX + 6, dsY + 2.5, { align: 'center' });
    doc.text('SECTOR', dsX + 18, dsY + 2.5, { align: 'center' });
    doc.text('SORTZONE', dsX + 30, dsY + 2.5, { align: 'center' });

    doc.setFontSize(9);
    doc.text(destCode, dsX + 6, dsY + 8, { align: 'center' });
    doc.text('X', dsX + 18, dsY + 8, { align: 'center' });
    doc.text('X', dsX + 30, dsY + 8, { align: 'center' });

    curY += 4;
    doc.setLineWidth(0.5);
    doc.line(margin, curY, rightX, curY);

    // 3. ORDER ID & SHIP DATE LINE
    curY += 4;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    const shipDateFormatted = `${orderDate.getDate()}/${orderDate.getMonth() + 1}/${orderDate.getFullYear()}`;
    doc.text(`Order Id: ${order.orderNumber}`, margin + 2, curY);
    doc.text(`Ship Date: ${shipDateFormatted}`, margin + 55, curY);

    curY += 2;
    doc.line(margin, curY, rightX, curY);

    // 4. DECORATIVE BARCODE MATRIX / SEPARATOR
    curY += 2;
    const barcodeMatrixUri = generateCode128DataUri(`REF-${order.orderNumber}`, 40, 1.5);
    if (barcodeMatrixUri) {
      doc.addImage(barcodeMatrixUri, 'SVG', margin + 4, curY, 88, 10);
    }
    curY += 12;
    doc.line(margin, curY, rightX, curY);

    // 5. SHIP FROM SECTION
    curY += 3.5;
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text(`Ship From: ${SENDER.name.toUpperCase()}`, margin + 2, curY);

    curY += 3.5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.text(`Return Address: ${SENDER.address}, ${SENDER.city}, ${SENDER.state} ${SENDER.pincode} India`, margin + 2, curY);

    curY += 3;
    doc.line(margin, curY, rightX, curY);

    // 6. CUSTOMER SELF DECLARATION & TABLE
    curY += 3;
    doc.setFontSize(6);
    doc.setFont('helvetica', 'bold');
    doc.text('Customer Self Declaration : The goods sold are intended for end user consumption. Not for resale.', margin + 2, curY);

    const itemsSummary = (order.items || []).map((i: any) => i.name).join(', ').substring(0, 30) || 'FOOD ITEMS';
    const invoiceNum = `IN-${order.orderNumber.slice(-4)}`;

    autoTable(doc, {
      startY: curY + 1.5,
      head: [['#', 'SELLER', 'GSTIN', 'INVOICE', 'DATE', 'ITEM TYPE']],
      body: [
        ['1', SENDER.name, SENDER.gstin, invoiceNum, shipDateFormatted, itemsSummary]
      ],
      theme: 'grid',
      headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontSize: 5.5, fontStyle: 'bold', halign: 'center', lineWidth: 0.2, lineColor: [0, 0, 0] },
      styles: { fontSize: 5.5, textColor: [0, 0, 0], halign: 'center', cellPadding: 1, lineWidth: 0.2, lineColor: [0, 0, 0] },
      margin: { left: margin + 1, right: margin + 1 }
    });

    curY = (doc as any).lastAutoTable.finalY + 3;

    // 7. BOTTOM SORT MATRIX BOXES
    const matrixCodes = ['BHLA', 'BERD', 'MJAL', 'MJAX 3 A15', 'NCRU A YYN', 'MIXJ S P05', 'UHPD', 'UHP'];
    const cellW = (pageW - margin * 2 - 2) / matrixCodes.length;
    
    doc.setLineWidth(0.3);
    for (let i = 0; i < matrixCodes.length; i++) {
      const cx = margin + 1 + i * cellW;
      doc.rect(cx, curY, cellW, 10);
      doc.setFontSize(5);
      doc.setFont('helvetica', 'bold');
      
      const parts = matrixCodes[i].split(' ');
      if (parts.length > 1) {
        doc.text(parts[0], cx + cellW / 2, curY + 3.5, { align: 'center' });
        doc.text(parts.slice(1).join(' '), cx + cellW / 2, curY + 7.5, { align: 'center' });
      } else {
        doc.text(matrixCodes[i], cx + cellW / 2, curY + 6, { align: 'center' });
      }
    }

    curY += 12;

    // 8. FOOTER
    doc.setFontSize(6);
    doc.setFont('helvetica', 'bold');
    doc.text('Sold on: www.gopimisthanbhandar.com', margin + 2, pageH - margin - 2);
    doc.text(SENDER.name.toUpperCase(), rightX - 2, pageH - margin - 2, { align: 'right' });

    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="shipping-label-${order.orderNumber}.pdf"`,
      },
    });

  } catch (error: any) {
    console.error('Error generating shipping label:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
