import React from 'react';
import { useApp } from '../../context/AppContext';

export default function ConfirmModal() {
  const { confirmModal } = useApp();

  if (!confirmModal) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-scaleUp">
        <div className="flex items-center gap-3 text-amber-600">
          <span className="material-symbols-outlined text-3xl">warning</span>
          <h3 className="text-lg font-bold text-slate-900">Xác nhận thao tác</h3>
        </div>
        <p className="text-slate-600 text-sm">{confirmModal.message}</p>
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={confirmModal.onCancel}
            className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 text-sm font-semibold transition-colors"
          >
            Hủy bỏ
          </button>
          <button
            onClick={confirmModal.onConfirm}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors shadow-md"
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
}
