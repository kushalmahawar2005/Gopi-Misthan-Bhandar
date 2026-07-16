'use client';

import React, { forwardRef } from 'react';
import {
  InvoiceData,
  formatINR,
  formatInvoiceDate,
} from '@/lib/invoice';

/**
 * Presentational invoice — brand theme (saffron #FE8E02 / brown #331818).
 * Pure UI: receives already-computed InvoiceData, renders nothing async.
 * Two paper sizes:
 *   - 'a4'  (default) — customer-facing invoice, printed via react-to-print
 *   - '4x6' — compact 4in × 6in receipt used by the admin order print page
 */

const BRAND = '#FE8E02';
const BRAND_DARK = '#D87A0A';
const INK = '#331818';

export type InvoiceSize = 'a4' | '4x6';

/** Size-dependent layout tokens so both papers share one markup tree. */
const TOKENS = {
  a4: {
    width: '210mm',
    minHeight: '297mm',
    padding: '14mm 14mm 12mm',
    baseFont: '12px',
    logo: 64,
    companyName: '20px',
    tagline: '11px',
    small: '11px',
    sectionLabel: '10px',
    badgeFont: '15px',
    badgePad: '6px 14px',
    metaFont: '11px',
    billName: '13px',
    tableFont: '11.5px',
    cellPad: '8px 10px',
    headPad: '9px 10px',
    totalsWidth: '280px',
    totalsFont: '12px',
    totalsPad: '6px 10px',
    grandFont: '13px',
    grandPad: '10px 10px',
    notesFont: '10.5px',
    itemSub: '10px',
    headerGap: '16px',
    sectionGapTop: '18px',
    tableTop: '16px',
    notesTop: '22px',
    markW: '22mm',
  },
  '4x6': {
    width: '4in',
    minHeight: '6in',
    padding: '4mm 4mm 3mm',
    baseFont: '8px',
    logo: 30,
    companyName: '11px',
    tagline: '7px',
    small: '7px',
    sectionLabel: '6.5px',
    badgeFont: '9px',
    badgePad: '3px 8px',
    metaFont: '7px',
    billName: '8.5px',
    tableFont: '7.5px',
    cellPad: '3px 4px',
    headPad: '4px 4px',
    totalsWidth: '160px',
    totalsFont: '7.5px',
    totalsPad: '2.5px 4px',
    grandFont: '9px',
    grandPad: '5px 4px',
    notesFont: '6.5px',
    itemSub: '6.5px',
    headerGap: '8px',
    sectionGapTop: '8px',
    tableTop: '8px',
    notesTop: '10px',
    markW: '13mm',
  },
} as const;

interface Props {
  data: InvoiceData;
  size?: InvoiceSize;
}

const InvoiceDocument = forwardRef<HTMLDivElement, Props>(function InvoiceDocument(
  { data, size = 'a4' },
  ref
) {
  const T = TOKENS[size];
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
        width: T.width,
        minHeight: T.minHeight,
        margin: '0 auto',
        background: '#ffffff',
        color: INK,
        boxSizing: 'border-box',
        padding: T.padding,
        fontFamily:
          "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif",
        fontSize: T.baseFont,
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
          gap: T.headerGap,
          borderBottom: `2px solid ${BRAND}`,
          paddingBottom: size === '4x6' ? '6px' : '16px',
        }}
      >
        <div style={{ display: 'flex', gap: size === '4x6' ? '6px' : '14px', alignItems: 'flex-start' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={company.logoPath}
            alt={`${company.name} logo`}
            width={T.logo}
            height={T.logo}
            style={{
              width: `${T.logo}px`,
              height: `${T.logo}px`,
              objectFit: 'contain',
              flexShrink: 0,
            }}
          />
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: T.companyName,
                fontWeight: 800,
                letterSpacing: '-0.01em',
                color: INK,
              }}
            >
              {company.name}
            </h1>
            <p style={{ margin: '2px 0 4px', color: BRAND_DARK, fontWeight: 600, fontSize: T.tagline }}>
              {company.tagline}
            </p>
            {company.addressLines.map((line) => (
              <p key={line} style={{ margin: 0, fontSize: T.small, color: '#5b4a42' }}>
                {line}
              </p>
            ))}
            <p style={{ margin: '2px 0 0', fontSize: T.small, color: '#5b4a42' }}>
              {company.phone} &nbsp;•&nbsp; {company.email}
            </p>
            <p style={{ margin: '2px 0 0', fontSize: T.small, color: '#5b4a42' }}>
              <strong>GSTIN:</strong> {company.gstin}
            </p>
          </div>
        </div>

        {/* Invoice meta */}
        <div style={{ textAlign: 'right', minWidth: size === '4x6' ? '86px' : '150px' }}>
          <div
            style={{
              display: 'inline-block',
              background: BRAND,
              color: '#fff',
              fontWeight: 800,
              letterSpacing: '0.08em',
              fontSize: T.badgeFont,
              padding: T.badgePad,
              borderRadius: '4px',
            }}
          >
            INVOICE
          </div>
          <table style={{ marginTop: size === '4x6' ? '5px' : '12px', marginLeft: 'auto', fontSize: T.metaFont, borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td style={{ padding: '1px 5px 1px 0', color: '#8a7a72', textAlign: 'right' }}>Invoice No.</td>
                <td style={{ padding: '1px 0', fontWeight: 700, textAlign: 'right' }}>{invoiceNumber}</td>
              </tr>
              <tr>
                <td style={{ padding: '1px 5px 1px 0', color: '#8a7a72', textAlign: 'right' }}>Invoice Date</td>
                <td style={{ padding: '1px 0', fontWeight: 600, textAlign: 'right' }}>{formatInvoiceDate(invoiceDate)}</td>
              </tr>
              <tr>
                <td style={{ padding: '1px 5px 1px 0', color: '#8a7a72', textAlign: 'right' }}>Due Date</td>
                <td style={{ padding: '1px 0', fontWeight: 600, textAlign: 'right' }}>{formatInvoiceDate(dueDate)}</td>
              </tr>
              <tr>
                <td style={{ padding: '1px 5px 1px 0', color: '#8a7a72', textAlign: 'right' }}>Order No.</td>
                <td style={{ padding: '1px 0', fontWeight: 600, textAlign: 'right' }}>{orderNumber}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== Bill To + Payment ===== */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: T.headerGap, marginTop: T.sectionGapTop }}>
        <div style={{ maxWidth: '60%' }}>
          <p style={{ margin: '0 0 3px', fontSize: T.sectionLabel, textTransform: 'uppercase', letterSpacing: '0.08em', color: BRAND_DARK, fontWeight: 700 }}>
            Bill To
          </p>
          <p style={{ margin: 0, fontWeight: 700, fontSize: T.billName }}>{billTo.name}</p>
          {billTo.addressLines.map((line, i) => (
            <p key={i} style={{ margin: 0, fontSize: T.small, color: '#5b4a42' }}>{line}</p>
          ))}
          {billTo.phone && <p style={{ margin: '2px 0 0', fontSize: T.small, color: '#5b4a42' }}>Phone: {billTo.phone}</p>}
          {billTo.email && <p style={{ margin: 0, fontSize: T.small, color: '#5b4a42' }}>Email: {billTo.email}</p>}
          {billTo.gstin && <p style={{ margin: 0, fontSize: T.small, color: '#5b4a42' }}>GSTIN: {billTo.gstin}</p>}
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ margin: '0 0 3px', fontSize: T.sectionLabel, textTransform: 'uppercase', letterSpacing: '0.08em', color: BRAND_DARK, fontWeight: 700 }}>
            Payment
          </p>
          <p style={{ margin: 0, fontSize: T.small, color: '#5b4a42' }}>Method: <strong>{paymentMethod}</strong></p>
          <p style={{ margin: 0, fontSize: T.small, color: '#5b4a42' }}>Status: <strong style={{ textTransform: 'capitalize' }}>{data.paymentStatus}</strong></p>
        </div>
      </div>

      {/* ===== Items table ===== */}
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          marginTop: T.tableTop,
          fontSize: T.tableFont,
        }}
      >
        <thead>
          <tr style={{ background: INK, color: '#fff' }}>
            <th style={{ textAlign: 'left', padding: T.headPad, fontWeight: 600, width: '48%' }}>Description</th>
            <th style={{ textAlign: 'center', padding: T.headPad, fontWeight: 600 }}>Qty</th>
            <th style={{ textAlign: 'right', padding: T.headPad, fontWeight: 600 }}>Rate</th>
            <th style={{ textAlign: 'center', padding: T.headPad, fontWeight: 600 }}>GST%</th>
            <th style={{ textAlign: 'right', padding: T.headPad, fontWeight: 600 }}>Amount</th>
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
              <td style={{ padding: T.cellPad, verticalAlign: 'top' }}>
                <div style={{ fontWeight: 600, wordBreak: 'break-word' }}>{item.name}</div>
                {item.weight && (
                  <div style={{ fontSize: T.itemSub, color: '#8a7a72' }}>{item.weight}</div>
                )}
              </td>
              <td style={{ padding: T.cellPad, textAlign: 'center', verticalAlign: 'top' }}>{item.quantity}</td>
              <td style={{ padding: T.cellPad, textAlign: 'right', verticalAlign: 'top' }}>{formatINR(item.rate)}</td>
              <td style={{ padding: T.cellPad, textAlign: 'center', verticalAlign: 'top' }}>
                {item.taxRate === 0 ? 'Nil' : `${item.taxRate}%`}
              </td>
              <td style={{ padding: T.cellPad, textAlign: 'right', verticalAlign: 'top', fontWeight: 600 }}>{formatINR(item.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ===== Totals ===== */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: size === '4x6' ? '6px' : '14px' }}>
        <table style={{ width: T.totalsWidth, borderCollapse: 'collapse', fontSize: T.totalsFont }}>
          <tbody>
            <Row pad={T.totalsPad} label="Taxable Value" value={formatINR(taxableValue)} />
            <Row pad={T.totalsPad} label={`CGST (${halfRate}%)`} value={formatINR(cgst)} />
            <Row pad={T.totalsPad} label={`SGST (${halfRate}%)`} value={formatINR(sgst)} />
            <Row pad={T.totalsPad} label="Shipping" value={formatINR(shippingCost)} />
            {discount > 0 && (
              <Row
                pad={T.totalsPad}
                label={couponCode ? `Discount (${couponCode})` : 'Discount'}
                value={`- ${formatINR(discount)}`}
                valueColor="#1a7f37"
              />
            )}
            {Math.abs(roundOff) >= 0.01 && (
              <Row pad={T.totalsPad} label="Round Off" value={formatINR(roundOff)} />
            )}
            <tr>
              <td
                style={{
                  padding: T.grandPad,
                  fontWeight: 800,
                  fontSize: T.grandFont,
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
                  padding: T.grandPad,
                  fontWeight: 800,
                  fontSize: T.grandFont,
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
          marginTop: T.notesTop,
          borderTop: '1px dashed #e0d3c8',
          paddingTop: size === '4x6' ? '5px' : '12px',
          fontSize: T.notesFont,
          color: '#6b5a51',
        }}
      >
        <p style={{ margin: '0 0 3px', fontWeight: 700, color: INK }}>Notes &amp; Terms</p>
        <ul style={{ margin: 0, paddingLeft: size === '4x6' ? '10px' : '16px' }}>
          <li>All prices are inclusive of applicable GST. This is a computer-generated invoice.</li>
          <li>Sweets &amp; perishable food items are non-returnable once delivered.</li>
          <li>For any queries regarding this invoice, contact {company.email} or {company.phone}.</li>
        </ul>
        <p style={{ margin: size === '4x6' ? '6px 0 0' : '14px 0 0', textAlign: 'center', fontWeight: 700, color: BRAND_DARK }}>
          Thank you for shopping with {company.name}! &nbsp;•&nbsp; {company.website}
        </p>
      </div>

      {/* ===== Brand mark (right corner, below notes) ===== */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: size === '4x6' ? '4px' : '10px' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/bill.jpg"
          alt="Since 1968"
          style={{ width: T.markW, height: 'auto' }}
        />
      </div>
    </div>
  );
});

function Row({
  label,
  value,
  valueColor,
  pad,
}: {
  label: string;
  value: string;
  valueColor?: string;
  pad: string;
}) {
  return (
    <tr style={{ borderBottom: '1px solid #f0e6dd' }}>
      <td style={{ padding: pad, color: '#5b4a42' }}>{label}</td>
      <td style={{ padding: pad, textAlign: 'right', fontWeight: 600, color: valueColor || INK }}>
        {value}
      </td>
    </tr>
  );
}

export default InvoiceDocument;
