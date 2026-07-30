'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiExternalLink, FiTruck, FiAlertCircle, FiRefreshCw, FiCopy, FiCheck, FiFileText } from 'react-icons/fi';

interface LabelState {
  loading: boolean;
  awbNumber?: string;
  courierName?: string | null;
  orderNumber?: string;
  trackingUrl?: string | null;
  panelUrl?: string;
  manifestUrl?: string | null;
  error?: string;
  code?: string;
}

export default function ShippingLabelPage() {
  const params = useParams();
  const router = useRouter();
  const [state, setState] = useState<LabelState>({ loading: true });
  const [copied, setCopied] = useState(false);

  const handleCopyAwb = async () => {
    if (!state.awbNumber) return;
    try {
      await navigator.clipboard.writeText(state.awbNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked — AWB is visible on screen anyway.
    }
  };

  const loadLabel = useCallback(async () => {
    setState({ loading: true });

    try {
      const res = await fetch(`/api/orders/${params.id}/shipping-label?json=1`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        setState({
          loading: false,
          error: data.error || 'Could not fetch label details.',
          code: data.code,
        });
        return;
      }

      setState({
        loading: false,
        awbNumber: data.awbNumber,
        courierName: data.courierName,
        orderNumber: data.orderNumber,
        trackingUrl: data.trackingUrl,
        panelUrl: data.panelUrl,
        manifestUrl: data.manifestUrl,
      });
    } catch {
      setState({ loading: false, error: 'Network error. Please try again.', code: 'NETWORK' });
    }
  }, [params.id]);

  useEffect(() => {
    loadLabel();
  }, [loadLabel]);

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 flex justify-center">
      <div className="w-full max-w-[460px]">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-gray-900 mb-4"
        >
          <FiArrowLeft size={16} /> Back
        </button>

        <div className="bg-white rounded-xl shadow-md p-6">
          {state.loading && (
            <div className="flex flex-col items-center gap-3 py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
              <p className="text-sm text-gray-500 font-medium">Fetching shipment details…</p>
            </div>
          )}

          {/* No shipment yet, so there is nothing to print */}
          {!state.loading && state.code === 'NO_SHIPMENT' && (
            <div className="flex flex-col items-center text-center gap-4 py-4">
              <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                <FiTruck className="text-orange-600" size={22} />
              </div>
              <div>
                <h2 className="font-bold text-gray-900 mb-1.5">Create the Shipment First</h2>
                <p className="text-sm text-gray-600 leading-relaxed">
                  No NimbusPost shipment exists for this order yet, so there is no AWB or label.
                  Create the shipment from the Delivery page and the label details will appear here.
                </p>
              </div>
              <Link
                href="/admin/delivery"
                className="w-full flex items-center justify-center gap-2 bg-[#F88E0C] text-white py-2.5 px-4 rounded-lg font-bold text-xs hover:bg-[#D87A0A] transition-colors"
              >
                <FiTruck size={16} /> Create Shipment
              </Link>
            </div>
          )}

          {/* Baaki koi bhi error */}
          {!state.loading && state.error && state.code !== 'NO_SHIPMENT' && (
            <div className="flex flex-col items-center text-center gap-4 py-4">
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <FiAlertCircle className="text-red-600" size={22} />
              </div>
              <div>
                <h2 className="font-bold text-gray-900 mb-1.5">Label Unavailable</h2>
                <p className="text-sm text-gray-600 leading-relaxed">{state.error}</p>
              </div>
              <button
                onClick={loadLabel}
                className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-2.5 px-4 rounded-lg font-bold text-xs hover:bg-black transition-colors"
              >
                <FiRefreshCw size={15} /> Retry
              </button>
            </div>
          )}

          {!state.loading && state.awbNumber && (
            <div className="flex flex-col gap-4">
              <div>
                <h2 className="font-bold text-gray-900 mb-3">Shipping Label</h2>
                <dl className="text-sm space-y-1.5">
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Order</dt>
                    <dd className="font-semibold text-gray-900">{state.orderNumber}</dd>
                  </div>
                  {state.courierName && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Courier</dt>
                      <dd className="font-semibold text-gray-900">{state.courierName}</dd>
                    </div>
                  )}
                </dl>
              </div>

              {/* AWB is what you paste into the panel's search box */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <p className="text-[11px] text-gray-500 font-semibold uppercase tracking-wide mb-1">AWB Number</p>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono font-bold text-gray-900 text-sm">{state.awbNumber}</span>
                  <button
                    onClick={handleCopyAwb}
                    className="flex items-center gap-1 text-xs font-bold text-purple-600 hover:text-purple-800 shrink-0"
                  >
                    {copied ? <FiCheck size={14} /> : <FiCopy size={14} />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              <a
                href={state.panelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white py-2.5 px-4 rounded-lg font-bold text-xs hover:bg-purple-700 transition-colors"
              >
                <FiExternalLink size={15} /> Open NimbusPost Panel
              </a>

              <ol className="text-[11px] text-gray-500 leading-relaxed list-decimal pl-4 space-y-0.5">
                <li>Paste the AWB above into the panel search box</li>
                <li>Tick the checkbox next to the shipment</li>
                <li>Click <span className="font-semibold text-gray-700">Print Label</span> at the top</li>
              </ol>

              {state.manifestUrl && (
                <a
                  href={state.manifestUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-bold text-xs hover:bg-gray-50 transition-colors"
                >
                  <FiFileText size={14} /> Download Manifest (pickup handover sheet)
                </a>
              )}

              {state.trackingUrl && (
                <a
                  href={state.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-center text-gray-400 hover:text-gray-600 underline"
                >
                  Track shipment
                </a>
              )}

              <p className="text-[11px] text-gray-400 text-center leading-relaxed border-t border-gray-100 pt-3">
                NimbusPost's API does not expose the label — it can only be printed from their panel.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
