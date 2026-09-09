import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ordersApi } from '../../api/orderCartApi';
import { useApp } from '../../context/AppContext';
import EmptyState from '../../components/common/EmptyState';

export default function OrderDetailPage() {
  const { id } = useParams();
  const { showToast, confirmAction, refreshProducts } = useApp();

  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const fetchOrder = useCallback(async () => {
    setIsLoading(true);
    setErrorStatus(null);
    try {
      const data = await ordersApi.getOrderById(id);
      setOrder(data);
    } catch (err) {
      console.error('Lỗi tải thông tin đơn hàng:', err);
      const status = err.response?.status;
      setErrorStatus(status || 500);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const handleCancelOrder = () => {
    confirmAction('Bạn có chắc chắn muốn hủy đơn hàng này? Tồn kho sản phẩm sẽ được tự động hoàn lại.', async () => {
      setIsCancelling(true);
      try {
        const updatedOrder = await ordersApi.cancelOrder(id);
        setOrder(updatedOrder);
        showToast('Đã hủy đơn hàng thành công!', 'success');
        await refreshProducts();
      } catch (err) {
        const message = err.response?.data?.detail || err.response?.data?.title || 'Không thể hủy đơn hàng.';
        showToast(message, 'error');
      } finally {
        setIsCancelling(false);
      }
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
        return <span className="bg-emerald-50 text-emerald-700 font-bold px-3 py-1 rounded-full text-xs">Hoàn thành</span>;
      case 'Pending':
        return <span className="bg-amber-50 text-amber-700 font-bold px-3 py-1 rounded-full text-xs font-mono">Chờ xác nhận (Pending)</span>;
      case 'Confirmed':
        return <span className="bg-blue-50 text-blue-700 font-bold px-3 py-1 rounded-full text-xs">Đã xác nhận</span>;
      case 'Preparing':
        return <span className="bg-indigo-50 text-indigo-700 font-bold px-3 py-1 rounded-full text-xs">Đang chuẩn bị</span>;
      case 'Shipping':
        return <span className="bg-purple-50 text-purple-700 font-bold px-3 py-1 rounded-full text-xs">Đang giao hàng</span>;
      case 'Cancelled':
        return <span className="bg-red-50 text-red-700 font-bold px-3 py-1 rounded-full text-xs">Đã hủy</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 font-bold px-3 py-1 rounded-full text-xs">{status}</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20 text-slate-500">
        <span className="material-symbols-outlined animate-spin text-3xl">sync</span>
        <span className="ml-2 font-medium">Đang tải thông tin đơn hàng...</span>
      </div>
    );
  }

  if (errorStatus === 403) {
    return (
      <EmptyState
        icon="block"
        title="Truy cập bị từ chối (403)"
        message="Bạn không có quyền truy cập đơn hàng của người dùng khác."
        actionText="Quay lại danh sách đơn hàng"
        actionLink="/account/orders"
      />
    );
  }

  if (errorStatus === 404 || !order) {
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
        <span className="text-slate-800 font-bold">{order.orderNumber}</span>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              <span>Đơn hàng {order.orderNumber}</span>
              {getStatusBadge(order.status)}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Thời gian đặt: {new Date(order.createdAtUtc).toLocaleString('vi-VN')}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {order.status === 'Pending' && (
              <button
                onClick={handleCancelOrder}
                disabled={isCancelling}
                className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">cancel</span>
                <span>Hủy Đơn Hàng</span>
              </button>
            )}
            <Link
              to="/account/orders"
              className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              Quay lại
            </Link>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl text-xs">
          <div className="space-y-2">
            <h4 className="font-bold uppercase text-[11px] text-slate-400">Thông tin người nhận</h4>
            <p className="font-bold text-slate-800">{order.recipientName}</p>
            <p className="text-slate-600">Số điện thoại: {order.phoneNumber}</p>
            <p className="text-slate-600">Địa chỉ giao hàng: {order.shippingAddress}</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-bold uppercase text-[11px] text-slate-400">Phương thức thanh toán</h4>
            <p className="font-bold text-slate-800">{order.paymentMethod === 'Cod' ? 'Thanh toán COD (Tiền mặt)' : order.paymentMethod}</p>
          </div>
        </div>

        {/* Item List */}
        <div className="space-y-4">
          <h3 className="font-bold text-sm text-slate-900 border-b border-slate-200 pb-2">Danh Sách Sản Phẩm</h3>
          <div className="divide-y divide-slate-100 text-xs">
            {order.orderItems.map((item) => (
              <div key={item.id} className="py-3 flex justify-between items-center">
                <div>
                  <p className="font-bold text-slate-900">{item.productName}</p>
                  <p className="text-slate-400 text-[11px]">
                    Mã SKU: {item.productCode} | {item.unitPrice.toLocaleString('vi-VN')}₫ x {item.quantity}
                  </p>
                </div>
                <span className="font-extrabold text-slate-900 text-sm">{item.lineTotal.toLocaleString('vi-VN')}₫</span>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-slate-200 pt-4 flex justify-between items-center text-sm">
          <span className="font-bold text-slate-700">Tổng thanh toán:</span>
          <span className="text-2xl font-black text-red-600">{order.total.toLocaleString('vi-VN')}₫</span>
        </div>
      </div>
    </div>
  );
}
