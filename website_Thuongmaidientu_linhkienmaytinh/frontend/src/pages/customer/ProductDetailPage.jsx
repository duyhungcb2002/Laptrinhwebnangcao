import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { catalogApi } from '../../api/catalogApi';
import { reviewsApi } from '../../api/reviewsApi';
import ProductCard, { getProductImageUrl } from '../../components/common/ProductCard';
import EmptyState from '../../components/common/EmptyState';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { products, addToCart, showToast } = useApp();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState('');

  // Reviews state
  const [reviewsData, setReviewsData] = useState({
    items: [],
    totalReviews: 0,
    averageRating: 0
  });
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [eligibleItems, setEligibleItems] = useState([]);
  const [selectedOrderItemId, setSelectedOrderItemId] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchReviews = async (productId) => {
    setReviewsLoading(true);
    try {
      const data = await reviewsApi.getProductReviews(productId, { page: 1, pageSize: 50 });
      setReviewsData(data);
    } catch (err) {
      console.error('Lỗi tải đánh giá sản phẩm:', err);
    } finally {
      setReviewsLoading(false);
    }
  };

  const fetchEligibility = async (productId) => {
    if (!isAuthenticated) {
      setEligibleItems([]);
      setSelectedOrderItemId('');
      return;
    }
    try {
      const items = await reviewsApi.getEligibleOrderItems(productId);
      setEligibleItems(items || []);
      if (items && items.length > 0) {
        setSelectedOrderItemId(items[0].orderItemId);
      } else {
        setSelectedOrderItemId('');
      }
    } catch (err) {
      console.error('Lỗi kiểm tra quyền đánh giá:', err);
      setEligibleItems([]);
      setSelectedOrderItemId('');
    }
  };

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    setEligibleItems([]);
    setSelectedOrderItemId('');

    catalogApi
      .getPublicProductById(id)
      .then((data) => {
        if (isMounted) {
          setProduct(data);
          setActiveImage(data.imageUrl);
          setLoading(false);
          fetchReviews(data.id);
          fetchEligibility(data.id);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('Lỗi tải chi tiết sản phẩm:', err);
          const detail = err?.response?.data?.detail || 'Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã bị ẩn.';
          setError(detail);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [id, isAuthenticated]);

  if (loading) {
    return (
      <div className="bg-white p-12 text-center rounded-3xl border border-slate-200">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-slate-500 text-sm font-medium">Đang tải chi tiết sản phẩm...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <EmptyState
        icon="error"
        title="Không tìm thấy sản phẩm"
        message={error || 'Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã bị ẩn.'}
        actionText="Quay lại danh sách sản phẩm"
        actionLink="/products"
      />
    );
  }

  const stock = product.stockQuantity ?? 0;
  const mainImage = getProductImageUrl(activeImage || product.imageUrl);
  const relatedProducts = products
    .filter((p) => (p.categoryId === product.categoryId || p.categoryCode === product.categoryCode) && p.id !== product.id)
    .slice(0, 3);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOrderItemId) {
      showToast('Vui lòng chọn đơn hàng phù hợp để đánh giá!', 'warning');
      return;
    }
    if (!reviewComment.trim()) {
      showToast('Vui lòng nhập nhận xét sản phẩm!', 'warning');
      return;
    }

    setSubmittingReview(true);
    try {
      await reviewsApi.createReview({
        orderItemId: selectedOrderItemId,
        rating: Number(reviewRating),
        comment: reviewComment.trim()
      });
      showToast('Cảm ơn bạn đã gửi đánh giá sản phẩm!', 'success');
      setReviewComment('');
      // Refresh list & eligibility
      await fetchReviews(product.id);
      await fetchEligibility(product.id);
    } catch (err) {
      console.error('Lỗi khi tạo đánh giá:', err);
      const msg = err?.response?.data?.detail || err?.response?.data?.title || 'Không thể gửi đánh giá.';
      showToast(msg, 'error');
    } finally {
      setSubmittingReview(false);
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
        {/* Product Image & Gallery */}
        <div className="space-y-4">
          <div className="bg-slate-50 rounded-2xl p-6 flex items-center justify-center border border-slate-100 min-h-[300px]">
            <img src={mainImage} alt={product.name} className="max-h-80 object-contain hover:scale-105 transition-transform" />
          </div>

          {/* Thumbnail Gallery */}
          {product.productImages && product.productImages.length > 0 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              <button
                onClick={() => setActiveImage(product.imageUrl)}
                className={`w-16 h-16 rounded-xl border p-1 flex-shrink-0 bg-slate-50 overflow-hidden ${
                  activeImage === product.imageUrl ? 'border-blue-600 ring-2 ring-blue-100' : 'border-slate-200'
                }`}
              >
                <img src={getProductImageUrl(product.imageUrl)} alt="Primary" className="w-full h-full object-contain" />
              </button>
              {product.productImages.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(img.url)}
                  className={`w-16 h-16 rounded-xl border p-1 flex-shrink-0 bg-slate-50 overflow-hidden ${
                    activeImage === img.url ? 'border-blue-600 ring-2 ring-blue-100' : 'border-slate-200'
                  }`}
                >
                  <img src={getProductImageUrl(img.url)} alt={img.altText || 'Thumbnail'} className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Meta */}
        <div className="space-y-5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded">
              {product.categoryName || product.categoryCode || 'Linh kiện'}
            </span>
            <span className="text-xs font-mono text-slate-400">SKU: {product.code}</span>
          </div>

          <h1 className="text-2xl font-extrabold text-slate-900 leading-snug">{product.name}</h1>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1 text-amber-500">
              <span className="material-symbols-outlined text-sm">star</span>
              <span className="font-bold">{reviewsData.averageRating?.toFixed(1) || '0.0'}</span>
              <span className="text-slate-400">({reviewsData.totalReviews} đánh giá)</span>
            </div>
            <span className="text-slate-300">|</span>
            <span className={stock > 0 ? 'text-emerald-600 font-bold' : 'text-red-600 font-bold'}>
              {stock > 0 ? `Còn hàng (${stock} sản phẩm)` : 'Hết hàng'}
            </span>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl space-y-1">
            <div className="text-3xl font-black text-red-600">
              {product.price?.toLocaleString('vi-VN')}₫
            </div>
            {product.oldPrice && product.oldPrice > product.price && (
              <div className="text-xs text-slate-400 line-through">
                {product.oldPrice.toLocaleString('vi-VN')}₫
              </div>
            )}
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">{product.description || 'Chưa có mô tả chi tiết cho sản phẩm này.'}</p>

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
              disabled={stock <= 0}
              className={`flex-1 font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all ${
                stock <= 0
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-blue-500/25'
              }`}
            >
              <span className="material-symbols-outlined">add_shopping_cart</span>
              <span>{stock <= 0 ? 'Hết hàng' : 'Thêm vào giỏ hàng'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-500">rate_review</span>
            <span>Đánh Giá Từ Khách Hàng ({reviewsData.totalReviews})</span>
          </h3>

          <div className="space-y-4">
            {reviewsLoading ? (
              <p className="text-xs text-slate-500 py-4 text-center">Đang tải danh sách đánh giá...</p>
            ) : reviewsData.items.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-4">Chưa có đánh giá nào cho sản phẩm này. Hãy là người đầu tiên!</p>
            ) : (
              reviewsData.items.map((rev) => (
                <div key={rev.reviewId} className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-900">{rev.userDisplayName}</span>
                    <span className="text-slate-400">{new Date(rev.createdAtUtc).toLocaleDateString('vi-VN')}</span>
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

          {/* Form đánh giá */}
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <h4 className="text-xs font-bold uppercase text-slate-500">Gửi đánh giá của bạn</h4>

            {!isAuthenticated ? (
              <div className="bg-slate-50 p-4 rounded-xl text-xs text-slate-600 flex items-center justify-between">
                <span>Bạn cần đăng nhập và hoàn thành mua sản phẩm này để gửi đánh giá.</span>
                <Link to="/login" className="text-blue-600 font-bold hover:underline">
                  Đăng nhập ngay
                </Link>
              </div>
            ) : eligibleItems.length === 0 ? (
              <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl text-xs text-amber-800">
                Bạn chưa có đơn hàng đã hoàn thành (Completed) nào chứa sản phẩm này hoặc bạn đã gửi đánh giá cho tất cả các đơn hàng trước đó.
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                {eligibleItems.length > 1 && (
                  <div className="flex flex-col gap-1 text-xs">
                    <label className="font-bold text-slate-700">Chọn đơn hàng đánh giá:</label>
                    <select
                      value={selectedOrderItemId}
                      onChange={(e) => setSelectedOrderItemId(e.target.value)}
                      className="p-2 border border-slate-300 rounded-xl bg-white text-slate-800 outline-none"
                    >
                      {eligibleItems.map((item) => (
                        <option key={item.orderItemId} value={item.orderItemId}>
                          Đơn hàng #{item.orderNumber} ({item.completedAtOrOrderDate ? new Date(item.completedAtOrOrderDate).toLocaleDateString('vi-VN') : 'Đã hoàn thành'})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

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
                  disabled={submittingReview}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-sm"
                >
                  {submittingReview ? 'Đang gửi...' : 'Gửi Đánh Giá'}
                </button>
              </form>
            )}
          </div>
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
