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
import { parseWeightToKg, pickWeightLabel } from '@/lib/weight';

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
    openCart,
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
    email: '',
    phone: '',
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
    couriers?: any[];
    message?: string;
  } | null>(null);
  const [availableCouriers, setAvailableCouriers] = useState<any[]>([]);
  const [selectedCourier, setSelectedCourier] = useState<any>(null);
  const [checkingDelivery, setCheckingDelivery] = useState(false);
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [appliedCouponCode, setAppliedCouponCode] = useState('');
  const [appliedCouponDiscount, setAppliedCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [isRedirectingAfterPayment, setIsRedirectingAfterPayment] = useState(false);

  const subtotalAmount = getTotalPrice();
  const shippingAmount = selectedCourier?.charge || 0;
  const totalAmount = Math.max(0, subtotalAmount - appliedCouponDiscount + shippingAmount);

  useEffect(() => {
    if (cartItems.length === 0 && !isPlacingOrder && !isRedirectingAfterPayment) {
      router.push('/products');
    }
  }, [cartItems.length, isPlacingOrder, isRedirectingAfterPayment, router]);

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

  const buildOrderItems = () => {
    return cartItems.map(i => ({
      productId: i.id,
      name: i.name,
      price: i.price,
      quantity: i.quantity,
      image: i.image,
      weight: i.selectedWeight || i.selectedSize || i.defaultWeight || ''
    }));
  };

  const handleApplyCoupon = async () => {
    const normalizedCode = couponCodeInput.trim().toUpperCase();

    if (!normalizedCode) {
      setCouponError('Please enter a coupon code');
      setCouponSuccess('');
      return;
    }

    setCouponError('');
    setCouponSuccess('');
    setIsApplyingCoupon(true);

    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartItems: buildOrderItems(),
          couponCode: normalizedCode,
          deliveryPincode: formData.pincode,
          courierCharge: shippingAmount,
        }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to apply coupon');
      }

      const discount = Number(result.data?.breakdown?.discount || 0);
      if (!discount || discount <= 0) {
        throw new Error('Coupon is valid but no discount applied');
      }

      const appliedCode = String(result.data?.appliedCouponCode || normalizedCode);
      setAppliedCouponCode(appliedCode);
      setAppliedCouponDiscount(discount);
      setCouponCodeInput(appliedCode);
      setCouponSuccess(`Coupon applied successfully. You saved ₹${discount.toLocaleString()}`);
    } catch (error: any) {
      setAppliedCouponCode('');
      setAppliedCouponDiscount(0);
      setCouponSuccess('');
      setCouponError(error?.message || 'Unable to apply coupon right now');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCouponCode('');
    setAppliedCouponDiscount(0);
    setCouponError('');
    setCouponSuccess('Coupon removed');
  };

  const checkDelivery = async () => {
    if (!formData.pincode || formData.pincode.length !== 6) return;
    setCheckingDelivery(true);
    try {
      // Calculate total weight for the cart
      let totalWeight = 0;
      cartItems.forEach(item => {
        const lineWeight = pickWeightLabel(item) || '0.5kg';
        totalWeight += parseWeightToKg(lineWeight) * item.quantity;
      });
      if (totalWeight === 0) totalWeight = 0.5;

      const resp = await fetch('/api/delivery/check-pincode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          pincode: formData.pincode, 
          weight: totalWeight, 
          orderAmount: getTotalPrice() 
        })
      });
      
      const result = await resp.json();
      if (result.success) {
        setDeliveryInfo(result.data);
        if (result.data.isServiceable) {
          setAvailableCouriers(result.data.couriers);
          setSelectedCourier(result.data.cheapestOption);
          setErrors(p => { const { pincode, ...rest } = p; return rest; });
        } else {
          setAvailableCouriers([]);
          setSelectedCourier(null);
          setErrors(p => ({ ...p, pincode: 'Delivery not available at this pincode' }));
        }
      }
    } catch (e) { 
      console.error(e); 
    } finally { 
      setCheckingDelivery(false); 
    }
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
      if (!billingData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(billingData.email)) newErrors.billing_email = 'Invalid email';
      if (!billingData.phone.trim() || !/^[0-9]{10}$/.test(billingData.phone)) newErrors.billing_phone = '10 digits';
      if (!billingData.address.trim()) newErrors.billing_address = 'Required';
      if (!billingData.city.trim()) newErrors.billing_city = 'Required';
      if (!billingData.state.trim()) newErrors.billing_state = 'Required';
      if (!billingData.pincode.trim() || !/^[0-9]{6}$/.test(billingData.pincode)) newErrors.billing_pincode = '6 digits';
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

    let createdOrderNumber = '';

    try {
      const orderItems = buildOrderItems();
      const shippingAddress = { name: `${formData.firstName} ${formData.lastName}`, email: formData.email, phone: formData.phone, street: formData.address, city: formData.city, state: formData.state, zipCode: formData.pincode };
      const couponDiscount = appliedCouponDiscount || 0;
      const finalTotal = Math.max(0, getTotalPrice() - couponDiscount + (selectedCourier?.charge || 0));
      
      // Step 1: Create order in database
      const orderResp = await fetch('/api/orders', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ 
          items: orderItems, 
          shipping: shippingAddress, 
          billing: sameAsShipping ? shippingAddress : {
            name: `${billingData.firstName} ${billingData.lastName}`,
            email: billingData.email,
            phone: billingData.phone,
            street: billingData.address,
            city: billingData.city,
            state: billingData.state,
            zipCode: billingData.pincode,
          }, 
          shippingCost: selectedCourier?.charge || 0, 
          subtotal: getTotalPrice(), 
          couponDiscount,
          appliedCouponCode: appliedCouponCode || undefined,
          total: finalTotal,
          paymentMethod, 
          paymentStatus: 'pending',
          selectedCourier: selectedCourier?.name,
          selectedCourierId: selectedCourier?.id ? String(selectedCourier.id) : undefined,
          deliveryCharge: selectedCourier?.charge
        }) 
      });
      const orderResult = await orderResp.json();
      if (!orderResult.success) throw new Error(orderResult.error || 'Failed to create order');
      createdOrderNumber = orderResult.data.orderNumber;

      // Step 2: Check Razorpay is loaded
      if (!razorpayLoaded || !window.Razorpay) throw new Error('Payment gateway is still loading. Please try again.');

      // Step 3: Create Razorpay payment order
      const payResp = await fetch('/api/payment/create-order', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ 
          cartItems: orderItems, 
          couponCode: appliedCouponCode || undefined,
          deliveryPincode: formData.pincode
        }) 
      });
      const payData = await payResp.json();
      if (!payData.success) throw new Error(payData.error || 'Failed to initiate payment');
      
      // Step 4: Open Razorpay checkout modal
      const rzp = new window.Razorpay({ 
        key: payData.keyId, 
        amount: Math.round((payData.finalAmount || 0) * 100), 
        currency: 'INR', 
        name: 'Gopi Misthan Bhandar', 
        description: `Order #${createdOrderNumber}`,
        order_id: payData.orderId, 
        handler: async (r: any) => {
          // Payment completed by user — now verify on server
          try {
            const verifyResp = await fetch('/api/payment/verify', { 
              method: 'POST', 
              headers: { 'Content-Type': 'application/json' }, 
              body: JSON.stringify({ 
                orderId: createdOrderNumber, 
                paymentId: r.razorpay_payment_id, 
                signature: r.razorpay_signature
              }) 
            });
            const verifyResult = await verifyResp.json();
            
            if (verifyResult.success) {
              // Payment verified! Clear cart and redirect to success
              setIsRedirectingAfterPayment(true);
              clearCart();
              router.replace(`/checkout/success?orderId=${createdOrderNumber}&paymentId=${r.razorpay_payment_id}`);
            } else {
              // Verification failed — redirect to failed page
              setIsRedirectingAfterPayment(true);
              router.replace(`/checkout/failed?orderId=${createdOrderNumber}&reason=${encodeURIComponent(verifyResult.error || 'Payment verification failed')}`);
            }
          } catch (verifyError) {
            // Network error during verification — still redirect to success
            // The webhook will handle the actual status update
            setIsRedirectingAfterPayment(true);
            clearCart();
            router.replace(`/checkout/success?orderId=${createdOrderNumber}&paymentId=${r.razorpay_payment_id}`);
          }
        },
        modal: {
          ondismiss: () => {
            // User closed Razorpay popup without completing payment
            setIsPlacingOrder(false);
            setIsRedirectingAfterPayment(true);
            router.replace(`/checkout/failed?orderId=${createdOrderNumber}&reason=${encodeURIComponent('Payment was cancelled. You can retry from your orders page.')}`);
          },
          escape: true,
          confirm_close: true,
        },
        prefill: { name: shippingAddress.name, email: shippingAddress.email, contact: shippingAddress.phone }, 
        theme: { color: '#ba0606' },
        retry: { enabled: true, max_count: 3 },
      });
      
      rzp.on('payment.failed', (response: any) => {
        // Razorpay payment failed (bank declined, etc.)
        const reason = response.error?.description || response.error?.reason || 'Payment failed';
        setIsPlacingOrder(false);
        setIsRedirectingAfterPayment(true);
        router.replace(`/checkout/failed?orderId=${createdOrderNumber}&reason=${encodeURIComponent(reason)}&code=${response.error?.code || ''}`);
      });

      rzp.open();
    } catch (e: any) {
      setIsPlacingOrder(false);
      if (createdOrderNumber) {
        // Order was created but payment failed to start — redirect to failed page
        setIsRedirectingAfterPayment(true);
        router.replace(`/checkout/failed?orderId=${createdOrderNumber}&reason=${encodeURIComponent(e.message || 'Something went wrong')}`);
      } else {
        // Order creation itself failed — show error on checkout page
        setErrors(prev => ({ ...prev, general: e.message || 'Something went wrong. Please try again.' }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  if (cartItems.length === 0) return null;

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* --- DESKTOP VIEW: STANDARD HEADER/NAV --- */}
      <div className="hidden lg:block"><Header /><Navigation /></div>

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

      {/* Cart drawer should be available on both desktop and mobile checkout */}
      <Cart />

      <main className="max-w-7xl mx-auto px-4 py-8 lg:py-12 flex flex-col lg:flex-row gap-8">
        {/* Left Section: Form */}
        <div className="flex-1 space-y-8">
          {/* General Error Banner */}
          {errors.general && (
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div>
                <p className="text-red-800 font-bold text-sm">Order could not be placed</p>
                <p className="text-red-600 text-sm mt-1">{errors.general}</p>
              </div>
              <button onClick={() => setErrors(prev => { const { general, ...rest } = prev; return rest; })} className="ml-auto text-red-400 hover:text-red-600">✕</button>
            </div>
          )}
          {/* Shipping Form (Always visible on desktop, step-based on mobile) */}
          <div className={`${currentStep === 1 || true ? '' : 'hidden lg:block'} bg-white rounded-2xl p-6 lg:p-10 shadow-sm border border-gray-100`}>
             <h2 className="text-xl font-bold mb-8 flex items-center gap-3"><FiMapPin className="text-primary-red" /> Shipping Address</h2>
             <div className="grid grid-cols-2 gap-5">
                <input placeholder="First Name" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className={`col-span-1 p-3 bg-gray-50 rounded-xl border ${errors.firstName ? 'border-red-500' : 'border-gray-100'}`} />
                <input placeholder="Last Name" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="col-span-1 p-3 bg-gray-50 rounded-xl border border-gray-100" />
                <input placeholder="Phone" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="col-span-2 p-3 bg-gray-50 rounded-xl border border-gray-100" />
                <input placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="col-span-2 p-3 bg-gray-50 rounded-xl border border-gray-100" />
                <textarea placeholder="Full Address" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} rows={3} className="col-span-2 p-3 bg-gray-50 rounded-xl border border-gray-100" />
                <input placeholder="Pincode" value={formData.pincode} onChange={e => setFormData({...formData, pincode: e.target.value})} className="col-span-1 p-3 bg-gray-50 rounded-xl border border-gray-100 placeholder:text-gray-400" />
                <input placeholder="City" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="col-span-1 p-3 bg-gray-50 rounded-xl border border-gray-100 placeholder:text-gray-400" />
                <input placeholder="State" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} className="col-span-2 p-3 bg-gray-50 rounded-xl border border-gray-100 placeholder:text-gray-400" />
             </div>

             {checkingDelivery && (
               <div className="mt-4 flex items-center justify-center p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                 <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-red mr-3"></div>
                 <span className="text-sm font-medium text-gray-500">Checking serviceability...</span>
               </div>
             )}

             {deliveryInfo && !checkingDelivery && (
               <div className="mt-6 space-y-4">
                 {!deliveryInfo.isServiceable ? (
                   <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-primary-red flex items-center gap-3">
                     <div className="w-2 h-2 rounded-full bg-primary-red animate-pulse"></div>
                     <span className="text-sm font-bold">Delivery not available at this pincode</span>
                   </div>
                 ) : (
                   <div className="space-y-3">
                     <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                       <FiTruck className="text-primary-red" /> Select Delivery Option:
                     </h3>
                     <div className="grid grid-cols-1 gap-3">
                       {availableCouriers.map((courier: any, idx: number) => (
                         <div 
                           key={courier.name + idx}
                           onClick={() => setSelectedCourier(courier)}
                           className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                             selectedCourier?.name === courier.name 
                               ? 'border-primary-red bg-red-50/30' 
                                : 'border-gray-100 hover:border-gray-200 bg-white'
                           }`}
                         >
                           <div className="flex items-center gap-3">
                             <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                               selectedCourier?.name === courier.name ? 'border-primary-red bg-primary-red' : 'border-gray-300'
                             }`}>
                               {selectedCourier?.name === courier.name && <FiCheck className="text-white w-3 h-3" />}
                             </div>
                             <div>
                               <p className="text-sm font-bold text-gray-900">{courier.name}</p>
                               <p className="text-xs text-gray-500">Estimated delivery: {courier.estimatedDays} days</p>
                             </div>
                           </div>
                           <div className="text-right">
                             <p className="text-sm font-black text-primary-red">₹{courier.charge}</p>
                           </div>
                         </div>
                       ))}
                     </div>
                   </div>
                 )}
               </div>
             )}
          </div>

          {/* Billing Form */}
          <div className={`${(currentStep === 2 || !true) ? '' : 'hidden lg:block'} bg-white rounded-2xl p-6 lg:p-10 shadow-sm border border-gray-100`}>
             <div className="flex items-center justify-between mb-8">
               <h2 className="text-xl font-bold">Billing Details</h2>
               <div className="flex items-center gap-2"><input type="checkbox" checked={sameAsShipping} onChange={e => setSameAsShipping(e.target.checked)} /><label className="text-sm font-bold">Same as shipping</label></div>
             </div>
             {!sameAsShipping && (
               <div className="grid grid-cols-2 gap-5">
                  <input placeholder="Full Name" value={billingData.firstName} onChange={e => setBillingData({...billingData, firstName: e.target.value})} className={`col-span-2 p-3 bg-gray-50 rounded-xl border ${errors.billing_firstName ? 'border-red-500' : 'border-gray-100'}`} />
                  <input placeholder="Billing Email" value={billingData.email} onChange={e => setBillingData({...billingData, email: e.target.value})} className={`col-span-2 p-3 bg-gray-50 rounded-xl border ${errors.billing_email ? 'border-red-500' : 'border-gray-100'}`} />
                  <input placeholder="Billing Phone" value={billingData.phone} onChange={e => setBillingData({...billingData, phone: e.target.value})} className={`col-span-2 p-3 bg-gray-50 rounded-xl border ${errors.billing_phone ? 'border-red-500' : 'border-gray-100'}`} />
                  <textarea placeholder="Billing Address" value={billingData.address} onChange={e => setBillingData({...billingData, address: e.target.value})} rows={2} className={`col-span-2 p-3 bg-gray-50 rounded-xl border ${errors.billing_address ? 'border-red-500' : 'border-gray-100'}`} />
                  <input placeholder="City" value={billingData.city} onChange={e => setBillingData({...billingData, city: e.target.value})} className={`col-span-1 p-3 bg-gray-50 rounded-xl border ${errors.billing_city ? 'border-red-500' : 'border-gray-100'}`} />
                  <input placeholder="State" value={billingData.state} onChange={e => setBillingData({...billingData, state: e.target.value})} className={`col-span-1 p-3 bg-gray-50 rounded-xl border ${errors.billing_state ? 'border-red-500' : 'border-gray-100'}`} />
                  <input placeholder="Pincode" value={billingData.pincode} onChange={e => setBillingData({...billingData, pincode: e.target.value})} className={`col-span-2 p-3 bg-gray-50 rounded-xl border ${errors.billing_pincode ? 'border-red-500' : 'border-gray-100'}`} />
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
               <div key={`${i.id}-${i.selectedWeight || i.selectedSize || i.defaultWeight || 'base'}`} className="flex gap-4 mb-4">
                 <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-gray-100"><Image src={i.image} alt={i.name} fill className="object-cover" /></div>
                <div><p className="text-sm font-bold line-clamp-1">{i.name}</p><p className="text-xs text-gray-400">Qty: {i.quantity} | {i.selectedWeight || i.selectedSize || i.defaultWeight}</p></div>
               </div>
             ))}

             <button
               type="button"
               onClick={openCart}
               className="w-full mb-4 inline-flex items-center justify-center gap-2 rounded-xl border border-[#FE8E02]/35 bg-[#fff7ed] px-4 py-3 text-[13px] font-bold text-[#8f4e07] hover:bg-[#ffedd5] transition-colors"
             >
               <FiShoppingCart className="w-4 h-4" />
               Modify Items (Go to Cart)
             </button>

             <div className="pt-6 border-t border-gray-100 space-y-3">
               <div className="p-3 rounded-xl border border-gray-100 bg-gray-50">
                 <p className="text-xs font-bold text-gray-700 mb-2">Have a coupon?</p>
                 <div className="flex items-center gap-2">
                   <input
                     type="text"
                     value={couponCodeInput}
                     onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                     placeholder="Enter code"
                     disabled={isApplyingCoupon || isPlacingOrder}
                     className="flex-1 p-2 text-sm rounded-lg border border-gray-200 bg-white disabled:bg-gray-100"
                   />
                   {appliedCouponCode ? (
                     <button
                       onClick={handleRemoveCoupon}
                       type="button"
                       className="px-3 py-2 text-xs font-bold rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100"
                     >
                       Remove
                     </button>
                   ) : (
                     <button
                       onClick={handleApplyCoupon}
                       type="button"
                       disabled={isApplyingCoupon || isPlacingOrder}
                       className="px-3 py-2 text-xs font-bold rounded-lg bg-gray-900 text-white disabled:opacity-50"
                     >
                       {isApplyingCoupon ? 'Applying...' : 'Apply'}
                     </button>
                   )}
                 </div>
                 {couponError && <p className="text-xs text-red-600 mt-2">{couponError}</p>}
                 {couponSuccess && <p className="text-xs text-green-700 mt-2">{couponSuccess}</p>}
                 {appliedCouponCode && (
                   <p className="text-[11px] text-gray-500 mt-1">Applied: {appliedCouponCode}</p>
                 )}
               </div>
               <div className="flex justify-between text-sm"><span>Subtotal</span><span className="font-bold">₹{subtotalAmount.toLocaleString()}</span></div>
               <div className="flex justify-between text-sm"><span>Shipping</span><span className="font-bold">₹{shippingAmount.toLocaleString()}</span></div>
               {appliedCouponDiscount > 0 && (
                 <div className="flex justify-between text-sm text-green-700"><span>Coupon Discount</span><span className="font-bold">-₹{appliedCouponDiscount.toLocaleString()}</span></div>
               )}
               <div className="flex justify-between text-lg font-bold border-t pt-3"><span>Total</span><span className="text-primary-red">₹{totalAmount.toLocaleString()}</span></div>
             </div>
             
             {/* Desktop Action Button */}
             <button onClick={handlePlaceOrder} disabled={isPlacingOrder || !selectedCourier} className="hidden lg:block w-full mt-8 bg-gray-900 text-white py-4 rounded-2xl font-bold hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed">
               {isPlacingOrder ? 'Processing...' : 'Place Order & Pay Now'}
             </button>
           </div>
        </aside>
      </main>

      {/* --- MOBILE VIEW: STICKY ACTIONS --- */}
      <footer className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-[100] shadow-lg">
         <div className="flex flex-col gap-3 max-w-md mx-auto">
            {currentStep < 3 ? (
              <button onClick={() => validateStep(currentStep) && setCurrentStep(currentStep+1)} className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2">Next <FiChevronRight /></button>
            ) : (
              <button onClick={handlePlaceOrder} disabled={isPlacingOrder || !selectedCourier} className="w-full bg-[#FE8E02] text-white py-4 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed">
                {isPlacingOrder ? 'Processing...' : `Pay ₹${totalAmount.toLocaleString()}`}
              </button>
            )}

            <button
              type="button"
              onClick={openCart}
              className="w-full text-center text-[13px] font-bold text-[#8f4e07] underline decoration-[#FE8E02]/60 underline-offset-4"
            >
              Want to add/remove items? Go to Cart
            </button>
         </div>
      </footer>

      {/* --- DESKTOP VIEW: FOOTER --- */}
      <div className="hidden lg:block"><Footer /></div>
    </div>
  );
}
