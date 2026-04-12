'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';
import Link from 'next/link';
import { FiArrowLeft, FiCreditCard, FiSmartphone, FiTruck, FiChevronRight, FiMapPin, FiShoppingCart, FiCheck } from 'react-icons/fi';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Cart from '@/components/Cart';

type PaymentMethod = 'upi' | 'card';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    cartItems,
    getTotalPrice,
    clearCart,
  } = useCart();

  const [currentStep, setCurrentStep] = useState(1); // 1: Address, 2: Billing, 3: Payment
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
  });

  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [billingData, setBillingData] = useState({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [deliveryInfo, setDeliveryInfo] = useState<{
    isServiceable: boolean;
    deliveryCharge: number;
    estimatedDays: number;
    zone: string;
    message?: string;
  } | null>(null);
  const [checkingDelivery, setCheckingDelivery] = useState(false);

  useEffect(() => {
    if (cartItems.length === 0) router.push('/products');
  }, [cartItems.length, router]);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setRazorpayLoaded(true);
    document.body.appendChild(script);
    return () => { if (document.body.contains(script)) document.body.removeChild(script); };
  }, []);

  useEffect(() => {
    if (formData.pincode && formData.pincode.length === 6) {
      const timer = setTimeout(() => checkDelivery(), 500);
      return () => clearTimeout(timer);
    }
  }, [formData.pincode]);

  const checkDelivery = async () => {
    if (!formData.pincode || formData.pincode.length !== 6) return;
    setCheckingDelivery(true);
    try {
      const resp = await fetch(`/api/delivery/check?pincode=${formData.pincode}&amount=${getTotalPrice()}`);
      const data = await resp.json();
      if (data.success) {
        setDeliveryInfo(data.data);
        if (!data.data.isServiceable) setErrors(p => ({ ...p, pincode: 'Delivery not available' }));
        else setErrors(p => { const { pincode, ...rest } = p; return rest; });
      }
    } catch (e) { console.error(e); } finally { setCheckingDelivery(false); }
  };

  const validateStep = (step: number) => {
    const newErrors: { [key: string]: string } = {};
    if (step <= 1) {
      if (!formData.firstName.trim()) newErrors.firstName = 'Required';
      if (!formData.lastName.trim()) newErrors.lastName = 'Required';
      if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email';
      if (!formData.phone.trim() || !/^[0-9]{10}$/.test(formData.phone)) newErrors.phone = '10 digits';
      if (!formData.address.trim()) newErrors.address = 'Required';
      if (!formData.city.trim()) newErrors.city = 'Required';
      if (!formData.state.trim()) newErrors.state = 'Required';
      if (!formData.pincode.trim() || !/^[0-9]{6}$/.test(formData.pincode)) newErrors.pincode = '6 digits';
    }
    if ((step === 2 || step === 0) && !sameAsShipping) {
      if (!billingData.firstName.trim()) newErrors.billing_firstName = 'Required';
      if (!billingData.address.trim()) newErrors.billing_address = 'Required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = async () => {
    // For desktop we validate all steps at once (step 0)
    if (!validateStep(0)) {
       window.scrollTo({ top: 0, behavior: 'smooth' });
       return;
    }
    setIsPlacingOrder(true);
    try {
      const orderItems = cartItems.map(i => ({ productId: i.id, name: i.name, price: i.price, quantity: i.quantity, image: i.image, weight: i.selectedSize || i.defaultWeight || '' }));
      const shippingAddress = { name: `${formData.firstName} ${formData.lastName}`, email: formData.email, phone: formData.phone, street: formData.address, city: formData.city, state: formData.state, zipCode: formData.pincode };
      
      const orderResp = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: orderItems, shipping: shippingAddress, billing: sameAsShipping ? shippingAddress : { name: `${billingData.firstName} ${billingData.lastName}`, street: billingData.address, city: billingData.city, state: billingData.state, zipCode: billingData.pincode }, shippingCost: deliveryInfo?.deliveryCharge || 0, subtotal: getTotalPrice(), total: getTotalPrice() + (deliveryInfo?.deliveryCharge || 0), paymentMethod, paymentStatus: 'pending' }) });
      const orderResult = await orderResp.json();
      if (!orderResult.success) throw new Error(orderResult.error);

      if (!razorpayLoaded || !window.Razorpay) throw new Error('Gateway loading...');
      const payResp = await fetch('/api/payment/create-order', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cartItems: orderItems, deliveryPincode: formData.pincode, orderId: orderResult.data.orderNumber }) });
      const payData = await payResp.json();
      
      const rzp = new window.Razorpay({ key: payData.keyId, amount: Math.round((getTotalPrice() + (deliveryInfo?.deliveryCharge || 0)) * 100), currency: 'INR', name: 'Gopi Misthan Bhandar', order_id: payData.orderId, handler: async (r: any) => {
        const v = await fetch('/api/payment/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId: orderResult.data.orderNumber, paymentId: r.razorpay_payment_id, signature: r.razorpay_signature, razorpayOrderId: r.razorpay_order_id }) });
        if ((await v.json()).success) { clearCart(); router.push(`/checkout/success?orderId=${orderResult.data.orderNumber}`); }
      }, prefill: { name: shippingAddress.name, email: shippingAddress.email, contact: shippingAddress.phone }, theme: { color: '#ba0606' } });
      rzp.open();
    } catch (e: any) { alert(e.message); setIsPlacingOrder(false); }
  };

  if (cartItems.length === 0) return null;

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* --- DESKTOP VIEW: STANDARD HEADER/NAV --- */}
      <div className="hidden lg:block"><Header /><Navigation /><Cart /></div>

      {/* --- MOBILE VIEW: MINI HEADER --- */}
      <header className="lg:hidden sticky top-0 z-[100] bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : router.back()} className="p-2 -ml-2"><FiArrowLeft className="w-6 h-6" /></button>
          <h1 className="text-xl font-bold">Checkout</h1>
          <div className="w-10"></div>
        </div>
      </header>

      {/* --- MOBILE VIEW: STEPPER --- */}
      <div className="lg:hidden bg-white border-b border-gray-200 sticky top-[61px] z-[90] px-6 py-4">
        <div className="flex items-center justify-between relative max-w-sm mx-auto">
          {[1, 2, 3].map(s => (
            <div key={s} className="z-10 flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${currentStep >= s ? 'bg-primary-red text-white' : 'bg-gray-100 text-gray-400'}`}>{s < currentStep ? '✓' : s}</div>
              <span className={`text-[10px] mt-1 font-bold ${currentStep >= s ? 'text-primary-red' : 'text-gray-400'}`}>{s === 1 ? 'Address' : s === 2 ? 'Billing' : 'Payment'}</span>
            </div>
          ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8 lg:py-12 flex flex-col lg:flex-row gap-8">
        {/* Left Section: Form */}
        <div className="flex-1 space-y-8">
          {/* Shipping Form (Always visible on desktop, step-based on mobile) */}
          <div className={`${currentStep === 1 || true ? '' : 'hidden lg:block'} bg-white rounded-2xl p-6 lg:p-10 shadow-sm border border-gray-100`}>
             <h2 className="text-xl font-bold mb-8 flex items-center gap-3"><FiMapPin className="text-primary-red" /> Shipping Address</h2>
             <div className="grid grid-cols-2 gap-5">
                <input placeholder="First Name" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className={`col-span-1 p-3 bg-gray-50 rounded-xl border ${errors.firstName ? 'border-red-500' : 'border-gray-100'}`} />
                <input placeholder="Last Name" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="col-span-1 p-3 bg-gray-50 rounded-xl border border-gray-100" />
                <input placeholder="Phone" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="col-span-2 p-3 bg-gray-50 rounded-xl border border-gray-100" />
                <input placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="col-span-2 p-3 bg-gray-50 rounded-xl border border-gray-100" />
                <textarea placeholder="Full Address" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} rows={3} className="col-span-2 p-3 bg-gray-50 rounded-xl border border-gray-100" />
                <input placeholder="Pincode" value={formData.pincode} onChange={e => setFormData({...formData, pincode: e.target.value})} className="col-span-1 p-3 bg-gray-50 rounded-xl border border-gray-100" />
                <input placeholder="City" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="col-span-1 p-3 bg-gray-50 rounded-xl border border-gray-100" />
                <input placeholder="State" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} className="col-span-2 p-3 bg-gray-50 rounded-xl border border-gray-100" />
             </div>
             {deliveryInfo && <div className={`mt-4 p-4 rounded-xl border ${deliveryInfo.isServiceable ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{deliveryInfo.message}</div>}
          </div>

          {/* Billing Form */}
          <div className={`${(currentStep === 2 || !true) ? '' : 'hidden lg:block'} bg-white rounded-2xl p-6 lg:p-10 shadow-sm border border-gray-100`}>
             <div className="flex items-center justify-between mb-8">
               <h2 className="text-xl font-bold">Billing Details</h2>
               <div className="flex items-center gap-2"><input type="checkbox" checked={sameAsShipping} onChange={e => setSameAsShipping(e.target.checked)} /><label className="text-sm font-bold">Same as shipping</label></div>
             </div>
             {!sameAsShipping && (
               <div className="grid grid-cols-2 gap-5">
                  <input placeholder="Full Name" value={billingData.firstName} onChange={e => setBillingData({...billingData, firstName: e.target.value})} className="col-span-2 p-3 bg-gray-50 rounded-xl border border-gray-100" />
                  <textarea placeholder="Billing Address" value={billingData.address} onChange={e => setBillingData({...billingData, address: e.target.value})} rows={2} className="col-span-2 p-3 bg-gray-50 rounded-xl border border-gray-100" />
                  <input placeholder="City" value={billingData.city} onChange={e => setBillingData({...billingData, city: e.target.value})} className="col-span-1 p-3 bg-gray-50 rounded-xl border border-gray-100" />
                  <input placeholder="State" value={billingData.state} onChange={e => setBillingData({...billingData, state: e.target.value})} className="col-span-1 p-3 bg-gray-50 rounded-xl border border-gray-100" />
               </div>
             )}
          </div>

          {/* Payment (Step 3 or Always on desktop) */}
          <div className={`${(currentStep === 3 || !true) ? '' : 'hidden lg:block'} bg-white rounded-2xl p-6 lg:p-10 shadow-sm border border-gray-100`}>
             <h2 className="text-xl font-bold mb-8">Payment Method</h2>
             <div className="flex flex-col gap-3">
                <label onClick={() => setPaymentMethod('upi')} className={`p-4 rounded-xl border-2 flex items-center gap-4 cursor-pointer ${paymentMethod === 'upi' ? 'border-[#FE8E02] bg-orange-50' : 'border-gray-50'}`}><FiSmartphone className="text-xl" /> <span className="font-bold">UPI / GPay / PhonePe</span></label>
                <label onClick={() => setPaymentMethod('card')} className={`p-4 rounded-xl border-2 flex items-center gap-4 cursor-pointer ${paymentMethod === 'card' ? 'border-[#FE8E02] bg-orange-50' : 'border-gray-50'}`}><FiCreditCard className="text-xl" /> <span className="font-bold">Debit / Credit Card</span></label>
             </div>
          </div>
        </div>

        {/* Right Section: Summary */}
        <aside className="w-full lg:w-96 space-y-6">
           <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24">
             <h2 className="text-xl font-bold mb-6">Order Summary</h2>
             {cartItems.map(i => (
               <div key={i.id} className="flex gap-4 mb-4">
                 <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-gray-100"><Image src={i.image} alt={i.name} fill className="object-cover" /></div>
                 <div><p className="text-sm font-bold line-clamp-1">{i.name}</p><p className="text-xs text-gray-400">Qty: {i.quantity} | {i.selectedSize || i.defaultWeight}</p></div>
               </div>
             ))}
             <div className="pt-6 border-t border-gray-100 space-y-3">
               <div className="flex justify-between text-sm"><span>Subtotal</span><span className="font-bold">₹{getTotalPrice().toLocaleString()}</span></div>
               <div className="flex justify-between text-sm"><span>Shipping</span><span className="font-bold">₹{deliveryInfo?.deliveryCharge || 0}</span></div>
               <div className="flex justify-between text-lg font-bold border-t pt-3"><span>Total</span><span className="text-primary-red">₹{(getTotalPrice()+(deliveryInfo?.deliveryCharge || 0)).toLocaleString()}</span></div>
             </div>
             
             {/* Desktop Action Button */}
             <button onClick={handlePlaceOrder} disabled={isPlacingOrder} className="hidden lg:block w-full mt-8 bg-gray-900 text-white py-4 rounded-2xl font-bold hover:bg-black transition-all">
               {isPlacingOrder ? 'Processing...' : 'Place Order & Pay Now'}
             </button>
           </div>
        </aside>
      </main>

      {/* --- MOBILE VIEW: STICKY ACTIONS --- */}
      <footer className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-[100] shadow-lg">
         <div className="flex items-center justify-between gap-4 max-w-md mx-auto">
            {currentStep < 3 ? (
              <button onClick={() => validateStep(currentStep) && setCurrentStep(currentStep+1)} className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2">Next <FiChevronRight /></button>
            ) : (
              <button onClick={handlePlaceOrder} disabled={isPlacingOrder} className="w-full bg-[#FE8E02] text-white py-4 rounded-xl font-bold">
                {isPlacingOrder ? 'Processing...' : `Pay ₹${(getTotalPrice()+(deliveryInfo?.deliveryCharge||0)).toLocaleString()}`}
              </button>
            )}
         </div>
      </footer>

      {/* --- DESKTOP VIEW: FOOTER --- */}
      <div className="hidden lg:block"><Footer /></div>
    </div>
  );
}
