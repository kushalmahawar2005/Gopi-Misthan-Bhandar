import axios, { AxiosInstance } from 'axios';

const BASE_URL = process.env.NIMBUSPOST_BASE_URL || 'https://api.nimbuspost.com/v1';
const API_KEY = process.env.NIMBUSPOST_API_KEY; // Usually the password
const CLIENT_ID = process.env.NIMBUSPOST_CLIENT_ID; // Usually the email

let cachedToken: string | null = null;
let tokenExpiry: number | null = null;

/**
 * Get NimbusPost Access Token
 */
export async function getAccessToken(): Promise<string> {
  // Check if credentials exist
  if (!API_KEY || !CLIENT_ID) {
    throw new Error('NimbusPost API Key or Client ID is missing. Please check your environment variables.');
  }

  // Check if token is valid (with 5 min buffer)
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry - 300000) {
    return cachedToken;
  }

  try {
    const response = await axios.post(`${BASE_URL}/users/login`, {
      email: CLIENT_ID,
      password: API_KEY,
    });

    if (response.data && response.data.status && response.data.data) {
      cachedToken = response.data.data;
      // Nimbus tokens usually last for 24h, but we'll refresh every 12h for safety
      tokenExpiry = Date.now() + 12 * 60 * 60 * 1000;
      return cachedToken!;
    }
    throw new Error('Failed to get NimbusPost access token');
  } catch (error: any) {
    console.error('NimbusPost Login Error:', error.response?.data || error.message);
    throw new Error('NimbusPost authentication failed');
  }
}

/**
 * Axios instance for NimbusPost
 */
const nimbusClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add token
nimbusClient.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/**
 * Pincode Serviceability & Rate Check
 */
export interface ServiceabilityParams {
  pincode: string;
  weight: number; // in kg
  order_amount: number;
  payment_method: 'prepaid' | 'cod';
}

export async function checkServiceability(params: ServiceabilityParams) {
  try {
    const origin = process.env.SENDER_PINCODE;
    
    if (!origin) {
      console.error('❌ SENDER_PINCODE is missing in .env');
      return { status: false, message: 'Sender pincode missing' };
    }

    const response = await nimbusClient.post('/courier/serviceability', {
      origin: origin,
      destination: params.pincode,
      weight: Math.round(params.weight * 1000), // Convert to grams (integer)
      order_amount: params.order_amount,
      payment_method: params.payment_method,
      payment_type: params.payment_method, // String like 'prepaid' or 'cod'
    });

    return response.data;
  } catch (error: any) {
    const errorData = error.response?.data;
    console.error('❌ NimbusPost Serviceability Error:', {
      message: error.message,
      data: errorData,
      status: error.response?.status
    });
    return { status: false, message: errorData?.message || error.message };
  }
}

/**
 * Create Shipment
 */
export interface ShipmentParams {
  order_id: string;
  consignee: {
    name: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
    email: string;
  };
  pickup: {
    name: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
    email?: string;
  };
  order_items: Array<{
    name: string;
    qty: number;
    price: number;
    sku?: string;
  }>;
  payment_method: 'prepaid' | 'cod';
  total_amount: number;
  // Optional aliases for Nimbus payload variants
  payment_type?: 'prepaid' | 'cod';
  order_total?: number;
  order_amount?: number | string;
  pickup_warehouse_name?: string;
  weight: number; // kg
  length: number; // cm
  breadth: number; // cm
  height: number; // cm
}

export async function createShipment(params: ShipmentParams) {
  try {
    const paymentType = params.payment_type || params.payment_method;
    const orderAmount = Number(params.order_amount ?? params.order_total ?? params.total_amount ?? 0);
    const pickupWarehouseName =
      params.pickup_warehouse_name ||
      process.env.NIMBUSPOST_PICKUP_WAREHOUSE_NAME ||
      params.pickup.name;

    if (!Number.isFinite(orderAmount) || orderAmount <= 0) {
      return { status: false, message: 'Order amount is missing or invalid for shipment.' };
    }

    if (!pickupWarehouseName || !pickupWarehouseName.trim()) {
      return { status: false, message: 'Pickup warehouse name is missing. Set NIMBUSPOST_PICKUP_WAREHOUSE_NAME.' };
    }

    // NimbusPost expects specific format
    const payload = {
      order_number: params.order_id,
      shipping_charges: 0,
      discount: 0,
      cod_charges: 0,
      payment_method: paymentType,
      payment_type: paymentType,
      total_amount: orderAmount,
      order_total: orderAmount,
      order_amount: String(orderAmount),
      weight: params.weight,
      length: params.length,
      breadth: params.breadth,
      height: params.height,
      pickup_warehouse_name: pickupWarehouseName,
      pickup_location: pickupWarehouseName,
      consignee: {
        name: params.consignee.name,
        address: params.consignee.address,
        city: params.consignee.city,
        state: params.consignee.state,
        pincode: params.consignee.pincode,
        phone: params.consignee.phone,
        email: params.consignee.email,
      },
      pickup: {
        warehouse_name: pickupWarehouseName,
        name: params.pickup.name,
        address: params.pickup.address,
        city: params.pickup.city,
        state: params.pickup.state,
        pincode: params.pickup.pincode,
        phone: params.pickup.phone,
      },
      order_items: params.order_items,
    };

    const response = await nimbusClient.post('/shipments', payload);
    return response.data;
  } catch (error: any) {
    const nimbusData = error.response?.data;
    const message =
      nimbusData?.message ||
      (Array.isArray(nimbusData?.errors) ? nimbusData.errors.join(' ') : nimbusData?.errors) ||
      error.message;

    console.error('NimbusPost Create Shipment Error:', nimbusData || error.message);
    return { status: false, message };
  }
}

/**
 * Track Shipment
 */
export async function trackShipment(awb: string) {
  try {
    const response = await nimbusClient.get(`/shipments/track/${awb}`);
    return response.data;
  } catch (error: any) {
    console.error('NimbusPost Tracking Error:', error.response?.data || error.message);
    return { status: false, message: error.message };
  }
}

/**
 * Cancel Shipment
 */
export async function cancelShipment(awb: string) {
  try {
    const response = await nimbusClient.post('/shipments/cancel', {
      awb: awb,
    });
    return response.data;
  } catch (error: any) {
    console.error('NimbusPost Cancel Error:', error.response?.data || error.message);
    return { status: false, message: error.response?.data?.message || error.message };
  }
}

export default nimbusClient;
