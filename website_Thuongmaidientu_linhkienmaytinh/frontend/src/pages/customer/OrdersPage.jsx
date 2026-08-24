import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import EmptyState from '../../components/common/EmptyState';

export default function OrdersPage() {
  const { orders } = useApp();

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Delivered':
        return <span className="bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded text-xs">Đã giao hàng</span>;
      case 'Processing':
        return <span className="bg-amber-50 text-amber-700 font-bold px-2.5 py-1 rounded text-xs">Đang xử lý</span>;
      case 'Shipped':
        return <span className="bg-blue-50 text-blue-700 font-bold px-2.5 py-1 rounded text-xs">Đang vận chuyển</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 font-bold px-2.5 py-1 rounded text-xs">{status}</span>;
    }
  };

  if (orders.length === 0) {
    return (
      <EmptyState
        icon="receipt_long"
        title="Chưa có đơn hàng nào"
        message="Bạn chưa từng thực hiện đơn hàng nào trên TechHub PC."
        actionText="Mua sắm linh kiện ngay"
        actionLink="/products"
      />
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Lịch Sử Đơn Hàng</h2>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-200">
        {orders.map((order) => (
          <div key={order.id} className="p-6 hover:bg-slate-50 transition-colors space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <span className="font-mono font-bold text-blue-700 text-sm">{order.id}</span>
                <span className="text-xs text-slate-400 ml-3">Thời gian: {order.date}</span>
              </div>
              <div>{getStatusBadge(order.status)}</div>
            </div>

            <div className="space-y-2 text-xs">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-slate-700">
                  <span className="line-clamp-1 flex-1">{item.name} x{item.qty}</span>
                  <span className="font-bold">{(item.price * item.qty).toLocaleString('vi-VN')}₫</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              <div className="text-xs">
                <span>Tổng cộng: </span>
                <span className="font-extrabold text-red-600 text-base ml-1">
                  {order.totalAmount.toLocaleString('vi-VN')}₫
                </span>
              </div>

              <Link
                to={`/account/orders/${order.id}`}
                className="bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1 transition-colors"
              >
                <span>Chi tiết đơn hàng</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
