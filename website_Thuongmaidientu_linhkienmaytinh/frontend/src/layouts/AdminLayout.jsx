import React, { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Toast from '../components/common/Toast';
import ConfirmModal from '../components/common/ConfirmModal';

export default function AdminLayout() {
  const { currentUser } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false); // Default closed on mobile

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: 'dashboard', end: true },
    { path: '/admin/products', label: 'Sản phẩm', icon: 'inventory_2' },
    { path: '/admin/categories', label: 'Danh mục', icon: 'category' },
    { path: '/admin/inventory', label: 'Tồn kho', icon: 'warehouse' },
    { path: '/admin/orders', label: 'Đơn hàng', icon: 'shopping_bag' },
    { path: '/admin/users', label: 'Người dùng', icon: 'group' },
    { path: '/admin/reviews', label: 'Đánh giá', icon: 'rate_review' },
    { path: '/admin/reports', label: 'Báo cáo doanh thu', icon: 'analytics' },
  ];

  const handleNavClick = () => {
    // Auto-close sidebar on mobile after clicking link
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen flex bg-slate-100 font-['Be_Vietnam_Pro'] text-slate-900 overflow-x-hidden relative">
      {/* Mobile Dark Backdrop Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
        />
      )}

      {/* Admin Sidebar */}
      <aside
        className={`fixed md:static top-0 left-0 bottom-0 z-50 bg-slate-900 text-slate-300 w-64 flex-shrink-0 transition-transform duration-300 transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } flex flex-col h-full shadow-2xl md:shadow-none`}
      >
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <Link to="/admin" onClick={handleNavClick} className="flex items-center gap-2 font-bold text-lg text-white">
            <span className="material-symbols-outlined text-purple-500 text-2xl">admin_panel_settings</span>
            <span>TechHub Admin</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-slate-400 hover:text-white p-1"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              onClick={handleNavClick}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <span className="material-symbols-outlined text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800 text-xs">
          <Link to="/" onClick={handleNavClick} className="flex items-center gap-2 text-blue-400 hover:text-blue-300 font-semibold">
            <span className="material-symbols-outlined text-base">storefront</span>
            <span>Quay về Cửa hàng</span>
          </Link>
        </div>
      </aside>

      {/* Main Admin Content */}
      <div className="flex-1 flex flex-col min-w-0 w-full overflow-x-hidden">
        {/* Top Navbar */}
        <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-1.5 rounded-lg text-slate-700 hover:bg-slate-100"
              aria-label="Toggle Admin Sidebar"
            >
              <span className="material-symbols-outlined text-2xl">menu</span>
            </button>
            <h1 className="text-sm sm:text-base font-bold text-slate-800 truncate">Hệ Thống Quản Lý TechHub PC</h1>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/" className="text-xs font-semibold text-blue-600 hover:underline hidden sm:flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">open_in_new</span> Cửa hàng
            </Link>
            <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-purple-600 text-white font-bold text-xs flex items-center justify-center">
                {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold text-slate-800">{currentUser?.name || 'Admin'}</p>
                <p className="text-[10px] text-slate-500">Quản trị viên</p>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Container */}
        <main className="p-4 sm:p-6 flex-1 overflow-y-auto overflow-x-hidden">
          <Outlet />
        </main>
      </div>

      <Toast />
      <ConfirmModal />
    </div>
  );
}
