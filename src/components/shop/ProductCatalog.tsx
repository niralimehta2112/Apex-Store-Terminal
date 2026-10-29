import React, { useState, useMemo } from 'react';
import { Product } from '../../types';
import { ProductCard } from './ProductCard';
import { Search, SlidersHorizontal, Sparkles } from 'lucide-react';

interface ProductCatalogProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onQuickView: (product: Product) => void;
  wishlistIds: string[];
  onToggleWishlist: (product: Product) => void;
  addedProductId: string | null;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  products,
  onAddToCart,
  onQuickView,
  wishlistIds,
  onToggleWishlist,
  addedProductId,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('featured');
  const [maxPrice, setMaxPrice] = useState<number>(4000);

  const categories = ['All', 'Hardware', 'Wearables', 'Cloud & AI', 'Accessories', 'Audio'];

  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
        const matchesSearch =
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesPrice = product.price <= maxPrice;
        return matchesCategory && matchesSearch && matchesPrice;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') return a.price - b.price;
        if (sortBy === 'price-high') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        return 0; // featured / default
      });
  }, [products, selectedCategory, searchQuery, sortBy, maxPrice]);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Hero Storefront Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-950 border border-indigo-500/20 p-8 sm:p-12 shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next-Generation Tech Storefront & Live Intelligence</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            High-Performance Hardware & Decentralized Compute
          </h1>
          <p className="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed">
            Equip your setup with flagship neural workstations, titanium wearables, and high-throughput GPU clusters. Powered by real-time quantitative analytics.
          </p>

          <div className="mt-6 flex flex-wrap gap-4 text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Global Express Delivery
            </span>
            <span className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
              <span className="w-2 h-2 rounded-full bg-indigo-400"></span> Enterprise SLA Support
            </span>
            <span className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span> 30-Day Money Back
            </span>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-md space-y-4">
        {/* Categories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-950/60 text-slate-400 hover:text-white hover:bg-slate-800/80 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search, Sort, Price Filter Row */}
        <div className="flex flex-col md:flex-row items-center gap-3 pt-2 border-t border-slate-800/80">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search products by keyword, category, or spec..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            {/* Price Max Slider */}
            <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
              <span className="text-slate-400 whitespace-nowrap">Max:</span>
              <span className="font-mono text-indigo-400 font-bold">${maxPrice}</span>
              <input
                type="range"
                min="300"
                max="4000"
                step="100"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-20 sm:w-24 accent-indigo-500 cursor-pointer"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-xs">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-slate-300 text-xs focus:outline-none cursor-pointer"
              >
                <option value="featured" className="bg-slate-900 text-white">Featured</option>
                <option value="price-low" className="bg-slate-900 text-white">Price: Low to High</option>
                <option value="price-high" className="bg-slate-900 text-white">Price: High to Low</option>
                <option value="rating" className="bg-slate-900 text-white">Highest Rated</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>
          Showing <strong className="text-white">{filteredProducts.length}</strong> of {products.length} products
        </span>
        {searchQuery && (
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setMaxPrice(4000);
            }}
            className="text-indigo-400 hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Product Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
              onQuickView={onQuickView}
              isWishlisted={wishlistIds.includes(product.id)}
              onToggleWishlist={onToggleWishlist}
              isAdded={addedProductId === product.id}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-slate-900/50 rounded-2xl border border-slate-800 p-8">
          <p className="text-base text-slate-300 font-semibold">No products found matching your criteria</p>
          <p className="text-xs text-slate-500 mt-1">Try adjusting your search terms or price filter.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setMaxPrice(4000);
            }}
            className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};

