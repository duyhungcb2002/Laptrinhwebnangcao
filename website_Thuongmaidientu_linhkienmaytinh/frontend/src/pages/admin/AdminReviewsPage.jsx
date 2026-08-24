import React from 'react';
import { useApp } from '../../context/AppContext';

export default function AdminReviewsPage() {
  const { reviews, products, deleteReview } = useApp();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Quản Lý Đánh Giá & Nhận Xét</h2>
        <p className="text-xs text-slate-500">Kiểm duyệt ý kiến phản hồi của khách hàng về linh kiện</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
        {reviews.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">Chưa có đánh giá nào trên hệ thống.</div>
        ) : (
          reviews.map((r) => {
            const product = products.find(p => p.id === r.productId);
            return (
              <div key={r.id} className="p-5 hover:bg-slate-50 flex items-start justify-between gap-4 text-xs">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-900">{r.userName}</span>
                    <span className="text-slate-400">{r.date}</span>
                    <div className="flex text-amber-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className="material-symbols-outlined text-xs">
                          {i < r.rating ? 'star' : 'star_outline'}
                        </span>
                      ))}
                    </div>
                  </div>

                  <p className="font-semibold text-blue-700">
                    Sản phẩm: {product ? product.name : `ID: ${r.productId}`}
                  </p>

                  <p className="text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">{r.comment}</p>
                </div>

                <button
                  onClick={() => deleteReview(r.id)}
                  className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                >
                  <span className="material-symbols-outlined text-lg">delete</span>
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
