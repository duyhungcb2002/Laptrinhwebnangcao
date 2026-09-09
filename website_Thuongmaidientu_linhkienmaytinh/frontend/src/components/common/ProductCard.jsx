import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

export const getProductImageUrl = (url) => {
  if (!url) return 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=500&auto=format&fit=crop&q=80';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5103/api';
  const origin = baseUrl.replace(/\/api\/?$/, '');
  return `${origin}${url.startsWith('/') ? '' : '/'}${url}`;
};

export default function ProductCard({ product }) {
  const { addToCart } = useApp();

  const stock = product.stockQuantity ?? product.stock ?? 0;
  const isOutOfStock = stock <= 0;
  const imageUrl = getProductImageUrl(product.imageUrl || product.img);
  const categoryName = product.categoryName || product.category || 'Linh kiện';

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=500&auto=format&fit=crop&q=80';
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col hover:shadow-lg transition-all duration-300 group">
      {/* Image container */}
      <Link to={`/products/${product.id}`} className="h-44 sm:h-48 w-full mb-3 flex items-center justify-center overflow-hidden rounded-lg bg-slate-50 relative">
        <img
          src={imageUrl}
          alt={product.name}
          onError={handleImageError}
          className="h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
        />
        {product.oldPrice && product.oldPrice > product.price && (
          <span className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
            -{Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}%
          </span>
        )}
      </Link>

      {/* Category & Stock */}
      <div className="flex justify-between items-center mb-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded truncate max-w-[120px]">
          {categoryName}
        </span>
        <span className={`text-[10px] font-semibold ${isOutOfStock ? 'text-red-600' : 'text-emerald-600'}`}>
          {isOutOfStock ? 'Hết hàng' : `Còn ${stock} sp`}
        </span>
      </div>

      {/* Product Title */}
      <Link to={`/products/${product.id}`} className="font-bold text-sm text-slate-900 line-clamp-2 hover:text-blue-700 transition-colors mb-2 flex-1">
        {product.name}
      </Link>

      {/* Rating */}
      <div className="flex items-center gap-1 text-xs text-amber-500 mb-2">
        <span className="material-symbols-outlined text-sm text-amber-500 fill-1">star</span>
        <span className="font-bold text-slate-700">{product.rating || 5.0}</span>
        <span className="text-slate-400 text-[11px]">({product.reviewCount || 0})</span>
      </div>

      {/* Price */}
      <div className="mb-3">
        <div className="text-red-600 font-extrabold text-lg">
          {product.price?.toLocaleString('vi-VN')}₫
        </div>
        {product.oldPrice && product.oldPrice > product.price && (
          <div className="text-slate-400 text-xs line-through">
            {product.oldPrice.toLocaleString('vi-VN')}₫
          </div>
        )}
      </div>

      {/* Add to Cart Button */}
      <button
        onClick={() => addToCart(product)}
        disabled={isOutOfStock}
        className={`w-full font-semibold py-2 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors ${
          isOutOfStock
            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md'
        }`}
      >
        <span className="material-symbols-outlined text-lg">add_shopping_cart</span>
        <span>{isOutOfStock ? 'Hết hàng' : 'Thêm giỏ hàng'}</span>
      </button>
    </div>
  );
}
