import React, { useState } from 'react';
import { CartItem } from '../../types';
import { X, Trash2, ArrowRight, Tag, ShoppingBag, ShieldCheck } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onProceedToCheckout: () => void;
  discountCode: string;
  onApplyDiscount: (code: string) => boolean;
  discountPct: number;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  discountCode,
  onApplyDiscount,
  discountPct,
}) => {
  const [promoInput, setPromoInput] = useState<string>('');
  const [promoError, setPromoError] = useState<string>('');
  const [promoSuccess, setPromoSuccess] = useState<string>('');

  if (!isOpen) return null;

  const subtotal = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const discountAmount = (subtotal * discountPct) / 100;
  const freeShippingThreshold = 500;
  const isFreeShipping = subtotal >= freeShippingThreshold || items.length === 0;
  const shipping = isFreeShipping ? 0 : 25;
  const taxes = (subtotal - discountAmount) * 0.08;
  const total = Math.max(0, subtotal - discountAmount + shipping + taxes);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError('');
    setPromoSuccess('');
    if (!promoInput.trim()) return;

    const valid = onApplyDiscount(promoInput.trim().toUpperCase());
    if (valid) {
      setPromoSuccess(`Promo code applied (${discountPct || 15}% off)`);
      setPromoInput('');
    } else {
      setPromoError('Invalid code. Try "ALPHA10" or "WELCOME20"');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/40">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-indigo-400" />
              <h2 className="text-base font-bold text-white">Your Shopping Cart</h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-indigo-600/30 text-indigo-300">
                {items.reduce((acc, i) => acc + i.quantity, 0)}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress */}
          {items.length > 0 && (
            <div className="px-5 py-3 bg-slate-950/60 border-b border-slate-800 text-xs">
              <div className="flex justify-between mb-1.5">
                <span className="text-slate-400 font-medium">
                  {isFreeShipping ? '🎉 You qualify for Free Global Shipping!' : `Add $${(freeShippingThreshold - subtotal).toFixed(2)} more for Free Shipping`}
                </span>
                <span className="font-mono text-indigo-400 font-bold">
                  {Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100))}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-300"
                  style={{ width: `${Math.min(100, (subtotal / freeShippingThreshold) * 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto" />
                <p className="text-sm text-slate-300 font-semibold">Your cart is empty</p>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Explore our high-performance hardware catalog and live market items to add products.
                </p>
                <button
                  onClick={onClose}
                  className="mt-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-colors"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.product.id}
                  className="flex gap-3 p-3 rounded-2xl bg-slate-950/50 border border-slate-800/80 items-center"
                >
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-800"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-white truncate">{item.product.name}</h4>
                    <span className="text-[11px] text-slate-400 block font-mono">
                      ${item.product.price.toFixed(2)} each
                    </span>

                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center bg-slate-900 rounded-lg border border-slate-800">
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                          className="px-2 py-0.5 text-xs text-slate-400 hover:text-white"
                        >
                          -
                        </button>
                        <span className="px-2 text-xs font-mono font-bold text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                          className="px-2 py-0.5 text-xs text-slate-400 hover:text-white"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => onRemoveItem(item.product.id)}
                        className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-bold font-mono text-white block">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Summary */}
          {items.length > 0 && (
            <div className="p-5 border-t border-slate-800 bg-slate-950/60 space-y-3">
              {/* Promo code form */}
              <form onSubmit={handleApplyPromo} className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Discount code (e.g. ALPHA10)"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 uppercase focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <button
                  type="submit"
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
                >
                  Apply
                </button>
              </form>

              {promoError && <p className="text-[11px] text-rose-400">{promoError}</p>}
              {promoSuccess && <p className="text-[11px] text-emerald-400">{promoSuccess}</p>}
              {discountPct > 0 && (
                <div className="flex justify-between text-xs text-emerald-400 font-mono">
                  <span>Applied Promo ({discountCode}):</span>
                  <span>-{discountPct}% (-${discountAmount.toFixed(2)})</span>
                </div>
              )}

              {/* Subtotals */}
              <div className="space-y-1.5 text-xs text-slate-400 pt-2 border-t border-slate-800/80">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-mono text-slate-200">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span className="font-mono text-slate-200">{isFreeShipping ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Tax (8%):</span>
                  <span className="font-mono text-slate-200">${taxes.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-slate-800">
                  <span>Estimated Total:</span>
                  <span className="font-mono text-indigo-400">${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Checkout Action Button */}
              <button
                onClick={() => {
                  onClose();
                  onProceedToCheckout();
                }}
                className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
              >
                <span>Proceed to Secure Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>256-Bit SSL Encrypted Checkout</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

