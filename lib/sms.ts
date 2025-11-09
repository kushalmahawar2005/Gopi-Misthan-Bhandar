// SMS service using Twilio

const twilio = require('twilio');

let twilioClient: any = null;

export const initializeSMS = (accountSid: string, authToken: string, fromNumber: string) => {
  if (!accountSid || !authToken) {
    console.warn('Twilio credentials not provided');
    return;
  }
  
  try {
    twilioClient = twilio(accountSid, authToken);
    return twilioClient;
  } catch (error) {
    console.error('Error initializing Twilio:', error);
  }
};

export const sendSMS = async (
  to: string,
  message: string
): Promise<{ success: boolean; error?: string; messageId?: string }> => {
  try {
    if (!twilioClient) {
      const accountSid = process.env.TWILIO_ACCOUNT_SID || '';
      const authToken = process.env.TWILIO_AUTH_TOKEN || '';
      
      if (!accountSid || !authToken) {
        return { success: false, error: 'SMS service not configured' };
      }
      
      initializeSMS(accountSid, authToken, process.env.TWILIO_FROM_NUMBER || '');
    }

    if (!twilioClient) {
      return { success: false, error: 'SMS service not initialized' };
    }

    // Format phone number (add +91 for India)
    let phoneNumber = to.trim();
    if (!phoneNumber.startsWith('+')) {
      if (phoneNumber.startsWith('0')) {
        phoneNumber = '+91' + phoneNumber.substring(1);
      } else if (phoneNumber.length === 10) {
        phoneNumber = '+91' + phoneNumber;
      } else {
        phoneNumber = '+' + phoneNumber;
      }
    }

    const result = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_FROM_NUMBER || '',
      to: phoneNumber,
    });

    return { success: true, messageId: result.sid };
  } catch (error: any) {
    console.error('Error sending SMS:', error);
    return { success: false, error: error.message };
  }
};

export const sendOrderConfirmationSMS = async (
  phone: string,
  orderNumber: string,
  total: number
) => {
  const message = `Thank you for your order! Order #${orderNumber} for ₹${total.toLocaleString()} has been confirmed. Track: ${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/orders/track?order=${orderNumber}`;
  
  return sendSMS(phone, message);
};

export const sendOrderStatusSMS = async (
  phone: string,
  orderNumber: string,
  status: string
) => {
  const statusMessages: { [key: string]: string } = {
    processing: 'Your order is being processed',
    shipped: 'Your order has been shipped',
    delivered: 'Your order has been delivered',
    cancelled: 'Your order has been cancelled',
  };

  const message = `${statusMessages[status] || 'Order status updated'}: Order #${orderNumber}. Track: ${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/orders/track?order=${orderNumber}`;
  
  return sendSMS(phone, message);
};

export const sendOTPSMS = async (phone: string, otp: string) => {
  const message = `Your OTP for Gopi Misthan Bhandar is ${otp}. Valid for 10 minutes. Do not share this OTP with anyone.`;
  
  return sendSMS(phone, message);
};

