import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { reportsApi } from '../../api/reportsApi';

export default function AdminDashboardPage() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const data = await reportsApi.getDashboardReport({
          granularity: 'month',
          lowStockThreshold: 10,
          top: 5
        });
        setDashboardData(data);
      } catch (err) {
        console.error('Lỗi tải dữ liệu dashboard:', err);
        setError('Không thể tải dữ liệu báo cáo tổng quan.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500 text-xs font-medium">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        Đang tải dữ liệu dashboard...
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="p-8 bg-red-50 text-red-600 rounded-2xl text-xs font-bold text-center">
        {error || 'Đã có lỗi xảy ra.'}
      </div>
    );
  }

  const { summary, lowStockProducts, recentOrders, topSellingProducts } = dashboardData;

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
            <p className="text-xs font-bold text-slate-400 uppercase">Tổng Doanh Thu (Đã thu)</p>
            <h3 className="text-xl font-black text-emerald-600 mt-1">{(summary?.totalRevenue || 0).toLocaleString('vi-VN')}₫</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">payments</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Tổng Đơn Hàng</p>
            <h3 className="text-2xl font-black text-blue-600 mt-1">{summary?.totalOrders || 0}</h3>
            <p className="text-[10px] text-slate-400 font-semibold">{summary?.completedOrders || 0} đã thành công</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">shopping_bag</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Sản Phẩm Đã Bán</p>
            <h3 className="text-2xl font-black text-purple-600 mt-1">{summary?.totalItemsSold || 0}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">inventory_2</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Khách Hàng Mới</p>
            <h3 className="text-2xl font-black text-amber-600 mt-1">{summary?.newCustomers || 0}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">group</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Top Selling Products */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-base text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-500">trending_up</span>
            <span>Top Bán Chạy</span>
          </h3>

          <div className="divide-y divide-slate-100 text-xs">
            {(!topSellingProducts || topSellingProducts.length === 0) ? (
              <p className="text-slate-500 py-4 text-center italic">Chưa có sản phẩm nào được bán.</p>
            ) : (
              topSellingProducts.map((p) => (
                <div key={p.productId} className="py-2.5 flex justify-between items-center">
                  <div className="pr-2">
                    <p className="font-bold text-slate-800 line-clamp-1">{p.productName}</p>
                    <p className="text-[11px] font-mono text-slate-400">SKU: {p.sku}</p>
                  </div>
                  <div className="text-right">
                    <span className="bg-blue-50 text-blue-700 font-extrabold px-2 py-0.5 rounded text-[11px] block">
                      {p.quantitySold} cái
                    </span>
                    <span className="text-[10px] text-slate-500">{p.revenue.toLocaleString('vi-VN')}₫</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="font-bold text-base text-slate-900">Đơn Hàng Mới Nhất</h3>
            <Link to="/admin/orders" className="text-xs text-blue-600 font-bold hover:underline">
              Xem tất cả
            </Link>
          </div>

          {(!recentOrders || recentOrders.length === 0) ? (
            <div className="py-8 text-center text-xs text-slate-500">Chưa có đơn hàng nào</div>
          ) : (
            <div className="divide-y divide-slate-100 text-xs">
              {recentOrders.slice(0, 5).map((o) => (
                <div key={o.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-mono font-bold text-blue-700">{o.orderNumber}</p>
                    <p className="text-slate-500">{o.recipientName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-extrabold text-red-600">{o.total.toLocaleString('vi-VN')}₫</p>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {o.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock Warning */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 h-fit">
          <h3 className="font-bold text-base text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-500">warning</span>
            <span>Cảnh Báo Tồn Kho Thấp</span>
          </h3>

          <div className="divide-y divide-slate-100 text-xs">
            {(!lowStockProducts || lowStockProducts.length === 0) ? (
              <p className="text-slate-500 py-2">Tất cả sản phẩm đều đủ số lượng tồn kho.</p>
            ) : (
              lowStockProducts.map(p => (
                <div key={p.productId} className="py-2.5 flex justify-between items-center">
                  <span className="font-bold text-slate-800 line-clamp-1 flex-1 pr-2">{p.productName}</span>
                  <span className="bg-red-50 text-red-600 font-extrabold px-2 py-0.5 rounded text-[11px]">
                    Còn {p.stockQuantity}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
