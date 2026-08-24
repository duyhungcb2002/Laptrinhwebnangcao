import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import ProductCard from '../../components/common/ProductCard';
import EmptyState from '../../components/common/EmptyState';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { products, reviews, addToCart, addReview } = useApp();

  const product = products.find((p) => p.id === id);
  const [qty, setQty] = useState(1);

  // Review Form
  const [reviewComment, setReviewComment] = useState('');
  const [reviewRating, setReviewRating] = useState(5);

  if (!product) {
    return (
      <EmptyState
        icon="error"
        title="Không tìm thấy sản phẩm"
        message="Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã bị xóa."
        actionText="Quay lại danh sách sản phẩm"
        actionLink="/products"
      />
    );
  }

  const productReviews = reviews.filter((r) => r.productId === product.id);
  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 3);

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (reviewComment.trim()) {
      addReview(product.id, reviewComment, reviewRating);
      setReviewComment('');
    }
  };

  return (
    <div className="space-y-10">
      {/* Breadcrumb */}
      <div className="text-xs text-slate-500 flex items-center gap-2">
        <Link to="/" className="hover:text-blue-600">Trang chủ</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-blue-600">Sản phẩm</Link>
        <span>/</span>
        <span className="text-slate-800 font-bold truncate">{product.name}</span>
      </div>

      {/* Main Detail Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="bg-slate-50 rounded-2xl p-6 flex items-center justify-center border border-slate-100">
          <img src={product.img} alt={product.name} className="max-h-80 object-contain hover:scale-105 transition-transform" />
        </div>

        {/* Product Meta */}
        <div className="space-y-5">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded">
            {product.category}
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 leading-snug">{product.name}</h1>

          <div className="flex items-center gap-4 text-xs">
            <span className="font-mono text-slate-500 font-bold">Mã SP: {product.code}</span>
            <span className="text-slate-300">|</span>
            <div className="flex items-center gap-1 text-amber-500">
              <span className="material-symbols-outlined text-sm">star</span>
              <span className="font-bold">{product.rating || 5.0}</span>
              <span className="text-slate-400">({productReviews.length} đánh giá)</span>
            </div>
            <span className="text-slate-300">|</span>
            <span className={product.stock > 0 ? 'text-emerald-600 font-bold' : 'text-red-600 font-bold'}>
              {product.stock > 0 ? `Còn hàng (${product.stock} cái)` : 'Hết hàng'}
            </span>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl space-y-1">
            <div className="text-3xl font-black text-red-600">
              {product.price.toLocaleString('vi-VN')}₫
            </div>
            {product.oldPrice && (
              <div className="text-xs text-slate-400 line-through">
                {product.oldPrice.toLocaleString('vi-VN')}₫
              </div>
            )}
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">{product.description}</p>

          {/* Add to Cart Control */}
          <div className="flex items-center gap-4 pt-2">
            <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-white">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="px-3 py-2 text-slate-600 hover:bg-slate-100 font-bold"
              >
                -
              </button>
              <span className="px-4 text-sm font-bold">{qty}</span>
              <button
                onClick={() => setQty(qty + 1)}
                className="px-3 py-2 text-slate-600 hover:bg-slate-100 font-bold"
              >
                +
              </button>
            </div>

            <button
              onClick={() => addToCart(product, qty)}
              disabled={product.stock <= 0}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-blue-500/25"
            >
              <span className="material-symbols-outlined">add_shopping_cart</span>
              <span>Thêm vào giỏ hàng</span>
            </button>
          </div>
        </div>
      </div>

      {/* Specifications & Reviews Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Specs Table */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600">tune</span>
            <span>Thông Số Kỹ Thuật</span>
          </h3>
          {product.specs ? (
            <div className="divide-y divide-slate-100 text-xs">
              {Object.entries(product.specs).map(([key, val]) => (
                <div key={key} className="py-2.5 flex justify-between gap-4">
                  <span className="font-semibold text-slate-500 w-1/3">{key}</span>
                  <span className="font-bold text-slate-800 w-2/3 text-right">{val}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400">Đang cập nhật thông số...</p>
          )}
        </div>

        {/* Customer Reviews Section */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-500">rate_review</span>
            <span>Đánh Giá Từ Khách Hàng ({productReviews.length})</span>
          </h3>

          {/* Reviews List */}
          <div className="space-y-4">
            {productReviews.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-4">Chưa có đánh giá nào cho sản phẩm này. Hãy là người đầu tiên!</p>
            ) : (
              productReviews.map((rev) => (
                <div key={rev.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-900">{rev.userName}</span>
                    <span className="text-slate-400">{rev.date}</span>
                  </div>
                  <div className="flex text-amber-500 text-sm">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className="material-symbols-outlined text-sm">
                        {i < rev.rating ? 'star' : 'star_outline'}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-slate-700">{rev.comment}</p>
                </div>
              ))
            )}
          </div>

          {/* Add Review Form */}
          <form onSubmit={handleReviewSubmit} className="pt-4 border-t border-slate-200 space-y-3">
            <h4 className="text-xs font-bold uppercase text-slate-500">Gửi đánh giá của bạn</h4>
            <div className="flex items-center gap-2 text-xs">
              <span>Đánh giá:</span>
              <select
                value={reviewRating}
                onChange={(e) => setReviewRating(e.target.value)}
                className="p-1 border border-slate-300 rounded font-bold"
              >
                <option value="5">5 ⭐⭐⭐⭐⭐ Rất tốt</option>
                <option value="4">4 ⭐⭐⭐⭐ Tốt</option>
                <option value="3">3 ⭐⭐⭐ Bình thường</option>
                <option value="2">2 ⭐⭐ Tạm được</option>
                <option value="1">1 ⭐ Kém</option>
              </select>
            </div>
            <textarea
              rows="3"
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Nhận xét chi tiết về sản phẩm..."
              className="w-full p-3 border border-slate-300 rounded-xl text-xs outline-none focus:border-blue-600"
              required
            ></textarea>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-sm"
            >
              Gửi Đánh Giá
            </button>
          </form>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-slate-200">
          <h3 className="text-xl font-bold text-slate-900">Sản Phẩm Cùng Danh Mục</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
