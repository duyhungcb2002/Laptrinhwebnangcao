import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ordersApi } from '../../api/orderCartApi';
import EmptyState from '../../components/common/EmptyState';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorState, setErrorState] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setErrorState(null);
    try {
      const data = await ordersApi.getMyOrders({ page: 1, pageSize: 50, status: statusFilter || undefined });
      setOrders(data.items || []);
    } catch (err) {
      console.error('Lỗi tải danh sách đơn hàng:', err);
      const status = err.response?.status;
      if (status === 401) {
        setErrorState({ type: 401, title: 'Phiên làm việc hết hạn', message: 'Vui lòng đăng nhập lại để xem lịch sử đơn hàng.' });
      } else if (status === 403) {
        setErrorState({ type: 403, title: 'Truy cập bị từ chối', message: 'Tài khoản của bạn không có quyền xem danh sách đơn hàng.' });
      } else {
        setErrorState({ type: 'network', title: 'Lỗi kết nối máy chủ', message: 'Không thể kết nối đến hệ thống backend. Vui lòng kiểm tra lại kết nối.' });
      }
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
        return <span className="bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded text-xs">Hoàn thành</span>;
      case 'Pending':
        return <span className="bg-amber-50 text-amber-700 font-bold px-2.5 py-1 rounded text-xs font-mono">Chờ xác nhận (Pending)</span>;
      case 'Confirmed':
        return <span className="bg-blue-50 text-blue-700 font-bold px-2.5 py-1 rounded text-xs">Đã xác nhận</span>;
      case 'Preparing':
        return <span className="bg-indigo-50 text-indigo-700 font-bold px-2.5 py-1 rounded text-xs">Đang chuẩn bị</span>;
      case 'Shipping':
        return <span className="bg-purple-50 text-purple-700 font-bold px-2.5 py-1 rounded text-xs">Đang giao hàng</span>;
      case 'Cancelled':
        return <span className="bg-red-50 text-red-700 font-bold px-2.5 py-1 rounded text-xs">Đã hủy</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 font-bold px-2.5 py-1 rounded text-xs">{status}</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20 text-slate-500">
        <span className="material-symbols-outlined animate-spin text-3xl">sync</span>
        <span className="ml-2 font-medium">Đang tải danh sách đơn hàng...</span>
      </div>
    );
  }

  if (errorState) {
    return (
      <EmptyState
        icon={errorState.type === 401 ? 'lock' : errorState.type === 403 ? 'block' : 'cloud_off'}
        title={errorState.title}
        message={errorState.message}
        actionText={errorState.type === 401 ? 'Đăng nhập ngay' : 'Thử lại'}
        actionLink={errorState.type === 401 ? '/login' : undefined}
        onAction={errorState.type !== 401 ? fetchOrders : undefined}
      />
    );
  }

  if (orders.length === 0 && !statusFilter) {
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-900">Lịch Sử Đơn Hàng</h2>
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-600">Lọc theo trạng thái:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 border border-slate-300 rounded-xl text-xs outline-none focus:border-blue-600 bg-white"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="Pending">Chờ xác nhận (Pending)</option>
            <option value="Confirmed">Đã xác nhận</option>
            <option value="Preparing">Đang chuẩn bị</option>
            <option value="Shipping">Đang giao hàng</option>
            <option value="Completed">Hoàn thành</option>
            <option value="Cancelled">Đã hủy</option>
          </select>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center text-slate-500 text-sm border border-slate-200">
          Không có đơn hàng nào khớp với trạng thái được chọn.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-200">
          {orders.map((order) => (
            <div key={order.id} className="p-6 hover:bg-slate-50 transition-colors space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <span className="font-mono font-bold text-blue-700 text-sm">{order.orderNumber}</span>
                  <span className="text-xs text-slate-400 ml-3">
                    Ngày đặt: {new Date(order.createdAtUtc).toLocaleString('vi-VN')}
                  </span>
                </div>
                <div>{getStatusBadge(order.status)}</div>
              </div>

              <div className="space-y-2 text-xs">
                {order.orderItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-slate-700">
                    <span className="line-clamp-1 flex-1">{item.productName} x{item.quantity}</span>
                    <span className="font-bold">{item.lineTotal.toLocaleString('vi-VN')}₫</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                <div className="text-xs">
                  <span>Tổng cộng: </span>
                  <span className="font-extrabold text-red-600 text-base ml-1">
                    {order.total.toLocaleString('vi-VN')}₫
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
      )}
    </div>
  );
}
