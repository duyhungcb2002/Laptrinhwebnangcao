import React from 'react';
import { Link } from 'react-router-dom';

export default function AccessDeniedPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-4 font-['Be_Vietnam_Pro']">
      <div className="w-20 h-20 rounded-full bg-red-50 text-red-600 flex items-center justify-center shadow-inner">
        <span className="material-symbols-outlined text-5xl">gpp_bad</span>
      </div>
      <h1 className="text-5xl font-black text-slate-900">403</h1>
      <h2 className="text-xl font-bold text-slate-800">Truy Cập Bị Từ Chối</h2>
      <p className="text-xs text-slate-500 max-w-md leading-relaxed">
        Bạn không có quyền truy cập vào trang quản trị hệ thống Admin này. Vui lòng đăng nhập tài khoản có quyền Admin để tiếp tục.
      </p>
      <div className="flex gap-3 pt-2">
        <Link
          to="/"
          className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all"
        >
          Quay lại trang chủ
        </Link>
        <Link
          to="/login"
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
        >
          Đăng nhập Admin
        </Link>
      </div>
    </div>
  );
}
