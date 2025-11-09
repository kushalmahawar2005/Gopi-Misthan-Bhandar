# Payment & Email Integration Setup Guide

## 📧 Email Setup (Nodemailer)

### Gmail Setup (Recommended)

1. **Enable 2-Step Verification** on your Gmail account
2. **Generate App Password:**
   - Go to Google Account → Security
   - Under "2-Step Verification", click "App passwords"
   - Generate a new app password for "Mail"
   - Copy the 16-character password

3. **Add to `.env` file:**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_16_char_app_password
FROM_EMAIL=noreply@gopimisthanbhandar.com
FROM_NAME=Gopi Misthan Bhandar
```

### Other Email Providers

**Outlook/Hotmail:**
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
```

**Yahoo:**
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
```

**Custom SMTP:**
```env
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_username
SMTP_PASSWORD=your_password
```

## 💳 Razorpay Setup

### 1. Create Razorpay Account
- Go to https://razorpay.com
- Sign up for an account
- Complete KYC verification

### 2. Get API Keys
- Go to Dashboard → Settings → API Keys
- Generate Test Keys (for development)
- Generate Live Keys (for production)

### 3. Add to `.env` file:
```env
# Test Keys (Development)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_test_secret_key
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx

# Live Keys (Production)
# RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
# RAZORPAY_KEY_SECRET=your_live_secret_key
# NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
```

### 4. Configure in Admin Settings
- Go to Admin Panel → Settings → Payment tab
- Enter your Razorpay Key ID and Key Secret
- Enable payment methods (UPI, Card, COD)

## 🔧 Environment Variables

Create a `.env.local` file in the root directory:

```env
# MongoDB
MONGODB_URI=your_mongodb_connection_string

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_secret_key
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx

# Email (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
FROM_EMAIL=noreply@gopimisthanbhandar.com
FROM_NAME=Gopi Misthan Bhandar

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## ✅ Features Implemented

### Email Features:
- ✅ Order confirmation emails
- ✅ Password reset emails
- ✅ HTML email templates
- ✅ Configurable SMTP settings

### Payment Features:
- ✅ Razorpay integration
- ✅ UPI payments
- ✅ Card payments (Debit/Credit)
- ✅ Cash on Delivery (COD)
- ✅ Payment verification
- ✅ Payment status tracking

## 🧪 Testing

### Test Email:
1. Place a test order
2. Check customer email for order confirmation
3. Check spam folder if not received

### Test Payment:
1. Use Razorpay test cards:
   - **Success:** 4111 1111 1111 1111
   - **Failure:** 4000 0000 0000 0002
   - **CVV:** Any 3 digits
   - **Expiry:** Any future date

2. Test UPI:
   - Use any test UPI ID: `success@razorpay`

## 📝 Notes

- **Email:** Make sure SMTP credentials are correct. Gmail requires app passwords for 2FA accounts.
- **Razorpay:** Test mode works without real money. Switch to live mode for production.
- **Security:** Never commit `.env` file to git. Use `.env.local` for local development.

## 🚀 Production Deployment

1. Update all environment variables in your hosting platform (Vercel, etc.)
2. Switch Razorpay to live keys
3. Update `NEXT_PUBLIC_SITE_URL` to your production URL
4. Test payment flow thoroughly
5. Monitor email delivery

