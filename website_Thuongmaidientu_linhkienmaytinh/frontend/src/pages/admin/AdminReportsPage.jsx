import React from 'react';
import { useApp } from '../../context/AppContext';

export default function AdminReportsPage() {
  const { products, orders, categories, showToast } = useApp();

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalItemsSold = orders.reduce((sum, o) => sum + o.items.reduce((iSum, item) => iSum + item.qty, 0), 0);

  const handleExport = () => {
    showToast('Đã xuất báo cáo doanh thu dưới dạng file Excel / CSV simulation!', 'success');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Báo Cáo & Thống Kê Doanh Thu</h2>
          <p className="text-xs text-slate-500">Phân tích kết quả kinh doanh và hiệu suất bán hàng</p>
        </div>
        <button
          onClick={handleExport}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-md"
        >
          <span className="material-symbols-outlined text-base">download</span>
          <span>Xuất Báo Cáo Excel</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <p className="text-xs font-bold text-slate-400 uppercase">Tổng Doanh Thu Đã Thu</p>
          <h3 className="text-2xl font-black text-emerald-600">{totalRevenue.toLocaleString('vi-VN')}₫</h3>
          <p className="text-[11px] text-emerald-600 font-semibold pt-1">↑ +18.5% so với tháng trước</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <p className="text-xs font-bold text-slate-400 uppercase">Tổng Số Linh Kiện Đã Bán</p>
          <h3 className="text-2xl font-black text-blue-600">{totalItemsSold} sản phẩm</h3>
          <p className="text-[11px] text-blue-600 font-semibold pt-1">Tăng trưởng ổn định</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <p className="text-xs font-bold text-slate-400 uppercase">Giá Trị Đơn Trung Bình</p>
          <h3 className="text-2xl font-black text-indigo-600">
            {orders.length ? Math.round(totalRevenue / orders.length).toLocaleString('vi-VN') : 0}₫
          </h3>
          <p className="text-[11px] text-indigo-600 font-semibold pt-1">Phân khúc cao cấp</p>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-base text-slate-900 border-b border-slate-200 pb-3">Cơ Cấu Sản Phẩm Theo Danh Mục</h3>
        <div className="space-y-4">
          {categories.map((cat) => {
            const count = products.filter(p => p.category === cat.id).length;
            const percent = Math.round((count / products.length) * 100) || 0;
            return (
              <div key={cat.id} className="space-y-1.5 text-xs">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-800">{cat.id} ({cat.label})</span>
                  <span className="text-blue-700">{count} SP ({percent}%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: `${percent}%` }}></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
