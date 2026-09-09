import React, { useState, useEffect, useCallback } from 'react';
import { reportsApi } from '../../api/reportsApi';

export default function AdminReportsPage() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [granularity, setGranularity] = useState('month');
  const [fromUtc, setFromUtc] = useState('');
  const [toUtc, setToUtc] = useState('');
  const [threshold, setThreshold] = useState(10);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        granularity,
        lowStockThreshold: Number(threshold) || 10,
        top: 10
      };
      if (fromUtc) params.fromUtc = new Date(fromUtc).toISOString();
      if (toUtc) params.toUtc = new Date(toUtc).toISOString();

      const data = await reportsApi.getDashboardReport(params);
      setReport(data);
    } catch (err) {
      console.error('Lỗi tải báo cáo:', err);
      const detail = err?.response?.data?.detail || err?.response?.data?.title || 'Không thể tải dữ liệu báo cáo.';
      setError(detail);
    } finally {
      setLoading(false);
    }
  }, [granularity, fromUtc, toUtc, threshold]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const summary = report?.summary || {};
  const revenueSeries = report?.revenueSeries || [];
  const topSellingProducts = report?.topSellingProducts || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Báo Cáo & Thống Kê Doanh Thu</h2>
          <p className="text-xs text-slate-500">Phân tích kết quả kinh doanh và hiệu suất bán hàng từ cơ sở dữ liệu</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap gap-4 items-center text-xs">
        <div className="flex items-center gap-2">
          <label className="font-bold text-slate-700">Xem theo:</label>
          <select
            value={granularity}
            onChange={(e) => setGranularity(e.target.value)}
            className="p-2 border border-slate-300 rounded-xl bg-white font-medium outline-none"
          >
            <option value="month">Theo Tháng</option>
            <option value="day">Theo Ngày</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="font-bold text-slate-700">Từ ngày:</label>
          <input
            type="date"
            value={fromUtc}
            onChange={(e) => setFromUtc(e.target.value)}
            className="p-2 border border-slate-300 rounded-xl bg-white font-medium outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="font-bold text-slate-700">Đến ngày:</label>
          <input
            type="date"
            value={toUtc}
            onChange={(e) => setToUtc(e.target.value)}
            className="p-2 border border-slate-300 rounded-xl bg-white font-medium outline-none"
          />
        </div>

        <button
          onClick={fetchReport}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl"
        >
          Lọc dữ liệu
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500 text-xs font-medium">Đang tổng hợp báo cáo...</div>
      ) : error ? (
        <div className="p-6 bg-red-50 text-red-600 rounded-2xl text-xs font-bold">{error}</div>
      ) : (
        <>
          {/* Metrics summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <p className="text-xs font-bold text-slate-400 uppercase">Doanh Thu Đã Thu</p>
              <h3 className="text-2xl font-black text-emerald-600">{(summary.totalRevenue || 0).toLocaleString('vi-VN')}₫</h3>
              <p className="text-[11px] text-slate-400">Chỉ tính đơn Completed</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <p className="text-xs font-bold text-slate-400 uppercase">Số Linh Kiện Đã Bán</p>
              <h3 className="text-2xl font-black text-blue-600">{summary.totalItemsSold || 0} sản phẩm</h3>
              <p className="text-[11px] text-slate-400">Chỉ tính đơn Completed</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <p className="text-xs font-bold text-slate-400 uppercase">Đơn Thành Công / Tổng Đơn</p>
              <h3 className="text-2xl font-black text-purple-600">{summary.completedOrders || 0} / {summary.totalOrders || 0}</h3>
              <p className="text-[11px] text-slate-400">Hủy: {summary.cancelledOrders || 0} đơn</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <p className="text-xs font-bold text-slate-400 uppercase">Khách Hàng Mới</p>
              <h3 className="text-2xl font-black text-amber-600">{summary.newCustomers || 0} tài khoản</h3>
              <p className="text-[11px] text-slate-400">Đăng ký trong kỳ</p>
            </div>
          </div>

          {/* Revenue Chart/Series section */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-slate-900 border-b border-slate-100 pb-3">
              Biểu Đồ Doanh Thu Theo {granularity === 'month' ? 'Tháng' : 'Ngày'}
            </h3>

            {revenueSeries.length === 0 ? (
              <p className="text-slate-400 text-xs py-6 text-center">Không có dữ liệu doanh thu trong khoảng thời gian này.</p>
            ) : (
              <div className="space-y-3 pt-2">
                {revenueSeries.map((item, idx) => {
                  const maxRev = Math.max(...revenueSeries.map(s => s.revenue), 1);
                  const pct = Math.round((item.revenue / maxRev) * 100);
                  return (
                    <div key={idx} className="space-y-1 text-xs">
                      <div className="flex justify-between text-slate-700 font-medium">
                        <span>{item.period} ({item.completedOrderCount} đơn thành công)</span>
                        <span className="font-bold text-emerald-600">{item.revenue.toLocaleString('vi-VN')}₫</span>
                      </div>
                      <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(pct, 2)}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Top Selling Products */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-slate-900 border-b border-slate-100 pb-3">
              Top Sản Phẩm Bán Chạy Trong Kỳ
            </h3>

            {topSellingProducts.length === 0 ? (
              <p className="text-slate-400 text-xs py-4 text-center">Chưa có sản phẩm nào được bán trong khoảng thời gian này.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px]">
                    <tr>
                      <th className="p-3">Mã SKU</th>
                      <th className="p-3">Tên sản phẩm</th>
                      <th className="p-3 text-right">Số lượng bán</th>
                      <th className="p-3 text-right">Doanh thu thu về</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {topSellingProducts.map((p) => (
                      <tr key={p.productId} className="hover:bg-slate-50">
                        <td className="p-3 font-mono text-slate-500">{p.sku}</td>
                        <td className="p-3 font-bold text-slate-800">{p.productName}</td>
                        <td className="p-3 text-right font-extrabold text-blue-600">{p.quantitySold}</td>
                        <td className="p-3 text-right font-extrabold text-emerald-600">{p.revenue.toLocaleString('vi-VN')}₫</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
