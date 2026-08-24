import React from 'react';
import { Link } from 'react-router-dom';

export default function EmptyState({ icon = 'inbox', title = 'Không tìm thấy dữ liệu', message = 'Hiện chưa có mục nào trong danh sách này.', actionText, actionLink }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 bg-white rounded-2xl border border-slate-200 text-center shadow-sm space-y-3">
      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
        <span className="material-symbols-outlined text-4xl">{icon}</span>
      </div>
      <h3 className="text-lg font-bold text-slate-800">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm">{message}</p>
      {actionText && actionLink && (
        <Link
          to={actionLink}
          className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
        >
          <span>{actionText}</span>
          <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </Link>
      )}
    </div>
  );
}
