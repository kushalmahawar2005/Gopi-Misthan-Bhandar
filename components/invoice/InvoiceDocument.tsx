'use client';

import React, { forwardRef } from 'react';
import {
  InvoiceData,
  formatINR,
  formatInvoiceDate,
} from '@/lib/invoice';

/**
 * Presentational A4 invoice — brand theme (saffron #FE8E02 / brown #331818).
 * Pure UI: receives already-computed InvoiceData, renders nothing async.
 * Designed to be printed via react-to-print and to fit A4 cleanly.
 */

const BRAND = '#FE8E02';
const BRAND_DARK = '#D87A0A';
const INK = '#331818';

interface Props {
  data: InvoiceData;
}

const InvoiceDocument = forwardRef<HTMLDivElement, Props>(function InvoiceDocument(
  { data },
  ref
) {
  const {
    company,
    billTo,
    items,
    invoiceNumber,
    invoiceDate,
    dueDate,
    orderNumber,
    paymentMethod,
    taxableValue,
    cgst,
    sgst,
    shippingCost,
    discount,
    couponCode,
    roundOff,
    grandTotal,
    taxRate,
  } = data;

  const halfRate = taxRate / 2;

  return (
    <div
      ref={ref}
      className="invoice-sheet"
      style={{
        width: '210mm',
        minHeight: '297mm',
        margin: '0 auto',
        background: '#ffffff',
        color: INK,
        boxSizing: 'border-box',
        padding: '14mm 14mm 12mm',
        fontFamily:
          "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif",
        fontSize: '12px',
        lineHeight: 1.5,
        position: 'relative',
      }}
    >
      {/* ===== Header ===== */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '16px',
          borderBottom: `2px solid ${BRAND}`,
          paddingBottom: '16px',
        }}
      >
        <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={company.logoPath}
            alt={`${company.name} logo`}
            width={64}
            height={64}
            style={{
              width: '64px',
              height: '64px',
              objectFit: 'contain',
              flexShrink: 0,
            }}
          />
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: '20px',
                fontWeight: 800,
                letterSpacing: '-0.01em',
                color: INK,
              }}
            >
              {company.name}
            </h1>
            <p style={{ margin: '2px 0 6px', color: BRAND_DARK, fontWeight: 600, fontSize: '11px' }}>
              {company.tagline}
            </p>
            {company.addressLines.map((line) => (
              <p key={line} style={{ margin: 0, fontSize: '11px', color: '#5b4a42' }}>
                {line}
              </p>
            ))}
            <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#5b4a42' }}>
              {company.phone} &nbsp;•&nbsp; {company.email}
            </p>
            <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#5b4a42' }}>
              <strong>GSTIN:</strong> {company.gstin}
            </p>
          </div>
        </div>

        {/* Invoice meta */}
        <div style={{ textAlign: 'right', minWidth: '150px' }}>
          <div
            style={{
              display: 'inline-block',
              background: BRAND,
              color: '#fff',
              fontWeight: 800,
              letterSpacing: '0.08em',
              fontSize: '15px',
              padding: '6px 14px',
              borderRadius: '6px',
            }}
          >
            INVOICE
          </div>
          <table style={{ marginTop: '12px', marginLeft: 'auto', fontSize: '11px', borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td style={{ padding: '2px 8px 2px 0', color: '#8a7a72', textAlign: 'right' }}>Invoice No.</td>
                <td style={{ padding: '2px 0', fontWeight: 700, textAlign: 'right' }}>{invoiceNumber}</td>
              </tr>
              <tr>
                <td style={{ padding: '2px 8px 2px 0', color: '#8a7a72', textAlign: 'right' }}>Invoice Date</td>
                <td style={{ padding: '2px 0', fontWeight: 600, textAlign: 'right' }}>{formatInvoiceDate(invoiceDate)}</td>
              </tr>
              <tr>
                <td style={{ padding: '2px 8px 2px 0', color: '#8a7a72', textAlign: 'right' }}>Due Date</td>
                <td style={{ padding: '2px 0', fontWeight: 600, textAlign: 'right' }}>{formatInvoiceDate(dueDate)}</td>
              </tr>
              <tr>
                <td style={{ padding: '2px 8px 2px 0', color: '#8a7a72', textAlign: 'right' }}>Order No.</td>
                <td style={{ padding: '2px 0', fontWeight: 600, textAlign: 'right' }}>{orderNumber}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== Bill To + Payment ===== */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', marginTop: '18px' }}>
        <div style={{ maxWidth: '60%' }}>
          <p style={{ margin: '0 0 4px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: BRAND_DARK, fontWeight: 700 }}>
            Bill To
          </p>
          <p style={{ margin: 0, fontWeight: 700, fontSize: '13px' }}>{billTo.name}</p>
          {billTo.addressLines.map((line, i) => (
            <p key={i} style={{ margin: 0, fontSize: '11px', color: '#5b4a42' }}>{line}</p>
          ))}
          {billTo.phone && <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#5b4a42' }}>Phone: {billTo.phone}</p>}
          {billTo.email && <p style={{ margin: 0, fontSize: '11px', color: '#5b4a42' }}>Email: {billTo.email}</p>}
          {billTo.gstin && <p style={{ margin: 0, fontSize: '11px', color: '#5b4a42' }}>GSTIN: {billTo.gstin}</p>}
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ margin: '0 0 4px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: BRAND_DARK, fontWeight: 700 }}>
            Payment
          </p>
          <p style={{ margin: 0, fontSize: '11px', color: '#5b4a42' }}>Method: <strong>{paymentMethod}</strong></p>
          <p style={{ margin: 0, fontSize: '11px', color: '#5b4a42' }}>Status: <strong style={{ textTransform: 'capitalize' }}>{data.paymentStatus}</strong></p>
        </div>
      </div>

      {/* ===== Items table ===== */}
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          marginTop: '16px',
          fontSize: '11.5px',
        }}
      >
        <thead>
          <tr style={{ background: INK, color: '#fff' }}>
            <th style={{ textAlign: 'left', padding: '9px 10px', fontWeight: 600, width: '48%' }}>Description</th>
            <th style={{ textAlign: 'center', padding: '9px 10px', fontWeight: 600 }}>Qty</th>
            <th style={{ textAlign: 'right', padding: '9px 10px', fontWeight: 600 }}>Rate</th>
            <th style={{ textAlign: 'center', padding: '9px 10px', fontWeight: 600 }}>GST%</th>
            <th style={{ textAlign: 'right', padding: '9px 10px', fontWeight: 600 }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr
              key={idx}
              style={{
                background: idx % 2 ? '#fff' : '#fff8f0',
                borderBottom: '1px solid #f0e6dd',
                pageBreakInside: 'avoid',
              }}
            >
              <td style={{ padding: '8px 10px', verticalAlign: 'top' }}>
                <div style={{ fontWeight: 600, wordBreak: 'break-word' }}>{item.name}</div>
                {item.weight && (
                  <div style={{ fontSize: '10px', color: '#8a7a72' }}>{item.weight}</div>
                )}
              </td>
              <td style={{ padding: '8px 10px', textAlign: 'center', verticalAlign: 'top' }}>{item.quantity}</td>
              <td style={{ padding: '8px 10px', textAlign: 'right', verticalAlign: 'top' }}>{formatINR(item.rate)}</td>
              <td style={{ padding: '8px 10px', textAlign: 'center', verticalAlign: 'top' }}>
                {item.taxRate === 0 ? 'Nil' : `${item.taxRate}%`}
              </td>
              <td style={{ padding: '8px 10px', textAlign: 'right', verticalAlign: 'top', fontWeight: 600 }}>{formatINR(item.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ===== Totals ===== */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '14px' }}>
        <table style={{ width: '280px', borderCollapse: 'collapse', fontSize: '12px' }}>
          <tbody>
            <Row label="Taxable Value" value={formatINR(taxableValue)} />
            <Row label={`CGST (${halfRate}%)`} value={formatINR(cgst)} />
            <Row label={`SGST (${halfRate}%)`} value={formatINR(sgst)} />
            <Row label="Shipping" value={formatINR(shippingCost)} />
            {discount > 0 && (
              <Row
                label={couponCode ? `Discount (${couponCode})` : 'Discount'}
                value={`- ${formatINR(discount)}`}
                valueColor="#1a7f37"
              />
            )}
            {Math.abs(roundOff) >= 0.01 && (
              <Row label="Round Off" value={formatINR(roundOff)} />
            )}
            <tr>
              <td
                style={{
                  padding: '10px 10px',
                  fontWeight: 800,
                  fontSize: '13px',
                  background: BRAND,
                  color: '#fff',
                  borderTopLeftRadius: '4px',
                  borderBottomLeftRadius: '4px',
                }}
              >
                Grand Total
              </td>
              <td
                style={{
                  padding: '10px 10px',
                  fontWeight: 800,
                  fontSize: '13px',
                  textAlign: 'right',
                  background: BRAND,
                  color: '#fff',
                  borderTopRightRadius: '4px',
                  borderBottomRightRadius: '4px',
                }}
              >
                {formatINR(grandTotal)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ===== Notes / Terms ===== */}
      <div
        style={{
          marginTop: '22px',
          borderTop: '1px dashed #e0d3c8',
          paddingTop: '12px',
          fontSize: '10.5px',
          color: '#6b5a51',
        }}
      >
        <p style={{ margin: '0 0 4px', fontWeight: 700, color: INK }}>Notes &amp; Terms</p>
        <ul style={{ margin: 0, paddingLeft: '16px' }}>
          <li>All prices are inclusive of applicable GST. This is a computer-generated invoice.</li>
          <li>Sweets &amp; perishable food items are non-returnable once delivered.</li>
          <li>For any queries regarding this invoice, contact {company.email} or {company.phone}.</li>
        </ul>
        <p style={{ margin: '14px 0 0', textAlign: 'center', fontWeight: 700, color: BRAND_DARK }}>
          Thank you for shopping with {company.name}! &nbsp;•&nbsp; {company.website}
        </p>
      </div>
    </div>
  );
});

function Row({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <tr style={{ borderBottom: '1px solid #f0e6dd' }}>
      <td style={{ padding: '6px 10px', color: '#5b4a42' }}>{label}</td>
      <td style={{ padding: '6px 10px', textAlign: 'right', fontWeight: 600, color: valueColor || INK }}>
        {value}
      </td>
    </tr>
  );
}

export default InvoiceDocument;
