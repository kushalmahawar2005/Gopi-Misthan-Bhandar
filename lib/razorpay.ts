import Razorpay from 'razorpay';

let razorpayInstance: Razorpay | null = null;

export const initializeRazorpay = (keyId: string, keySecret: string) => {
  if (!keyId || !keySecret) {
    throw new Error('Razorpay credentials are required');
  }
  
  razorpayInstance = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
  
  return razorpayInstance;
};

export const getRazorpayInstance = () => {
  if (!razorpayInstance) {
    const keyId = process.env.RAZORPAY_KEY_ID || '';
    const keySecret = process.env.RAZORPAY_KEY_SECRET || '';
    
    if (!keyId || !keySecret) {
      throw new Error('Razorpay not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET');
    }
    
    initializeRazorpay(keyId, keySecret);
  }
  
  return razorpayInstance;
};

export interface CreateOrderParams {
  amount: number; // Amount in paise (e.g., 50000 for ₹500)
  currency?: string;
  receipt?: string;
  notes?: Record<string, string>;
}

export const createRazorpayOrder = async (params: CreateOrderParams) => {
  try {
    const razorpay = getRazorpayInstance();
    if (!razorpay) {
      return { success: false, error: 'Razorpay instance not initialized' };
    }
    
    const options = {
      amount: params.amount, // Amount in paise
      currency: params.currency || 'INR',
      receipt: params.receipt || `receipt_${Date.now()}`,
      notes: params.notes || {},
    };
    
    const order = await razorpay.orders.create(options);
    return { success: true, orderId: order.id, order };
  } catch (error: any) {
    console.error('Error creating Razorpay order:', error);
    return { success: false, error: error.message };
  }
};

export const verifyPayment = async (orderId: string, paymentId: string, signature: string) => {
  try {
    const razorpay = getRazorpayInstance();
    if (!razorpay) {
      return { success: false, error: 'Razorpay instance not initialized' };
    }
    const crypto = require('crypto');
    
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(`${orderId}|${paymentId}`)
      .digest('hex');
    
    if (generatedSignature === signature) {
      // Verify with Razorpay API
      const payment = await razorpay.payments.fetch(paymentId);
      return { success: true, payment };
    } else {
      return { success: false, error: 'Invalid signature' };
    }
  } catch (error: any) {
    console.error('Error verifying payment:', error);
    return { success: false, error: error.message };
  }
};

