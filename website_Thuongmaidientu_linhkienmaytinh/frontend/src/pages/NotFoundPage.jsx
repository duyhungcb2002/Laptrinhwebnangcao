import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
      <div className="w-24 h-24 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
        <span className="material-symbols-outlined text-6xl">sentiment_dissatisfied</span>
      </div>
      <h1 className="text-6xl font-black text-slate-900">404</h1>
      <h2 className="text-xl font-bold text-slate-800">Trang Bạn Tìm Kiếm Không Tồn Tại</h2>
      <p className="text-xs text-slate-500 max-w-md">
        Đường dẫn có thể đã bị thay đổi hoặc không còn tồn tại trên trang bán hàng TechHub PC.
      </p>
      <Link
        to="/"
        className="mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
      >
        <span className="material-symbols-outlined text-base">home</span>
        <span>Quay về trang chủ</span>
      </Link>
    </div>
  );
}
