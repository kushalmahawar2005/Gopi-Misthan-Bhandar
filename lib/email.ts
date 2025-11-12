import nodemailer from 'nodemailer';

interface EmailConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  fromEmail: string;
  fromName: string;
}

let transporter: nodemailer.Transporter | null = null;

export const initializeEmail = (config: EmailConfig) => {
  transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465, // true for 465, false for other ports
    auth: {
      user: config.user,
      pass: config.password,
    },
  });
};

export const sendEmail = async (
  to: string,
  subject: string,
  html: string,
  text?: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    if (!transporter) {
      // Try to initialize from environment variables or settings
      const config = {
        host: process.env.SMTP_HOST || '',
        port: parseInt(process.env.SMTP_PORT || '587'),
        user: process.env.SMTP_USER || '',
        password: process.env.SMTP_PASSWORD || '',
        fromEmail: process.env.FROM_EMAIL || 'noreply@gopimisthanbhandar.com',
        fromName: process.env.FROM_NAME || 'Gopi Misthan Bhandar',
      };

      if (!config.host || !config.user || !config.password) {
        return { success: false, error: 'Email configuration not set' };
      }

      initializeEmail(config);
    }

    if (!transporter) {
      return { success: false, error: 'Email transporter not initialized' };
    }

    const info = await transporter.sendMail({
      from: `"${process.env.FROM_NAME || 'Gopi Misthan Bhandar'}" <${process.env.FROM_EMAIL || 'noreply@gopimisthanbhandar.com'}>`,
      to,
      subject,
      text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
      html,
    });

    return { success: true };
  } catch (error: any) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

export const sendOrderConfirmationEmail = async (
  email: string,
  orderData: {
    orderNumber: string;
    items: Array<{ name: string; quantity: number; price: number }>;
    total: number;
    shipping: { name: string; address: string; city: string; state: string; zipCode: string; phone: string };
    paymentMethod: string;
    createdAt: string;
  }
) => {
  const itemsHtml = orderData.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price.toLocaleString()}</td>
    </tr>
  `
    )
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #ba0606; color: white; padding: 20px; text-align: center; }
        .content { background: #f9f9f9; padding: 20px; }
        .order-details { background: white; padding: 20px; margin: 20px 0; border-radius: 5px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        table { width: 100%; border-collapse: collapse; }
        .total { font-size: 18px; font-weight: bold; color: #ba0606; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Order Confirmation</h1>
          <p>Thank you for your order!</p>
        </div>
        <div class="content">
          <p>Dear ${orderData.shipping.name},</p>
          <p>Your order has been confirmed and is being processed.</p>
          
          <div class="order-details">
            <h2>Order Details</h2>
            <p><strong>Order Number:</strong> ${orderData.orderNumber}</p>
            <p><strong>Order Date:</strong> ${new Date(orderData.createdAt).toLocaleDateString('en-IN', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</p>
            <p><strong>Payment Method:</strong> ${orderData.paymentMethod.toUpperCase()}</p>
            
            <h3>Items Ordered:</h3>
            <table>
              <thead>
                <tr style="background: #f5f5f5;">
                  <th style="padding: 10px; text-align: left;">Product</th>
                  <th style="padding: 10px; text-align: center;">Quantity</th>
                  <th style="padding: 10px; text-align: right;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="2" style="padding: 10px; text-align: right; font-weight: bold;">Total:</td>
                  <td style="padding: 10px; text-align: right;" class="total">₹${orderData.total.toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
            
            <h3>Shipping Address:</h3>
            <p>
              ${orderData.shipping.name}<br>
              ${orderData.shipping.address}<br>
              ${orderData.shipping.city}, ${orderData.shipping.state} ${orderData.shipping.zipCode}<br>
              Phone: ${orderData.shipping.phone}
            </p>
          </div>
          
          <p>You can track your order status by visiting: <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/orders/track?order=${orderData.orderNumber}">Track Order</a></p>
          
          <p>If you have any questions, please contact us at info@gopimisthanbhandar.com</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Gopi Misthan Bhandar. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail(email, `Order Confirmation - ${orderData.orderNumber}`, html);
};

export const sendPasswordResetEmail = async (email: string, resetToken: string) => {
  const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #ba0606; color: white; padding: 20px; text-align: center; }
        .content { background: #f9f9f9; padding: 20px; }
        .button { display: inline-block; padding: 12px 24px; background: #ba0606; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset Request</h1>
        </div>
        <div class="content">
          <p>You requested to reset your password. Click the button below to reset it:</p>
          <a href="${resetUrl}" class="button">Reset Password</a>
          <p>Or copy and paste this link in your browser:</p>
          <p>${resetUrl}</p>
          <p><strong>This link will expire in 1 hour.</strong></p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Gopi Misthan Bhandar. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail(email, 'Password Reset Request', html);
};

interface WeddingEnquiryPayload {
  name: string;
  email?: string;
  phone?: string;
  location?: string;
  giftType?: string;
  quantityPreference?: string;
  description?: string;
  createdAt: string;
}

export const sendWeddingEnquiryEmails = async (enquiry: WeddingEnquiryPayload) => {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const adminEmail =
    process.env.ENQUIRY_NOTIFICATION_EMAIL || process.env.FROM_EMAIL || 'info@gopimisthanbhandar.com';

  const adminHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; }
          .header { background: #ba0606; color: white; padding: 16px; text-align: center; border-radius: 8px 8px 0 0; }
          .section { background: #fff; padding: 20px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
          .row { margin-bottom: 12px; }
          .label { font-weight: bold; color: #ba0606; display: block; font-size: 14px; }
          .value { font-size: 15px; color: #333; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>New Wedding Gift Enquiry</h2>
          </div>
          <div class="section">
            <div class="row">
              <span class="label">Customer Name</span>
              <span class="value">${enquiry.name}</span>
            </div>
            ${enquiry.email ? `<div class="row"><span class="label">Email</span><span class="value">${enquiry.email}</span></div>` : ''}
            ${enquiry.phone ? `<div class="row"><span class="label">Phone</span><span class="value">${enquiry.phone}</span></div>` : ''}
            ${enquiry.location ? `<div class="row"><span class="label">Location</span><span class="value">${enquiry.location}</span></div>` : ''}
            ${enquiry.giftType ? `<div class="row"><span class="label">Gift Type</span><span class="value">${enquiry.giftType}</span></div>` : ''}
            ${enquiry.quantityPreference ? `<div class="row"><span class="label">Quantity Preference</span><span class="value">${enquiry.quantityPreference}</span></div>` : ''}
            ${
              enquiry.description
                ? `<div class="row"><span class="label">Description</span><span class="value">${enquiry.description}</span></div>`
                : ''
            }
            <div class="row">
              <span class="label">Submitted At</span>
              <span class="value">${new Date(enquiry.createdAt).toLocaleString('en-IN', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}</span>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  const customerHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; }
          .header { background: #ba0606; color: white; padding: 16px; text-align: center; border-radius: 8px 8px 0 0; }
          .section { background: #fff; padding: 20px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
          .button { display: inline-block; padding: 12px 24px; background: #ba0606; color: white; border-radius: 6px; text-decoration: none; margin-top: 16px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Thank You for Your Enquiry!</h2>
          </div>
          <div class="section">
            <p>Hi ${enquiry.name.split(' ')[0]},</p>
            <p>Thank you for reaching out to Gopi Misthan Bhandar for your wedding gifting needs. Our team has received your enquiry and will get in touch with you shortly to curate the perfect gifting solution.</p>
            <p>If you need urgent assistance, feel free to call us at <a href="tel:+919876543210">+91 98765 43210</a>.</p>
            <a class="button" href="${siteUrl}">Visit Our Store</a>
            <p style="margin-top:20px;">Warm regards,<br />Team Gopi Misthan Bhandar</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const emailTasks: Promise<any>[] = [];

  if (adminEmail) {
    emailTasks.push(sendEmail(adminEmail, 'New Wedding Gift Enquiry Received', adminHtml));
  }

  if (enquiry.email) {
    emailTasks.push(sendEmail(enquiry.email, 'We Received Your Wedding Gift Enquiry', customerHtml));
  }

  if (emailTasks.length === 0) {
    return { success: false, error: 'No email recipients configured' };
  }

  const results = await Promise.allSettled(emailTasks);

  const failures = results.filter((result) => result.status === 'rejected');
  if (failures.length > 0) {
    return { success: false, error: 'Some emails failed to send' };
  }

  return { success: true };
};

