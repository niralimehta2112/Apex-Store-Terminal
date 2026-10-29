import React, { useState } from 'react';
import { Product } from '../../types';
import { X, Star, ShoppingBag, Heart, Shield, Truck, RefreshCw, CheckCircle2 } from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  isWishlisted: boolean;
  onToggleWishlist: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  isWishlisted,
  onToggleWishlist,
}) => {
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'specs' | 'features'>('specs');

  if (!product) return null;

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative z-10 w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header with Close */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800/80 bg-slate-950/40">
          <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
            {product.category} Series
          </span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Image Column */}
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover object-center"
              />
              {product.badge && (
                <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold bg-indigo-600 text-white shadow-lg">
                  {product.badge}
                </span>
              )}
              {discount > 0 && (
                <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-600 text-white shadow-lg">
                  Save {discount}%
                </span>
              )}
            </div>

            {/* Info Column */}
            <div className="flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.rating) ? 'fill-current' : 'opacity-40'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-semibold text-slate-300">{product.rating}</span>
                  <span className="text-xs text-slate-500">({product.reviewsCount} verified reviews)</span>
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {product.name}
                </h2>

                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold font-mono text-white">
                    ${product.price.toFixed(2)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm font-mono text-slate-500 line-through">
                      ${product.originalPrice.toFixed(2)}
                    </span>
                  )}
                </div>

                <p className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {product.longDescription || product.description}
                </p>

                {/* Tags */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {product.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] px-2.5 py-0.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 font-mono"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Purchase Bar */}
              <div className="mt-6 pt-4 border-t border-slate-800/80">
                <div className="flex items-center gap-3">
                  {/* Quantity Stepper */}
                  <div className="flex items-center bg-slate-950 rounded-xl border border-slate-800 p-1">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors font-mono font-bold"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-mono text-sm font-bold text-white">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors font-mono font-bold"
                    >
                      +
                    </button>
                  </div>

                  {/* Add to Cart */}
                  <button
                    onClick={() => {
                      onAddToCart(product, quantity);
                      onClose();
                    }}
                    className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Cart • ${(product.price * quantity).toFixed(2)}</span>
                  </button>

                  {/* Wishlist Button */}
                  <button
                    onClick={() => onToggleWishlist(product)}
                    className={`p-3 rounded-xl border transition-colors ${
                      isWishlisted
                        ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                        : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Value Props */}
          <div className="grid grid-cols-3 gap-3 p-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-center">
            <div className="flex flex-col items-center gap-1 text-[11px] text-slate-300">
              <Truck className="w-4 h-4 text-indigo-400" />
              <span>Complimentary Express Shipping</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-[11px] text-slate-300">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Full Hardware Warranty Included</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-[11px] text-slate-300">
              <RefreshCw className="w-4 h-4 text-amber-400" />
              <span>30-Day Risk-Free Returns</span>
            </div>
          </div>

          {/* Tabs: Specifications & Key Features */}
          <div>
            <div className="flex gap-2 border-b border-slate-800 pb-2">
              <button
                onClick={() => setActiveTab('specs')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeTab === 'specs'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Technical Specifications
              </button>
              <button
                onClick={() => setActiveTab('features')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeTab === 'features'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Key Architectural Highlights
              </button>
            </div>

            <div className="mt-4">
              {activeTab === 'specs' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {Object.entries(product.specs).map(([label, val]) => (
                    <div
                      key={label}
                      className="flex justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80"
                    >
                      <span className="text-slate-400">{label}:</span>
                      <span className="font-semibold text-slate-200 text-right">{val}</span>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'features' && (
                <div className="space-y-2 text-xs">
                  {product.features.map((feature, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-slate-200"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

