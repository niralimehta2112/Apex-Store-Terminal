import React, { useState } from 'react';
import { CartItem, OrderConfirmation } from '../../types';
import { X, CheckCircle, ShieldCheck, CreditCard, Coins, Building, ArrowLeft, Check } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  total: number;
  onOrderPlaced: (order: OrderConfirmation) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  total,
  onOrderPlaced,
}) => {
  const [step, setStep] = useState<'details' | 'success'>('details');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'crypto' | 'credit'>('card');
  const [confirmedOrder, setConfirmedOrder] = useState<OrderConfirmation | null>(null);

  // Form fields
  const [formData, setFormData] = useState({
    fullName: 'Alexander Wright',
    email: 'alex.wright@apextech.io',
    street: '742 Evergreen Terrace, Suite 400',
    city: 'San Francisco',
    zipCode: '94107',
    country: 'United States',
    cardNumber: '•••• •••• •••• 4242',
    cardExp: '12/28',
    cardCvc: '888',
  });

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const order: OrderConfirmation = {
      orderId: `APX-${Math.floor(100000 + Math.random() * 900000)}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      items: [...items],
      total,
      shippingAddress: {
        fullName: formData.fullName,
        street: formData.street,
        city: formData.city,
        zipCode: formData.zipCode,
        country: formData.country,
      },
      paymentMethod: paymentMethod === 'card' ? 'Visa •••• 4242' : paymentMethod === 'crypto' ? 'USDC Web3 Instant Settlement' : 'Apex Store Credit',
    };

    setConfirmedOrder(order);
    setStep('success');
    onOrderPlaced(order);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-white text-base">
              {step === 'details' ? 'Secure Checkout & Settlement' : 'Order Confirmed'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 'details' ? (
          <form onSubmit={handleSubmitOrder} className="p-6 space-y-6">
            {/* Shipping Details */}
            <div>
              <h4 className="text-xs uppercase font-bold tracking-wider text-slate-400 mb-3">
                1. Shipping & Contact Information
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="sm:col-span-2">
                  <label className="block text-slate-400 mb-1">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-slate-400 mb-1">Delivery Address</label>
                  <input
                    type="text"
                    name="street"
                    required
                    value={formData.street}
                    onChange={handleInputChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">City</label>
                  <input
                    type="text"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Postal / ZIP Code</label>
                  <input
                    type="text"
                    name="zipCode"
                    required
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div>
              <h4 className="text-xs uppercase font-bold tracking-wider text-slate-400 mb-3">
                2. Select Settlement Method
              </h4>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-2xl border text-xs font-semibold flex flex-col items-center gap-2 transition-all ${
                    paymentMethod === 'card'
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-indigo-400" />
                  <span>Credit Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('crypto')}
                  className={`p-3 rounded-2xl border text-xs font-semibold flex flex-col items-center gap-2 transition-all ${
                    paymentMethod === 'crypto'
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Coins className="w-5 h-5 text-cyan-400" />
                  <span>USDC / Crypto</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('credit')}
                  className={`p-3 rounded-2xl border text-xs font-semibold flex flex-col items-center gap-2 transition-all ${
                    paymentMethod === 'credit'
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Building className="w-5 h-5 text-amber-400" />
                  <span>Store Line</span>
                </button>
              </div>

              {/* Card Inputs */}
              {paymentMethod === 'card' && (
                <div className="grid grid-cols-3 gap-3 text-xs bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
                  <div className="col-span-3">
                    <label className="block text-slate-400 mb-1">Card Number</label>
                    <input
                      type="text"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Expires</label>
                    <input
                      type="text"
                      name="cardExp"
                      value={formData.cardExp}
                      onChange={handleInputChange}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">CVC / CVV</label>
                    <input
                      type="text"
                      name="cardCvc"
                      value={formData.cardCvc}
                      onChange={handleInputChange}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Billing ZIP</label>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {paymentMethod === 'crypto' && (
                <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 space-y-1">
                  <p className="font-semibold text-cyan-300">Instant Web3 Settlement Enabled</p>
                  <p className="text-slate-400">Order will be settled via smart contract on Solana / Ethereum mainnet with zero gas markup.</p>
                </div>
              )}

              {paymentMethod === 'credit' && (
                <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 space-y-1">
                  <p className="font-semibold text-amber-300">Net-30 Corporate Terms Approved</p>
                  <p className="text-slate-400">Invoice will be emailed automatically to your enterprise billing address.</p>
                </div>
              )}
            </div>

            {/* Total & Submit */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block">Total Amount to Authorize:</span>
                <span className="text-2xl font-mono font-bold text-white">${total.toFixed(2)}</span>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Authorize & Pay</span>
                </button>
              </div>
            </div>
          </form>
        ) : (
          /* Confirmation Success Screen */
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Payment Authorized Successfully
              </span>
              <h2 className="text-2xl font-extrabold text-white mt-1">Thank you for your order!</h2>
              <p className="text-xs text-slate-400 mt-2 max-w-md mx-auto">
                Your hardware and compute allocations have been reserved. Confirmation receipt dispatched to {formData.email}.
              </p>
            </div>

            {/* Order Receipt Box */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-left max-w-md mx-auto space-y-2">
              <div className="flex justify-between pb-2 border-b border-slate-800">
                <span className="text-slate-500">Order ID:</span>
                <span className="text-indigo-400 font-bold">{confirmedOrder?.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date:</span>
                <span className="text-slate-300">{confirmedOrder?.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment:</span>
                <span className="text-slate-300">{confirmedOrder?.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Recipient:</span>
                <span className="text-slate-300">{confirmedOrder?.shippingAddress.fullName}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-800 font-bold text-sm">
                <span className="text-white">Total Settled:</span>
                <span className="text-emerald-400">${confirmedOrder?.total.toFixed(2)}</span>
              </div>
            </div>

            <div>
              <button
                onClick={() => {
                  setStep('details');
                  onClose();
                }}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/30 inline-flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Storefront</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

