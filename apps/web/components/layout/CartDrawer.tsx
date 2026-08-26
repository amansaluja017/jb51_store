'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useCart, CartItem } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';
import { X, Plus, Minus, Trash2, ShoppingBag, Lock, CreditCard, Sparkles, ArrowRight, CheckCircle, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export function CartDrawer() {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    clearCart,
    isCartOpen,
    setIsCartOpen,
    cartTotal,
    cartCount
  } = useCart();

  // Checkout Wizard steps: 'cart' | 'shipping' | 'payment' | 'success'
  const [step, setStep] = useState<'cart' | 'shipping' | 'payment' | 'success'>('cart');
  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
    phone: ''
  });
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    expiry: '',
    cvv: '',
    nameOnCard: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderId, setOrderId] = useState('');

  // Shipping thresholds
  const freeShippingThreshold = 30000;
  const isFreeShipping = cartTotal >= freeShippingThreshold;
  const amountToFreeShipping = freeShippingThreshold - cartTotal;

  const handleClose = () => {
    setIsCartOpen(false);
    // Reset wizard step on close unless it was a success screen (let user see success)
    if (step !== 'success') {
      setTimeout(() => setStep('cart'), 300);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, stateSetter: any) => {
    const { name, value } = e.target;
    stateSetter((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleGoToShipping = (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return;
    setStep('shipping');
  };

  const handleGoToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingInfo.name || !shippingInfo.email || !shippingInfo.address || !shippingInfo.phone) {
      toast.error('Please fill in all required shipping fields.');
      return;
    }
    setStep('payment');
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentInfo.cardNumber || !paymentInfo.expiry || !paymentInfo.cvv) {
      toast.error('Please fill in your payment details.');
      return;
    }
    setIsSubmitting(true);

    // Simulate payment processing
    setTimeout(() => {
      setIsSubmitting(false);
      const generatedOrderId = `JB51-${Math.floor(100000 + Math.random() * 900000)}`;
      setOrderId(generatedOrderId);
      setStep('success');
      clearCart();
      toast.success('Order placed successfully!');
    }, 2000);
  };

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={handleClose}
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        {/* Panel */}
        <div className="w-screen max-w-md bg-white text-brand-charcoal flex flex-col shadow-2xl relative border-l border-zinc-100">
          
          {/* Header */}
          <div className="px-6 py-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
            <div className="flex items-center gap-3">
              <ShoppingBag size={20} className="text-[#FF5E36]" />
              <h2 className="text-lg font-serif font-semibold tracking-wide text-brand-charcoal">
                {step === 'cart' && `Shopping Cart (${cartCount})`}
                {step === 'shipping' && 'Shipping Details'}
                {step === 'payment' && 'Payment Method'}
                {step === 'success' && 'Order Confirmed'}
              </h2>
            </div>
            <button 
              onClick={handleClose}
              className="p-1.5 rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            
            {/* Step 1: CART VIEW */}
            {step === 'cart' && (
              <>
                {/* Shipping goal meter */}
                {cartItems.length > 0 && (
                  <div className="bg-zinc-50 p-4 rounded-xl mb-6 border border-zinc-100 text-xs">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5 font-medium text-zinc-700">
                        <Sparkles size={14} className="text-[#FF5E36]" />
                        <span>{isFreeShipping ? 'You qualify for Free Shipping!' : `Add ${formatPrice(amountToFreeShipping)} more for Free Shipping`}</span>
                      </div>
                      <span className="font-semibold text-zinc-500">{isFreeShipping ? '100%' : `${Math.min(100, Math.round((cartTotal / freeShippingThreshold) * 100))}%`}</span>
                    </div>
                    <div className="w-full bg-zinc-200 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-[#FF5E36] h-full transition-all duration-500 ease-out" 
                        style={{ width: `${Math.min(100, (cartTotal / freeShippingThreshold) * 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                {cartItems.length === 0 ? (
                  <div className="h-[60vh] flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 rounded-full bg-zinc-50 flex items-center justify-center mb-6 text-zinc-300">
                      <ShoppingBag size={36} />
                    </div>
                    <p className="text-base font-serif text-zinc-800 font-semibold mb-2">Your cart is empty</p>
                    <p className="text-zinc-500 text-xs max-w-[240px] leading-relaxed mb-8">
                      Explore our collections and discover premium silhouettes tailored for you.
                    </p>
                    <button 
                      onClick={handleClose}
                      className="bg-brand-charcoal hover:bg-[#FF5E36] text-white px-8 py-3.5 rounded-full text-xs font-semibold uppercase tracking-widest transition-all duration-300"
                    >
                      Start Shopping
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex gap-4 py-4 border-b border-zinc-100 last:border-b-0 group">
                        <div className="relative aspect-[3/4] w-20 bg-zinc-50 rounded-lg overflow-hidden border border-zinc-100 flex-shrink-0">
                          <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover" />
                        </div>
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start">
                              <h3 className="text-sm font-serif font-semibold text-zinc-950 pr-4 group-hover:text-[#FF5E36] transition-colors leading-snug">
                                {item.product.name}
                              </h3>
                              <button 
                                onClick={() => removeFromCart(item.id)}
                                className="text-zinc-300 hover:text-red-500 transition-colors p-1"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                            <div className="flex flex-wrap gap-x-3 text-[10px] text-zinc-400 mt-1 uppercase tracking-wider font-semibold">
                              <span>Size: <strong className="text-zinc-600">{item.size}</strong></span>
                              <span>Color: <strong className="text-zinc-600">{item.color}</strong></span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center mt-2">
                            {/* Quantity Controls */}
                            <div className="flex items-center border border-zinc-200 rounded-full py-1 px-2.5 bg-zinc-50">
                              <button 
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="p-0.5 text-zinc-500 hover:text-zinc-800 transition-colors"
                              >
                                <Minus size={11} />
                              </button>
                              <span className="w-8 text-center text-xs font-semibold text-zinc-800">{item.quantity}</span>
                              <button 
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="p-0.5 text-zinc-500 hover:text-zinc-800 transition-colors"
                              >
                                <Plus size={11} />
                              </button>
                            </div>
                            <span className="text-sm font-serif font-bold text-zinc-900">
                              {formatPrice(item.product.price * item.quantity)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Step 2: SHIPPING DETAILS */}
            {step === 'shipping' && (
              <form onSubmit={handleGoToPayment} className="space-y-4 pt-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={shippingInfo.name}
                    onChange={(e) => handleInputChange(e, setShippingInfo)}
                    className="w-full border border-zinc-200 rounded-xl px-4 py-3 text-xs bg-zinc-50 focus:bg-white focus:ring-1 focus:ring-[#FF5E36] focus:border-[#FF5E36] outline-none transition-all"
                    placeholder="Jane Doe"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={shippingInfo.email}
                    onChange={(e) => handleInputChange(e, setShippingInfo)}
                    className="w-full border border-zinc-200 rounded-xl px-4 py-3 text-xs bg-zinc-50 focus:bg-white focus:ring-1 focus:ring-[#FF5E36] focus:border-[#FF5E36] outline-none transition-all"
                    placeholder="jane@example.com"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={shippingInfo.phone}
                    onChange={(e) => handleInputChange(e, setShippingInfo)}
                    className="w-full border border-zinc-200 rounded-xl px-4 py-3 text-xs bg-zinc-50 focus:bg-white focus:ring-1 focus:ring-[#FF5E36] focus:border-[#FF5E36] outline-none transition-all"
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Shipping Address *</label>
                  <input
                    type="text"
                    name="address"
                    required
                    value={shippingInfo.address}
                    onChange={(e) => handleInputChange(e, setShippingInfo)}
                    className="w-full border border-zinc-200 rounded-xl px-4 py-3 text-xs bg-zinc-50 focus:bg-white focus:ring-1 focus:ring-[#FF5E36] focus:border-[#FF5E36] outline-none transition-all"
                    placeholder="House No, Street Name"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">City *</label>
                    <input
                      type="text"
                      name="city"
                      required
                      value={shippingInfo.city}
                      onChange={(e) => handleInputChange(e, setShippingInfo)}
                      className="w-full border border-zinc-200 rounded-xl px-4 py-3 text-xs bg-zinc-50 focus:bg-white focus:ring-1 focus:ring-[#FF5E36] focus:border-[#FF5E36] outline-none transition-all"
                      placeholder="Mumbai"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Postal Code *</label>
                    <input
                      type="text"
                      name="postalCode"
                      required
                      value={shippingInfo.postalCode}
                      onChange={(e) => handleInputChange(e, setShippingInfo)}
                      className="w-full border border-zinc-200 rounded-xl px-4 py-3 text-xs bg-zinc-50 focus:bg-white focus:ring-1 focus:ring-[#FF5E36] focus:border-[#FF5E36] outline-none transition-all"
                      placeholder="400001"
                    />
                  </div>
                </div>
              </form>
            )}

            {/* Step 3: PAYMENT DETAILS */}
            {step === 'payment' && (
              <form onSubmit={handlePlaceOrder} className="space-y-4 pt-2">
                {/* Visual Card Mockup */}
                <div className="w-full aspect-[1.6/1] bg-gradient-to-br from-[#1F1A1B] via-zinc-800 to-zinc-950 text-white rounded-2xl p-5 shadow-xl relative overflow-hidden mb-6 flex flex-col justify-between">
                  <div className="absolute right-0 bottom-0 w-48 h-48 bg-[#FF5E36]/10 blur-3xl pointer-events-none rounded-full" />
                  <div className="flex justify-between items-start">
                    <span className="font-serif text-sm tracking-wider font-semibold">JB51 Privilege Pay</span>
                    <CreditCard size={28} className="text-white/40" />
                  </div>
                  
                  <div className="text-base font-mono tracking-[0.2em] my-4 text-center">
                    {paymentInfo.cardNumber 
                      ? paymentInfo.cardNumber.replace(/(.{4})/g, '$1 ') 
                      : '•••• •••• •••• ••••'}
                  </div>

                  <div className="flex justify-between items-center text-[9px] uppercase tracking-widest text-zinc-400">
                    <div>
                      <span className="block text-[8px] text-zinc-500 mb-0.5">Card Holder</span>
                      <span className="font-mono text-white text-xs">{paymentInfo.nameOnCard || 'YOUR NAME'}</span>
                    </div>
                    <div>
                      <span className="block text-[8px] text-zinc-500 mb-0.5">Expires</span>
                      <span className="font-mono text-white text-xs">{paymentInfo.expiry || 'MM/YY'}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Name on Card *</label>
                  <input
                    type="text"
                    name="nameOnCard"
                    required
                    value={paymentInfo.nameOnCard}
                    onChange={(e) => handleInputChange(e, setPaymentInfo)}
                    className="w-full border border-zinc-200 rounded-xl px-4 py-3 text-xs bg-zinc-50 focus:bg-white focus:ring-1 focus:ring-[#FF5E36] focus:border-[#FF5E36] outline-none transition-all"
                    placeholder="Jane Doe"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Card Number *</label>
                  <input
                    type="text"
                    name="cardNumber"
                    required
                    maxLength={16}
                    value={paymentInfo.cardNumber}
                    onChange={(e) => {
                      // Allow numbers only
                      const val = e.target.value.replace(/\D/g, '');
                      setPaymentInfo(prev => ({ ...prev, cardNumber: val }));
                    }}
                    className="w-full border border-zinc-200 rounded-xl px-4 py-3 text-xs bg-zinc-50 focus:bg-white focus:ring-1 focus:ring-[#FF5E36] focus:border-[#FF5E36] outline-none transition-all"
                    placeholder="1234567890123456"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Expiry *</label>
                    <input
                      type="text"
                      name="expiry"
                      required
                      placeholder="MM/YY"
                      maxLength={5}
                      value={paymentInfo.expiry}
                      onChange={(e) => {
                        let val = e.target.value.replace(/\D/g, '');
                        if (val.length > 2) {
                          val = `${val.slice(0, 2)}/${val.slice(2, 4)}`;
                        }
                        setPaymentInfo(prev => ({ ...prev, expiry: val }));
                      }}
                      className="w-full border border-zinc-200 rounded-xl px-4 py-3 text-xs bg-zinc-50 focus:bg-white focus:ring-1 focus:ring-[#FF5E36] focus:border-[#FF5E36] outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">CVV *</label>
                    <input
                      type="password"
                      name="cvv"
                      required
                      maxLength={3}
                      value={paymentInfo.cvv}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        setPaymentInfo(prev => ({ ...prev, cvv: val }));
                      }}
                      className="w-full border border-zinc-200 rounded-xl px-4 py-3 text-xs bg-zinc-50 focus:bg-white focus:ring-1 focus:ring-[#FF5E36] focus:border-[#FF5E36] outline-none transition-all"
                      placeholder="•••"
                    />
                  </div>
                </div>
              </form>
            )}

            {/* Step 4: ORDER SUCCESS VIEW */}
            {step === 'success' && (
              <div className="h-[70vh] flex flex-col items-center justify-center text-center px-4">
                <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mb-6 animate-bounce">
                  <CheckCircle size={44} />
                </div>
                <h3 className="text-xl font-serif text-zinc-950 font-semibold mb-2">Order Confirmed!</h3>
                <p className="text-zinc-500 text-xs max-w-[280px] leading-relaxed mb-6">
                  Thank you for shopping with JB51. Your order has been placed successfully and is being processed by our atelier.
                </p>
                <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100 w-full mb-8 text-left text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-zinc-400 font-medium">Order Number:</span>
                    <span className="font-mono text-zinc-800 font-bold">{orderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400 font-medium">Delivery To:</span>
                    <span className="text-zinc-800 font-semibold">{shippingInfo.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400 font-medium">Estimated Delivery:</span>
                    <span className="text-zinc-800 font-semibold">5-7 Business Days</span>
                  </div>
                </div>
                <button 
                  onClick={handleClose}
                  className="w-full bg-brand-charcoal hover:bg-[#FF5E36] text-white py-4 rounded-full text-xs font-semibold uppercase tracking-widest transition-all duration-300"
                >
                  Continue Shopping
                </button>
              </div>
            )}

          </div>

          {/* Footer Subtotal & Action CTA */}
          {step !== 'success' && cartItems.length > 0 && (
            <div className="border-t border-zinc-100 p-6 bg-zinc-50/50">
              <div className="space-y-2.5 mb-6 text-xs text-zinc-500">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-zinc-900 font-semibold">{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-zinc-900 font-semibold">
                    {isFreeShipping ? 'FREE' : formatPrice(450)}
                  </span>
                </div>
                <div className="border-t border-zinc-200/80 pt-2.5 flex justify-between text-sm font-serif font-bold text-zinc-900">
                  <span>Total</span>
                  <span>{formatPrice(cartTotal + (isFreeShipping ? 0 : 450))}</span>
                </div>
              </div>

              {step === 'cart' && (
                <button 
                  onClick={handleGoToShipping}
                  className="w-full bg-brand-charcoal hover:bg-[#FF5E36] text-white py-4 rounded-full text-xs font-semibold uppercase tracking-[0.25em] flex items-center justify-center gap-2.5 transition-all duration-300"
                >
                  <span>Checkout Securely</span>
                  <ArrowRight size={14} />
                </button>
              )}

              {step === 'shipping' && (
                <div className="flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setStep('cart')}
                    className="flex items-center justify-center p-4 border border-zinc-200 text-zinc-500 hover:text-zinc-800 hover:border-zinc-800 transition-all rounded-full bg-white"
                  >
                    <ArrowLeft size={16} />
                  </button>
                  <button 
                    type="button"
                    onClick={handleGoToPayment}
                    className="flex-1 bg-brand-charcoal hover:bg-[#FF5E36] text-white py-4 rounded-full text-xs font-semibold uppercase tracking-[0.25em] flex items-center justify-center gap-2.5 transition-all duration-300"
                  >
                    <span>Continue to Payment</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              )}

              {step === 'payment' && (
                <div className="flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setStep('shipping')}
                    className="flex items-center justify-center p-4 border border-zinc-200 text-zinc-500 hover:text-zinc-800 hover:border-zinc-800 transition-all rounded-full bg-white"
                  >
                    <ArrowLeft size={16} />
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    onClick={handlePlaceOrder}
                    className="flex-1 bg-brand-charcoal hover:bg-[#FF5E36] text-white py-4 rounded-full text-xs font-semibold uppercase tracking-[0.25em] flex items-center justify-center gap-2.5 transition-all duration-300 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Lock size={13} />
                        <span>Place Order {formatPrice(cartTotal + (isFreeShipping ? 0 : 450))}</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
