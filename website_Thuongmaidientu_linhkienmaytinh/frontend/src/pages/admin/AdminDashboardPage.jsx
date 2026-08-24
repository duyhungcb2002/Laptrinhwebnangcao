import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

export default function AdminDashboardPage() {
  const { products, orders, users, updateOrderStatus } = useApp();

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const lowStockProducts = products.filter(p => p.stock <= 10);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Dashboard Tổng Quan</h2>
        <p className="text-xs text-slate-500">Thống kê hoạt động kinh doanh linh kiện TechHub PC</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Tổng Doanh Thu</p>
            <h3 className="text-xl font-black text-emerald-600 mt-1">{totalRevenue.toLocaleString('vi-VN')}₫</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">payments</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Tổng Đơn Hàng</p>
            <h3 className="text-2xl font-black text-blue-600 mt-1">{orders.length}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">shopping_bag</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Sản Phẩm Trong Kho</p>
            <h3 className="text-2xl font-black text-indigo-600 mt-1">{products.length}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">inventory_2</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Khách Hàng</p>
            <h3 className="text-2xl font-black text-amber-600 mt-1">{users.length}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">group</span>
          </div>
        </div>
      </div>

      {/* Grid Recent Orders & Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-200 pb-3">
            <h3 className="font-bold text-base text-slate-900">Đơn Hàng Mới Nhất</h3>
            <Link to="/admin/orders" className="text-xs text-blue-600 font-bold hover:underline">Xem tất cả</Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 uppercase text-slate-500 font-semibold border-b">
                <tr>
                  <th className="p-3">Mã đơn</th>
                  <th className="p-3">Khách hàng</th>
                  <th className="p-3">Tổng tiền</th>
                  <th className="p-3">Trạng thái</th>
                  <th className="p-3 text-right">Cập nhật</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.slice(0, 5).map(o => (
                  <tr key={o.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-blue-700">{o.id}</td>
                    <td className="p-3 font-medium">{o.customerName}</td>
                    <td className="p-3 font-bold text-red-600">{o.totalAmount.toLocaleString('vi-VN')}₫</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-blue-50 text-blue-700">
                        {o.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <select
                        value={o.status}
                        onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                        className="p-1 border border-slate-300 rounded bg-white text-[11px]"
                      >
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Warning Widget */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 h-fit">
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-3">
            <span className="material-symbols-outlined text-amber-500">warning</span>
            <span>Cảnh Báo Tồn Kho Thấp</span>
          </h3>

          <div className="space-y-3">
            {lowStockProducts.length === 0 ? (
              <p className="text-xs text-slate-500 italic">Kho hàng đang đầy đủ, không có sản phẩm sắp hết.</p>
            ) : (
              lowStockProducts.map(p => (
                <div key={p.id} className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-amber-50/50 border border-amber-200">
                  <div className="line-clamp-1 flex-1 pr-2 font-semibold text-slate-800">{p.name}</div>
                  <span className="font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded text-[10px]">
                    Còn {p.stock} cái
                  </span>
                </div>
              ))
            )}
          </div>

          <Link
            to="/admin/inventory"
            className="block text-center w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
          >
            Quản lý tồn kho
          </Link>
        </div>
      </div>
    </div>
  );
}
