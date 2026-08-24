import React from 'react';

export default function ErrorState({ title = 'Đã xảy ra lỗi', message = 'Không thể tải dữ liệu. Vui lòng thử lại!', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 bg-white rounded-2xl border border-red-200 text-center shadow-sm space-y-3">
      <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-red-600">
        <span className="material-symbols-outlined text-4xl">error</span>
      </div>
      <h3 className="text-lg font-bold text-slate-900">{title}</h3>
      <p className="text-xs text-slate-500 max-w-sm">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
        >
          <span className="material-symbols-outlined text-base">refresh</span>
          <span>Thử lại</span>
        </button>
      )}
    </div>
  );
}
