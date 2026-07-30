'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FiPrinter, FiDownload, FiArrowLeft, FiExternalLink } from 'react-icons/fi';
import { generateCode128Svg } from '@/lib/barcode';

interface Order {
  _id: string;
  orderNumber: string;
  items: any[];
  shipping: any;
  subtotal: number;
  shippingCost: number;
  total: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
  awbNumber?: string;
  courierName?: string;
}

const SENDER = {
  name: process.env.NEXT_PUBLIC_SENDER_NAME || 'Gopi Misthan Bhandar',
  phone: process.env.NEXT_PUBLIC_SENDER_PHONE || '6350030483',
  address: process.env.NEXT_PUBLIC_SENDER_ADDRESS || 'G-3, PATEL PLAZA, TAGORE MARG NEEMUCH (M.P)',
  city: process.env.NEXT_PUBLIC_SENDER_CITY || 'Neemuch',
  state: process.env.NEXT_PUBLIC_SENDER_STATE || 'Madhya Pradesh',
  pincode: process.env.NEXT_PUBLIC_SENDER_PINCODE || '458441',
  gstin: '23AAAAA0000A1Z5',
};

export default function ShippingLabelPrintPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [params.id]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/orders/${params.id}`);
      const data = await response.json();
      if (data.success) {
        setOrder(data.data);
      }
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        <p className="text-gray-600 font-medium">Order not found.</p>
        <button onClick={() => router.back()} className="mt-4 px-4 py-2 bg-gray-800 text-white rounded-lg">
          Go Back
        </button>
      </div>
    );
  }

  const awbCode = order.awbNumber || order.orderNumber;
  const barcodeSvg = generateCode128Svg(awbCode, 60, 2);
  const barcodeRefSvg = generateCode128Svg(`REF-${order.orderNumber}`, 40, 1.5);
  const destCode = (order.shipping?.city || 'DEL').substring(0, 3).toUpperCase();
  const isCod = order.paymentMethod?.toLowerCase() === 'cod';

  const orderDate = new Date(order.createdAt || Date.now());
  const dateStr = `${String(orderDate.getDate()).padStart(2, '0')}/${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
  const fullDateStr = `${orderDate.getDate()}/${orderDate.getMonth() + 1}/${orderDate.getFullYear()}`;

  // Weight calculation
  let totalWeightKg = 0;
  if (Array.isArray(order.items)) {
    totalWeightKg = order.items.reduce((acc: number, item: any) => {
      const wStr = String(item.weight || '');
      let w = 0.25;
      if (wStr.includes('kg')) w = parseFloat(wStr);
      else if (wStr.includes('gm') || wStr.includes('g')) w = parseFloat(wStr) / 1000;
      return acc + (isNaN(w) || w <= 0 ? 0.25 : w) * (item.quantity || 1);
    }, 0);
  }
  if (totalWeightKg <= 0) totalWeightKg = 0.5;

  const itemsSummary = (order.items || []).map((i: any) => i.name).join(', ').substring(0, 32) || 'FOOD ITEMS';

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 flex flex-col items-center">
      {/* Top Action Bar (Hidden when printing) */}
      <div className="no-print w-full max-w-[420px] bg-white p-4 rounded-xl shadow-md mb-6 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-gray-900"
          >
            <FiArrowLeft size={16} /> Back
          </button>
          <span className="text-xs font-bold text-gray-400">Order: {order.orderNumber}</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 bg-gray-900 text-white py-2.5 px-4 rounded-lg font-bold text-xs hover:bg-black transition-colors"
          >
            <FiPrinter size={16} /> Print Label
          </button>
          <a
            href={`/api/orders/${order.orderNumber}/shipping-label?mode=custom`}
            download
            className="flex items-center justify-center gap-2 bg-[#F88E0C] text-white py-2.5 px-4 rounded-lg font-bold text-xs hover:bg-[#D87A0A] transition-colors"
          >
            <FiDownload size={16} /> Download PDF
          </a>
        </div>

        {order.awbNumber && (
          <a
            href={`/api/orders/${order.orderNumber}/shipping-label?mode=nimbus`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-purple-600 text-white py-2 px-3 rounded-lg font-bold text-xs hover:bg-purple-700 transition-colors"
          >
            <FiExternalLink size={14} /> Official NimbusPost Label
          </a>
        )}
      </div>

      {/* 4in x 6in Thermal Shipping Label Box (Amazon Style) */}
      <div
        id="shipping-label-container"
        className="bg-white border-2 border-black p-2 font-sans text-black shadow-lg"
        style={{
          width: '101.6mm',
          minHeight: '152.4mm',
          boxSizing: 'border-box',
        }}
      >
        {/* Header Barcode & Destination Box */}
        <div className="flex justify-between items-stretch border-b-2 border-black pb-2">
          {/* Left Barcode */}
          <div className="flex-1 flex flex-col items-center justify-center pr-2">
            <div
              className="w-full max-w-[190px] overflow-hidden"
              dangerouslySetInnerHTML={{ __html: barcodeSvg }}
            />
            <p className="text-[10px] font-black tracking-wider mt-1 text-center">AWB {awbCode}</p>
          </div>

          {/* Right Destination & Details Grid */}
          <div className="w-[110px] border-l-2 border-black text-center font-bold text-[11px] flex flex-col">
            <div className="border-b border-black py-1 text-[15px] font-black tracking-widest uppercase bg-gray-50">
              {destCode}
            </div>
            <div className="border-b border-black py-0.5 text-[10px]">
              {totalWeightKg.toFixed(2)} kgs
            </div>
            <div className="border-b border-black py-0.5 text-[10px]">{dateStr}</div>
            <div className="py-1 text-[13px] font-black uppercase tracking-wider bg-gray-100">
              {isCod ? 'COD' : 'PREPAID'}
            </div>
          </div>
        </div>

        {/* Ship To Section */}
        <div className="py-2 border-b-2 border-black relative">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider">Ship To:</p>
              <h3 className="text-[12px] font-black mt-0.5">{order.shipping?.name}</h3>
              <p className="text-[10px] leading-tight font-medium mt-0.5">{order.shipping?.street}</p>
              <p className="text-[10px] leading-tight font-medium">
                {order.shipping?.city}, {order.shipping?.state} - <span className="font-bold">{order.shipping?.zipCode}</span>
              </p>
              <p className="text-[10px] font-bold mt-1">Phone: {order.shipping?.phone}</p>
            </div>

            {/* Box Count & Station Box */}
            <div className="text-right">
              <div className="border border-black px-1.5 py-0.5 text-[9px] font-black inline-block mb-1">
                BOX 1 of 1
              </div>
              <div className="flex border border-black text-[7px] font-bold text-center mt-1">
                <div className="border-r border-black px-1 py-0.5">
                  <div className="text-[5px]">DELIVERY STATION</div>
                  <div className="text-[9px] font-black">{destCode}</div>
                </div>
                <div className="border-r border-black px-1 py-0.5">
                  <div className="text-[5px]">SECTOR</div>
                  <div className="text-[9px] font-black">X</div>
                </div>
                <div className="px-1 py-0.5">
                  <div className="text-[5px]">SORTZONE</div>
                  <div className="text-[9px] font-black">X</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Info & Ship Date */}
        <div className="py-1.5 border-b-2 border-black flex justify-between items-center text-[10px] font-black">
          <span>Order Id: {order.orderNumber}</span>
          <span>Ship Date: {fullDateStr}</span>
        </div>

        {/* Decorative Divider Barcode */}
        <div className="py-1.5 border-b-2 border-black flex justify-center">
          <div className="w-full max-w-[280px] h-8 overflow-hidden flex justify-center" dangerouslySetInnerHTML={{ __html: barcodeRefSvg }} />
        </div>

        {/* Ship From Section */}
        <div className="py-1.5 border-b-2 border-black text-[9px]">
          <p className="font-black uppercase">Ship From: {SENDER.name}</p>
          <p className="font-medium text-[8px] leading-tight">
            Return Address: {SENDER.address}, {SENDER.city}, {SENDER.state} {SENDER.pincode} India
          </p>
        </div>

        {/* Customer Self Declaration */}
        <div className="py-1 border-b border-black text-[7px] font-bold">
          Customer Self Declaration : The goods sold are intended for end user consumption. Not for resale.
        </div>

        {/* Goods Declaration Table */}
        <div className="py-1">
          <table className="w-full text-center border-collapse border border-black text-[7.5px]">
            <thead>
              <tr className="bg-gray-100 font-bold border-b border-black">
                <th className="border-r border-black p-0.5">#</th>
                <th className="border-r border-black p-0.5">SELLER</th>
                <th className="border-r border-black p-0.5">GSTIN</th>
                <th className="border-r border-black p-0.5">INVOICE</th>
                <th className="border-r border-black p-0.5">DATE</th>
                <th className="p-0.5">ITEM TYPE</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border-r border-black p-0.5 font-bold">1</td>
                <td className="border-r border-black p-0.5 font-medium">{SENDER.name}</td>
                <td className="border-r border-black p-0.5">{SENDER.gstin}</td>
                <td className="border-r border-black p-0.5 font-bold">IN-{order.orderNumber.slice(-4)}</td>
                <td className="border-r border-black p-0.5">{fullDateStr}</td>
                <td className="p-0.5 font-medium">{itemsSummary}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Sort Matrix Grid */}
        <div className="grid grid-cols-8 gap-0.5 border border-black mt-1 text-center text-[6.5px] font-black py-1">
          <div className="border-r border-black">BHLA</div>
          <div className="border-r border-black">BERD</div>
          <div className="border-r border-black">MJAL</div>
          <div className="border-r border-black">MJAX<br />3 A15</div>
          <div className="border-r border-black">NCRU<br />A YYN</div>
          <div className="border-r border-black">MIXJ<br />S P05</div>
          <div className="border-r border-black">UHPD</div>
          <div>UHP</div>
        </div>

        {/* Footer */}
        <div className="mt-1 flex justify-between items-center text-[7.5px] font-black border-t border-black pt-1">
          <span>Sold on: www.gopimisthanbhandar.com</span>
          <span className="uppercase">{SENDER.name}</span>
        </div>
      </div>

      {/* Print Specific CSS */}
      <style jsx global>{`
        @media print {
          html, body {
            background-color: white !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 101.6mm !important;
            height: 152.4mm !important;
            overflow: hidden !important;
          }
          .no-print, header, aside, nav {
            display: none !important;
          }
          #shipping-label-container {
            border: 2px solid black !important;
            box-shadow: none !important;
            margin: 0 !important;
            padding: 2mm !important;
            width: 101.6mm !important;
            height: 152.4mm !important;
            max-height: 152.4mm !important;
            box-sizing: border-box !important;
            page-break-inside: avoid !important;
            page-break-after: avoid !important;
            page-break-before: avoid !important;
            overflow: hidden !important;
          }
          @page {
            size: 101.6mm 152.4mm;
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
}
