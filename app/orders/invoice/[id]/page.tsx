'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useReactToPrint } from 'react-to-print';
import { FiArrowLeft, FiDownload, FiFileText } from 'react-icons/fi';
import InvoiceDocument from '@/components/invoice/InvoiceDocument';
import type { InvoiceData } from '@/lib/invoice';

/**
 * Customer-facing invoice view for a single order.
 * Route: /orders/invoice/<orderNumber>
 * Data comes from the existing invoice API (JSON mode) — real order data only.
 * "Download PDF" uses react-to-print (renders this exact component, logo + theme).
 */
export default function InvoicePage() {
  const params = useParams();
  const router = useRouter();
  const orderNumber = Array.isArray(params.id) ? params.id[0] : params.id;

  const [data, setData] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: data ? `Invoice-${data.invoiceNumber}` : 'Invoice',
    pageStyle: `
      @page { size: A4; margin: 0; }
      @media print {
        html, body { margin: 0 !important; padding: 0 !important; background: #fff !important; }
      }
    `,
  });

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const res = await fetch(
          `/api/orders/${encodeURIComponent(orderNumber as string)}/invoice?format=json`
        );
        const json = await res.json();
        if (!active) return;
        if (!res.ok || !json.success) {
          setError(json.error || 'Unable to load invoice.');
        } else {
          // Revive Date fields serialized as strings.
          const d = json.data as InvoiceData;
          d.invoiceDate = new Date(d.invoiceDate);
          d.dueDate = new Date(d.dueDate);
          setData(d);
        }
      } catch {
        if (active) setError('Something went wrong while loading the invoice.');
      } finally {
        if (active) setLoading(false);
      }
    }
    if (orderNumber) load();
    return () => {
      active = false;
    };
  }, [orderNumber]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f2ec]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#FE8E02] mx-auto mb-3" />
          <p className="text-[#331818]">Loading invoice…</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f2ec] px-4">
        <div className="text-center max-w-sm">
          <FiFileText className="w-10 h-10 text-[#FE8E02] mx-auto mb-3" />
          <h1 className="text-lg font-semibold text-[#331818] mb-1">Invoice unavailable</h1>
          <p className="text-sm text-gray-600 mb-4">{error || 'Invoice not found.'}</p>
          <button
            onClick={() => router.push('/orders')}
            className="px-4 py-2 bg-[#FE8E02] text-white rounded-md text-sm font-medium hover:bg-[#FF9D2E]"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f2ec] py-6">
      {/* Toolbar — hidden when printing */}
      <div className="max-w-[210mm] mx-auto px-4 mb-4 flex items-center justify-between print:hidden">
        <button
          onClick={() => router.push('/orders')}
          className="flex items-center gap-2 text-sm font-medium text-[#331818] hover:text-[#FE8E02]"
        >
          <FiArrowLeft className="w-4 h-4" /> Back to Orders
        </button>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#FE8E02] text-white rounded-md text-sm font-semibold hover:bg-[#FF9D2E] shadow-sm transition-colors"
        >
          <FiDownload className="w-4 h-4" /> Download PDF
        </button>
      </div>

      {/* Printable invoice */}
      <div className="px-2">
        <div className="shadow-lg print:shadow-none mx-auto" style={{ width: 'fit-content' }}>
          <InvoiceDocument ref={printRef} data={data} />
        </div>
      </div>
    </div>
  );
}
