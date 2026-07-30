/**
 * Shared invoice logic — used by BOTH the server-side PDF route
 * (app/api/orders/[id]/invoice/route.ts) and the client-side React invoice
 * component (components/invoice/InvoiceDocument.tsx).
 *
 * Prices in this store are GST-INCLUSIVE (see /terms and product pages).
 * So we do NOT add tax on top — we back-calculate the taxable value and the
 * CGST/SGST split OUT of the amount the customer actually paid, so the invoice
 * always foots to the real order total.
 */

/** Company / seller details — single source of truth for the invoice header. */
export const COMPANY = {
  name: 'Gopi Misthan Bhandar',
  tagline: 'Serving Tradition & Sweetness Since 1968',
  addressLines: ['SHOP-1 - 304, Tilak Marg', 'Neemuch, Madhya Pradesh - 458441'],
  phone: '+91 94259 22445',
  email: 'gopimisthan1968@gmail.com',
  website: 'www.gopimisthanbhandar.com',
  // GSTIN is read from env. There is deliberately no fallback: a placeholder
  // GSTIN on a real tax invoice is worse than none, so the line is simply
  // omitted until NEXT_PUBLIC_GST_NUMBER is set.
  gstin: process.env.NEXT_PUBLIC_GST_NUMBER || '',
  logoPath: '/logo.png',
} as const;

/** Default combined GST rate (%). Split evenly into CGST + SGST. */
export const DEFAULT_GST_RATE = Number(process.env.NEXT_PUBLIC_GST_RATE ?? 18);

export interface OrderItemLike {
  name: string;
  price: number;
  quantity: number;
  weight?: string;
  /** Optional per-item override; falls back to DEFAULT_GST_RATE. Use 0 for tax-free. */
  taxRate?: number;
}

export interface AddressLike {
  name?: string;
  email?: string;
  phone?: string;
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

export interface OrderLike {
  orderNumber: string;
  createdAt: string | Date;
  items: OrderItemLike[];
  shipping: AddressLike;
  billing?: AddressLike;
  subtotal?: number;
  shippingCost?: number;
  couponDiscount?: number;
  appliedCouponCode?: string;
  total: number;
  paymentMethod?: string;
  paymentStatus?: string;
  status?: string;
}

export interface InvoiceLineItem {
  name: string;
  weight?: string;
  quantity: number;
  /** Gross (tax-inclusive) unit price. */
  rate: number;
  /** Gross (tax-inclusive) line amount = rate * quantity. */
  amount: number;
  taxRate: number;
}

export interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: Date;
  dueDate: Date;
  orderNumber: string;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  company: typeof COMPANY;
  billTo: {
    name: string;
    email: string;
    phone: string;
    addressLines: string[];
    gstin?: string;
  };
  items: InvoiceLineItem[];
  taxRate: number;
  /** Sum of taxable value (ex-GST) across all items. */
  taxableValue: number;
  cgst: number;
  sgst: number;
  totalGst: number;
  shippingCost: number;
  discount: number;
  couponCode?: string;
  /** Rounding adjustment so the grand total exactly matches order.total. */
  roundOff: number;
  grandTotal: number;
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/**
 * Deterministic, unique-per-order invoice number.
 * ORD-1718000000000-42  ->  INV-1718000000000-42
 * Stable across regenerations so the same order always maps to the same invoice.
 */
export function buildInvoiceNumber(orderNumber: string): string {
  const suffix = orderNumber.replace(/^ORD[-_]?/i, '');
  return `INV-${suffix || orderNumber}`;
}

/** Format a number as Indian Rupees, e.g. ₹1,25,000.00 */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);
}

/**
 * Build fully-computed invoice data from a real order.
 * All money is derived from the order — nothing is hardcoded.
 */
export function buildInvoiceData(order: OrderLike): InvoiceData {
  const items: InvoiceLineItem[] = (order.items || []).map((item) => {
    const rate = Number(item.price) || 0;
    const quantity = Number(item.quantity) || 0;
    const taxRate =
      typeof item.taxRate === 'number' && item.taxRate >= 0
        ? item.taxRate
        : DEFAULT_GST_RATE;
    return {
      name: item.name,
      weight: item.weight,
      quantity,
      rate,
      amount: round2(rate * quantity),
      taxRate,
    };
  });

  // Back-calculate taxable value + GST out of the tax-inclusive line amounts.
  let taxableValue = 0;
  let totalGst = 0;
  for (const line of items) {
    const divisor = 1 + line.taxRate / 100;
    const taxable = divisor > 0 ? line.amount / divisor : line.amount;
    taxableValue += taxable;
    totalGst += line.amount - taxable;
  }
  taxableValue = round2(taxableValue);
  totalGst = round2(totalGst);
  const cgst = round2(totalGst / 2);
  const sgst = round2(totalGst - cgst);

  const shippingCost = Number(order.shippingCost) || 0;
  const discount = Number(order.couponDiscount) || 0;

  // Grand total is authoritative = what the customer actually paid.
  const grandTotal = round2(Number(order.total) || 0);
  const computed = round2(taxableValue + cgst + sgst + shippingCost - discount);
  const roundOff = round2(grandTotal - computed);

  const invoiceDate = new Date(order.createdAt);
  const isPaid = (order.paymentStatus || '').toLowerCase() === 'paid';
  const dueDate = new Date(invoiceDate);
  if (!isPaid) dueDate.setDate(dueDate.getDate() + 7);

  const bill = order.billing && order.billing.name ? order.billing : order.shipping;
  const addressLines = [
    bill.street,
    [bill.city, bill.state].filter(Boolean).join(', '),
    bill.zipCode,
  ].filter((l): l is string => Boolean(l && l.trim()));

  return {
    invoiceNumber: buildInvoiceNumber(order.orderNumber),
    invoiceDate,
    dueDate,
    orderNumber: order.orderNumber,
    paymentMethod: (order.paymentMethod || 'cod').toUpperCase(),
    paymentStatus: order.paymentStatus || 'pending',
    status: order.status || 'pending',
    company: COMPANY,
    billTo: {
      name: bill.name || 'Customer',
      email: bill.email || '',
      phone: bill.phone || '',
      addressLines,
    },
    items,
    taxRate: DEFAULT_GST_RATE,
    taxableValue,
    cgst,
    sgst,
    totalGst,
    shippingCost,
    discount,
    couponCode: order.appliedCouponCode,
    roundOff,
    grandTotal,
  };
}

/** Human date, e.g. 11 Jul 2026 */
export function formatInvoiceDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
