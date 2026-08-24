import React from 'react';

export default function LoadingSpinner({ text = 'Đang tải dữ liệu...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-3">
      <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      <p className="text-sm font-medium text-slate-500">{text}</p>
    </div>
  );
}
