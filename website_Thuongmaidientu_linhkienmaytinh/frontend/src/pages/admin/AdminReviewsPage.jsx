import React, { useState, useEffect, useCallback } from 'react';
import { reviewsApi } from '../../api/reviewsApi';
import { useApp } from '../../context/AppContext';

export default function AdminReviewsPage() {
  const { showToast } = useApp();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);

  // Filters
  const [search, setSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState('');

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, pageSize: 20 };
      if (search) params.search = search;
      if (ratingFilter) params.rating = Number(ratingFilter);
      if (visibilityFilter !== '') params.isVisible = visibilityFilter === 'true';

      const data = await reviewsApi.getAdminReviews(params);
      setReviews(data.items || []);
      setTotalCount(data.totalItems || 0);
    } catch (err) {
      console.error('Lỗi tải danh sách đánh giá admin:', err);
      showToast('Lỗi khi tải danh sách đánh giá', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, search, ratingFilter, visibilityFilter, showToast]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleToggleVisibility = async (review) => {
    const newStatus = !review.isVisible;
    try {
      await reviewsApi.updateReviewVisibility(review.reviewId, newStatus);
      showToast(`Đã ${newStatus ? 'hiển thị' : 'ẩn'} đánh giá thành công!`, 'success');
      fetchReviews();
    } catch (err) {
      console.error('Lỗi cập nhật trạng thái hiển thị đánh giá:', err);
      showToast('Không thể thay đổi trạng thái hiển thị', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Quản Lý Đánh Giá & Nhận Xét</h2>
          <p className="text-xs text-slate-500">Kiểm duyệt ý kiến phản hồi của khách hàng về linh kiện TechHub</p>
        </div>
      </div>

      {/* Filters bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-sm">search</span>
          <input
            type="text"
            placeholder="Tìm theo sản phẩm hoặc người đánh giá..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-xl text-xs outline-none focus:border-blue-600"
          />
        </div>

        <select
          value={ratingFilter}
          onChange={(e) => { setRatingFilter(e.target.value); setPage(1); }}
          className="p-2 border border-slate-300 rounded-xl text-xs bg-white text-slate-700 font-medium"
        >
          <option value="">Tất cả rating</option>
          <option value="5">5 sao ⭐⭐⭐⭐⭐</option>
          <option value="4">4 sao ⭐⭐⭐⭐</option>
          <option value="3">3 sao ⭐⭐⭐</option>
          <option value="2">2 sao ⭐⭐</option>
          <option value="1">1 sao ⭐</option>
        </select>

        <select
          value={visibilityFilter}
          onChange={(e) => { setVisibilityFilter(e.target.value); setPage(1); }}
          className="p-2 border border-slate-300 rounded-xl text-xs bg-white text-slate-700 font-medium"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="true">Đang hiển thị</option>
          <option value="false">Đã bị ẩn</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
        {loading ? (
          <div className="p-8 text-center text-slate-500 text-xs font-medium">Đang tải danh sách đánh giá...</div>
        ) : reviews.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">Chưa có đánh giá nào phù hợp với bộ lọc.</div>
        ) : (
          reviews.map((r) => (
            <div key={r.reviewId} className={`p-5 hover:bg-slate-50 flex items-start justify-between gap-4 text-xs ${!r.isVisible ? 'bg-slate-50/50' : ''}`}>
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-900">{r.reviewerDisplayName}</span>
                  <span className="text-slate-400">{new Date(r.createdAtUtc).toLocaleDateString('vi-VN')}</span>
                  <div className="flex text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className="material-symbols-outlined text-xs">
                        {i < r.rating ? 'star' : 'star_outline'}
                      </span>
                    ))}
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${r.isVisible ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                    {r.isVisible ? 'Hiển thị' : 'Đã ẩn'}
                  </span>
                </div>

                <p className="font-semibold text-blue-700">
                  Sản phẩm: {r.productName} <span className="font-mono text-slate-400 text-[11px]">(SKU: {r.productCode})</span>
                </p>

                <p className="text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">{r.comment}</p>
              </div>

              <button
                onClick={() => handleToggleVisibility(r)}
                className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 transition-colors ${
                  r.isVisible
                    ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                <span className="material-symbols-outlined text-sm">
                  {r.isVisible ? 'visibility_off' : 'visibility'}
                </span>
                <span>{r.isVisible ? 'Ẩn đánh giá' : 'Hiện đánh giá'}</span>
              </button>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalCount > 20 && (
        <div className="flex justify-between items-center text-xs text-slate-500 pt-2">
          <span>Tổng số đánh giá: {totalCount}</span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 disabled:opacity-50 font-bold hover:bg-slate-50"
            >
              Trang trước
            </button>
            <span className="px-3 py-1.5 font-bold text-slate-700">Trang {page}</span>
            <button
              disabled={page * 20 >= totalCount}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 disabled:opacity-50 font-bold hover:bg-slate-50"
            >
              Trang sau
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
