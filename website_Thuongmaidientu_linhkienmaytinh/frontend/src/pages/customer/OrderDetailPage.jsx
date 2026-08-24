import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import EmptyState from '../../components/common/EmptyState';

export default function OrderDetailPage() {
  const { id } = useParams();
  const { orders } = useApp();

  const order = orders.find((o) => o.id === id);

  if (!order) {
    return (
      <EmptyState
        icon="receipt"
        title="Không tìm thấy đơn hàng"
        message={`Đơn hàng mã ${id} không tồn tại trên hệ thống.`}
        actionText="Quay lại danh sách đơn"
        actionLink="/account/orders"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-xs text-slate-500 flex items-center gap-2">
        <Link to="/account/orders" className="hover:text-blue-600">Lịch sử đơn hàng</Link>
        <span>/</span>
        <span className="text-slate-800 font-bold">{order.id}</span>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              <span>Đơn hàng {order.id}</span>
              <span className="bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-full font-semibold">
                {order.status}
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">Ngày đặt: {order.date}</p>
          </div>
          <Link
            to="/account/orders"
            className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
          >
            Quay lại
          </Link>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl text-xs">
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 uppercase text-[11px] text-slate-400">Thông tin người nhận</h4>
            <p className="font-bold text-slate-800">{order.customerName}</p>
            <p className="text-slate-600">SĐT: {order.phone}</p>
            <p className="text-slate-600">Email: {order.email}</p>
            <p className="text-slate-600">Địa chỉ: {order.address}</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 uppercase text-[11px] text-slate-400">Phương thức thanh toán</h4>
            <p className="font-bold text-slate-800">{order.paymentMethod}</p>
            {order.note && <p className="text-slate-500 italic">Ghi chú: {order.note}</p>}
          </div>
        </div>

        {/* Item List */}
        <div className="space-y-4">
          <h3 className="font-bold text-sm text-slate-900 border-b border-slate-200 pb-2">Danh Sách Sản Phẩm</h3>
          <div className="divide-y divide-slate-100 text-xs">
            {order.items.map((item, idx) => (
              <div key={idx} className="py-3 flex justify-between items-center">
                <div>
                  <p className="font-bold text-slate-900">{item.name}</p>
                  <p className="text-slate-400 text-[11px]">{item.price.toLocaleString('vi-VN')}₫ x {item.qty}</p>
                </div>
                <span className="font-extrabold text-slate-900 text-sm">{(item.price * item.qty).toLocaleString('vi-VN')}₫</span>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-slate-200 pt-4 flex justify-between items-center text-sm">
          <span className="font-bold text-slate-700">Tổng thanh toán:</span>
          <span className="text-2xl font-black text-red-600">{order.totalAmount.toLocaleString('vi-VN')}₫</span>
        </div>
      </div>
    </div>
  );
}
