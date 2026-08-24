import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export default function AdminOrdersPage() {
  const { orders, updateOrderStatus } = useApp();
  const [filterStatus, setFilterStatus] = useState('All');

  const filteredOrders = filterStatus === 'All'
    ? orders
    : orders.filter(o => o.status === filterStatus);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Quản Lý Đơn Hàng</h2>
          <p className="text-xs text-slate-500">Xử lý và cập nhật tiến độ giao hàng cho khách hàng</p>
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="p-2 border border-slate-300 rounded-xl text-xs bg-white font-bold outline-none"
        >
          <option value="All">Tất cả trạng thái</option>
          <option value="Processing">Processing (Đang xử lý)</option>
          <option value="Shipped">Shipped (Đang giao)</option>
          <option value="Delivered">Delivered (Đã hoàn tất)</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100 uppercase text-slate-600 font-semibold border-b">
            <tr>
              <th className="p-4">Mã Đơn</th>
              <th className="p-4">Khách Hàng</th>
              <th className="p-4">Liên Hệ</th>
              <th className="p-4">Địa Chỉ</th>
              <th className="p-4">Tổng Tiền</th>
              <th className="p-4">Trạng Thái</th>
              <th className="p-4 text-right">Cập Nhật Trạng Thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredOrders.map((o) => (
              <tr key={o.id} className="hover:bg-slate-50">
                <td className="p-4 font-mono font-bold text-blue-700">{o.id}</td>
                <td className="p-4 font-bold text-slate-900">{o.customerName}</td>
                <td className="p-4 text-slate-600">{o.phone}<br /><span className="text-[11px] text-slate-400">{o.email}</span></td>
                <td className="p-4 text-slate-600 max-w-xs truncate">{o.address}</td>
                <td className="p-4 font-extrabold text-red-600">{o.totalAmount.toLocaleString('vi-VN')}₫</td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded font-bold text-[10px] ${
                    o.status === 'Delivered' ? 'bg-emerald-50 text-emerald-700' :
                    o.status === 'Shipped' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {o.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <select
                    value={o.status}
                    onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                    className="p-1.5 border border-slate-300 rounded-lg text-xs bg-white font-semibold outline-none"
                  >
                    <option value="Processing">Processing (Đang xử lý)</option>
                    <option value="Shipped">Shipped (Đang giao hàng)</option>
                    <option value="Delivered">Delivered (Đã hoàn tất)</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
