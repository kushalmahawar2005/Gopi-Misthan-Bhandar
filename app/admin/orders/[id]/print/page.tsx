'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import InvoiceDocument from '@/components/invoice/InvoiceDocument';
import { buildInvoiceData, type InvoiceData, type OrderLike } from '@/lib/invoice';

/**
 * Admin order print page — renders the same professional GST invoice as the
 * customer-facing /orders/invoice/[id] page, but on 4in × 6in paper for the
 * thermal/label printer at the counter. Auto-prints once the order loads.
 */
export default function OrderPrint() {
    const params = useParams();
    const [invoice, setInvoice] = useState<InvoiceData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const response = await fetch(`/api/orders/${params.id}`);
                const data = await response.json();
                if (data.success) {
                    setInvoice(buildInvoiceData(data.data as OrderLike));
                }
            } catch (error) {
                console.error('Error fetching order:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [params.id]);

    useEffect(() => {
        if (invoice) {
            const timer = setTimeout(() => {
                window.print();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [invoice]);

    if (loading) return <div className="p-8">Loading invoice…</div>;
    if (!invoice) return <div className="p-8">Order not found</div>;

    return (
        <div className="invoice-print-root bg-white py-4">
            <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .invoice-print-root, .invoice-print-root * {
            visibility: visible;
          }
          .invoice-print-root {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
          }
          @page {
            size: 4in 6in;
            margin: 0;
          }
        }
      `}</style>

            <InvoiceDocument data={invoice} size="4x6" />
        </div>
    );
}
