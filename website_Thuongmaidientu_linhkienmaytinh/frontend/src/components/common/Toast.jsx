import React from 'react';
import { useApp } from '../../context/AppContext';

export default function Toast() {
  const { toast, setToast } = useApp();

  if (!toast) return null;

  const bgStyles = {
    success: 'bg-emerald-600 text-white',
    error: 'bg-red-600 text-white',
    info: 'bg-blue-600 text-white'
  };

  const icons = {
    success: 'check_circle',
    error: 'error',
    info: 'info'
  };

  return (
    <div className="fixed bottom-5 right-5 z-[100] transition-all transform animate-bounce">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl ${bgStyles[toast.type] || bgStyles.success}`}>
        <span className="material-symbols-outlined">{icons[toast.type] || 'check_circle'}</span>
        <span className="text-sm font-semibold">{toast.message}</span>
        <button onClick={() => setToast(null)} className="ml-2 hover:opacity-80">
          <span className="material-symbols-outlined text-sm">close</span>
        </button>
      </div>
    </div>
  );
}
