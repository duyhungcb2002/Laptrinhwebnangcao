import React, { useState, useEffect, useCallback } from 'react';
import { ordersApi } from '../../api/orderCartApi';
import { useApp } from '../../context/AppContext';

export default function AdminOrdersPage() {
  const { showToast, confirmAction, refreshProducts } = useApp();

  const [orders, setOrders] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const [filterStatus, setFilterStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const fetchAdminOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await ordersApi.getAdminOrders({
        page,
        pageSize,
        status: filterStatus || undefined,
        search: searchQuery.trim() || undefined
      });
      setOrders(data.items || []);
      setTotalCount(data.totalItems || 0);
    } catch (err) {
      console.error('Lỗi tải danh sách đơn hàng admin:', err);
      showToast('Không thể tải danh sách đơn hàng', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, filterStatus, searchQuery, showToast]);

  useEffect(() => {
    fetchAdminOrders();
  }, [fetchAdminOrders]);

  const getValidNextStatuses = (currentStatus) => {
    switch (currentStatus) {
      case 'Pending':
        return ['Confirmed', 'Cancelled'];
      case 'Confirmed':
        return ['Preparing', 'Cancelled'];
      case 'Preparing':
        return ['Shipping', 'Cancelled'];
      case 'Shipping':
        return ['Completed'];
      case 'Completed':
      case 'Cancelled':
      default:
        return [];
    }
  };

  const handleStatusChange = (orderId, newStatus, currentStatus) => {
    if (newStatus === currentStatus) return;

    const actionMsg = newStatus === 'Cancelled'
      ? `Bạn có chắc chắn muốn HỦY đơn hàng này? Tồn kho sản phẩm sẽ được hoàn lại tự động trong database.`
      : `Xác nhận chuyển trạng thái đơn từ '${currentStatus}' sang '${newStatus}'?`;

    confirmAction(actionMsg, async () => {
      try {
        await ordersApi.updateOrderStatus(orderId, newStatus);
        showToast(`Đã chuyển trạng thái thành công sang ${newStatus}!`, 'success');
        if (newStatus === 'Cancelled') {
          await refreshProducts();
        }
        await fetchAdminOrders();
      } catch (err) {
        const message = err.response?.data?.detail || err.response?.data?.title || 'Không thể cập nhật trạng thái đơn hàng.';
        showToast(message, 'error');
      }
    });
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Quản Lý Đơn Hàng Admin</h2>
          <p className="text-xs text-slate-500">Xem và cập nhật tiến độ xử lý đơn hàng toàn hệ thống</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            placeholder="Tìm theo mã đơn, tên, SĐT..."
            className="p-2 border border-slate-300 rounded-xl text-xs bg-white outline-none focus:border-blue-600 w-full sm:w-60"
          />

          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
            className="p-2 border border-slate-300 rounded-xl text-xs bg-white font-bold outline-none"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="Pending">Pending (Chờ xác nhận)</option>
            <option value="Confirmed">Confirmed (Đã xác nhận)</option>
            <option value="Preparing">Preparing (Đang chuẩn bị)</option>
            <option value="Shipping">Shipping (Đang giao hàng)</option>
            <option value="Completed">Completed (Hoàn thành)</option>
            <option value="Cancelled">Cancelled (Đã hủy)</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center py-16 text-slate-500">
            <span className="material-symbols-outlined animate-spin text-3xl">sync</span>
            <span className="ml-2 font-medium">Đang tải danh sách đơn hàng...</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            Không có đơn hàng nào được tìm thấy.
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 uppercase text-slate-600 font-semibold border-b">
              <tr>
                <th className="p-4">Mã Đơn</th>
                <th className="p-4">Người Nhận</th>
                <th className="p-4">SĐT</th>
                <th className="p-4">Địa Chỉ</th>
                <th className="p-4">Tổng Tiền</th>
                <th className="p-4">Trạng Thái Quá Trình</th>
                <th className="p-4 text-right">Chuyển Trạng Thái Tiếp Theo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((o) => {
                const validNexts = getValidNextStatuses(o.status);
                return (
                  <tr key={o.id} className="hover:bg-slate-50">
                    <td className="p-4 font-mono font-bold text-blue-700">{o.orderNumber}</td>
                    <td className="p-4 font-bold text-slate-900">{o.recipientName}</td>
                    <td className="p-4 text-slate-600">{o.phoneNumber}</td>
                    <td className="p-4 text-slate-600 max-w-xs truncate">{o.shippingAddress}</td>
                    <td className="p-4 font-extrabold text-red-600">{o.total.toLocaleString('vi-VN')}₫</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded font-bold text-[10px] ${
                        o.status === 'Completed' ? 'bg-emerald-50 text-emerald-700' :
                        o.status === 'Cancelled' ? 'bg-red-50 text-red-700' :
                        o.status === 'Pending' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'
                      }`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {validNexts.length === 0 ? (
                        <span className="text-[11px] text-slate-400 italic">Trạng thái cuối (Không thể đổi)</span>
                      ) : (
                        <select
                          value={o.status}
                          onChange={(e) => handleStatusChange(o.id, e.target.value, o.status)}
                          className="p-1.5 border border-slate-300 rounded-lg text-xs bg-white font-semibold outline-none focus:border-blue-600"
                        >
                          <option value={o.status} disabled>{o.status} (Hiện tại)</option>
                          {validNexts.map((st) => (
                            <option key={st} value={st}>
                              ➔ Chuyển thành: {st}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs">
            <span className="text-slate-500">Hiển thị {orders.length} / tổng {totalCount} đơn hàng</span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(prev => prev - 1)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg bg-white font-bold disabled:opacity-40"
              >
                Trước
              </button>
              <span className="px-3 py-1.5 font-bold text-slate-700">Trang {page} / {totalPages}</span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(prev => prev + 1)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg bg-white font-bold disabled:opacity-40"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
