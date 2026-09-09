import React, { useState, useEffect, useCallback } from 'react';
import { inventoryApi } from '../../api/inventoryApi';
import { useApp } from '../../context/AppContext';

export default function AdminInventoryPage() {
  const { showToast, confirmAction, refreshProducts } = useApp();

  const [items, setItems] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 15;

  // History Tab & State
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' or 'history'
  const [history, setHistory] = useState([]);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Modal State
  const [modalMode, setModalMode] = useState(null); // 'import', 'export', 'adjust'
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalQty, setModalQty] = useState('');
  const [modalNote, setModalNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchInventory = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await inventoryApi.getInventory({
        search: searchQuery.trim() || undefined,
        lowStockOnly: lowStockOnly || undefined,
        page,
        pageSize
      });
      setItems(data.items || []);
      setTotalCount(data.totalItems || 0);
    } catch (err) {
      console.error('Lỗi tải danh sách tồn kho:', err);
      showToast('Không thể tải dữ liệu tồn kho.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, lowStockOnly, page, pageSize, showToast]);

  const fetchHistory = useCallback(async () => {
    setIsLoadingHistory(true);
    try {
      const data = await inventoryApi.getHistory({ page: historyPage, pageSize: 15 });
      setHistory(data.items || []);
      setHistoryTotal(data.totalItems || 0);
    } catch (err) {
      console.error('Lỗi tải lịch sử biến động kho:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [historyPage]);

  useEffect(() => {
    if (activeTab === 'inventory') {
      fetchInventory();
    } else {
      fetchHistory();
    }
  }, [activeTab, fetchInventory, fetchHistory]);

  const handleOpenModal = (product, mode) => {
    setSelectedProduct(product);
    setModalMode(mode);
    setModalQty(mode === 'adjust' ? product.stockQuantity : '');
    setModalNote('');
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProduct || !modalMode || isSubmitting) return;

    const qtyNum = parseInt(modalQty, 10);
    if (isNaN(qtyNum) || (modalMode !== 'adjust' && qtyNum <= 0) || (modalMode === 'adjust' && qtyNum < 0)) {
      showToast('Số lượng nhập không hợp lệ.', 'error');
      return;
    }

    if (modalMode === 'adjust' && !modalNote.trim()) {
      showToast('Ghi chú bắt buộc phải nhập khi điều chỉnh tồn kho.', 'error');
      return;
    }

    const actionText = modalMode === 'import' ? 'Nhập kho' : modalMode === 'export' ? 'Xuất kho' : 'Điều chỉnh kho';

    confirmAction(`Xác nhận thực hiện ${actionText} cho sản phẩm [${selectedProduct.productCode}] ${selectedProduct.productName}?`, async () => {
      setIsSubmitting(true);
      try {
        if (modalMode === 'import') {
          await inventoryApi.importStock(selectedProduct.productId, qtyNum, modalNote);
        } else if (modalMode === 'export') {
          await inventoryApi.exportStock(selectedProduct.productId, qtyNum, modalNote);
        } else if (modalMode === 'adjust') {
          await inventoryApi.adjustStock(selectedProduct.productId, qtyNum, modalNote);
        }

        showToast(`Đã ${actionText} thành công!`, 'success');
        setModalMode(null);
        await refreshProducts();
        await fetchInventory();
      } catch (err) {
        const message = err.response?.data?.detail || err.response?.data?.title || `${actionText} thất bại.`;
        showToast(message, 'error');
      } finally {
        setIsSubmitting(false);
      }
    });
  };

  const totalPages = Math.ceil(totalCount / pageSize);
  const historyTotalPages = Math.ceil(historyTotal / 15);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Quản Lý Tồn Kho Linh Kiện</h2>
          <p className="text-xs text-slate-500 font-medium">Theo dõi số lượng hàng hóa và lịch sử nhập xuất kho real-time</p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'inventory' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Tồn Kho Hiện Tại
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'history' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Lịch Sử Biến Động Kho
          </button>
        </div>
      </div>

      {activeTab === 'inventory' ? (
        <>
          {/* Controls Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              placeholder="Tìm theo mã SKU hoặc tên linh kiện..."
              className="w-full sm:w-80 p-2.5 border border-slate-300 rounded-xl text-xs outline-none focus:border-blue-600"
            />

            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
              <input
                type="checkbox"
                checked={lowStockOnly}
                onChange={(e) => { setLowStockOnly(e.target.checked); setPage(1); }}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Chỉ hiển thị sản phẩm sắp hết / hết hàng (≤ 10 cái)</span>
            </label>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {isLoading ? (
              <div className="flex justify-center items-center py-16 text-slate-500">
                <span className="material-symbols-outlined animate-spin text-3xl">sync</span>
                <span className="ml-2 font-medium">Đang tải danh sách tồn kho...</span>
              </div>
            ) : items.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-sm">Không tìm thấy sản phẩm kiểm kê nào.</div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 uppercase text-slate-600 font-semibold border-b">
                  <tr>
                    <th className="p-4">Mã SKU</th>
                    <th className="p-4">Tên Linh Kiện</th>
                    <th className="p-4">Danh Mục</th>
                    <th className="p-4">Trạng Thái Kho</th>
                    <th className="p-4">Tồn Kho</th>
                    <th className="p-4 text-right">Thao Tác Chuyên Dụng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((p) => (
                    <tr key={p.productId} className="hover:bg-slate-50">
                      <td className="p-4 font-mono font-bold text-blue-700">{p.productCode}</td>
                      <td className="p-4 font-semibold text-slate-900">{p.productName}</td>
                      <td className="p-4 font-bold text-slate-600">{p.categoryName}</td>
                      <td className="p-4">
                        {p.stockStatus === 'OutOfStock' ? (
                          <span className="px-2.5 py-1 rounded font-bold text-[10px] bg-red-50 text-red-600">Hết hàng</span>
                        ) : p.stockStatus === 'LowStock' ? (
                          <span className="px-2.5 py-1 rounded font-bold text-[10px] bg-amber-50 text-amber-600">Sắp hết hàng</span>
                        ) : (
                          <span className="px-2.5 py-1 rounded font-bold text-[10px] bg-emerald-50 text-emerald-600">Đủ hàng</span>
                        )}
                      </td>
                      <td className="p-4 font-extrabold text-sm text-slate-900">{p.stockQuantity} cái</td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenModal(p, 'import')}
                          className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold rounded-lg text-xs"
                        >
                          + Nhập kho
                        </button>
                        <button
                          onClick={() => handleOpenModal(p, 'export')}
                          className="px-2.5 py-1 bg-red-50 text-red-700 hover:bg-red-100 font-bold rounded-lg text-xs"
                        >
                          - Xuất kho
                        </button>
                        <button
                          onClick={() => handleOpenModal(p, 'adjust')}
                          className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold rounded-lg text-xs"
                        >
                          Điều chỉnh
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs">
                <span className="text-slate-500">Hiển thị {items.length} / tổng {totalCount} sản phẩm</span>
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
        </>
      ) : (
        /* History Tab */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {isLoadingHistory ? (
            <div className="flex justify-center items-center py-16 text-slate-500">
              <span className="material-symbols-outlined animate-spin text-3xl">sync</span>
              <span className="ml-2 font-medium">Đang tải lịch sử kho...</span>
            </div>
          ) : history.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-sm">Chưa có lịch sử biến động kho nào.</div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 uppercase text-slate-600 font-semibold border-b">
                <tr>
                  <th className="p-4">Thời Gian</th>
                  <th className="p-4">Loại Giao Dịch</th>
                  <th className="p-4">Sản Phẩm</th>
                  <th className="p-4">Số Lượng</th>
                  <th className="p-4">Tồn Trước ➔ Sau</th>
                  <th className="p-4">Người Thực Hiện</th>
                  <th className="p-4">Ghi Chú</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((h) => (
                  <tr key={h.transactionId} className="hover:bg-slate-50">
                    <td className="p-4 text-slate-500">{new Date(h.createdAtUtc).toLocaleString('vi-VN')}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        h.type === 'Import' ? 'bg-emerald-50 text-emerald-700' :
                        h.type === 'Export' ? 'bg-red-50 text-red-700' :
                        h.type === 'Order' ? 'bg-blue-50 text-blue-700' :
                        h.type === 'Cancellation' ? 'bg-purple-50 text-purple-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {h.type}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-slate-900">{h.productName} <span className="font-mono text-slate-400 font-normal">({h.productCode})</span></td>
                    <td className="p-4 font-extrabold">{h.quantity}</td>
                    <td className="p-4 font-mono">{h.stockBefore} ➔ <span className="font-bold text-blue-700">{h.stockAfter}</span></td>
                    <td className="p-4 text-slate-600">{h.performedBy}</td>
                    <td className="p-4 text-slate-500 italic max-w-xs truncate">{h.note || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {historyTotalPages > 1 && (
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs">
              <span className="text-slate-500">Hiển thị {history.length} / tổng {historyTotal} giao dịch</span>
              <div className="flex gap-2">
                <button
                  disabled={historyPage <= 1}
                  onClick={() => setHistoryPage(prev => prev - 1)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg bg-white font-bold disabled:opacity-40"
                >
                  Trước
                </button>
                <span className="px-3 py-1.5 font-bold text-slate-700">Trang {historyPage} / {historyTotalPages}</span>
                <button
                  disabled={historyPage >= historyTotalPages}
                  onClick={() => setHistoryPage(prev => prev + 1)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg bg-white font-bold disabled:opacity-40"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Inventory Action Modal */}
      {modalMode && selectedProduct && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">
                {modalMode === 'import' ? 'Nhập Kho Hàng' : modalMode === 'export' ? 'Xuất Kho Hàng' : 'Điều Chỉnh Tồn Kho'}
              </h3>
              <button onClick={() => setModalMode(null)} className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl text-xs space-y-1">
              <p><span className="font-bold text-slate-700">Sản phẩm:</span> {selectedProduct.productName}</p>
              <p><span className="font-bold text-slate-700">Mã SKU:</span> <span className="font-mono">{selectedProduct.productCode}</span></p>
              <p><span className="font-bold text-slate-700">Tồn kho hiện tại:</span> <span className="font-bold text-blue-700">{selectedProduct.stockQuantity} cái</span></p>
            </div>

            <form onSubmit={handleModalSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {modalMode === 'adjust' ? 'Số lượng tồn kho mới *' : 'Số lượng *'}
                </label>
                <input
                  type="number"
                  min={modalMode === 'adjust' ? 0 : 1}
                  value={modalQty}
                  onChange={(e) => setModalQty(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl outline-none focus:border-blue-600 font-bold"
                  placeholder="Nhập số lượng"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Ghi chú {modalMode === 'adjust' && '* (Bắt buộc khi điều chỉnh)'}
                </label>
                <input
                  type="text"
                  value={modalNote}
                  onChange={(e) => setModalNote(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl outline-none focus:border-blue-600"
                  placeholder="Lý do nhập/xuất/điều chỉnh kho..."
                  required={modalMode === 'adjust'}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-bold text-slate-700 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-4 py-2 text-white font-bold rounded-xl shadow-md disabled:opacity-50 ${
                    modalMode === 'import' ? 'bg-emerald-600 hover:bg-emerald-700' :
                    modalMode === 'export' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isSubmitting ? 'Đang lưu...' : 'Xác Nhận'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
