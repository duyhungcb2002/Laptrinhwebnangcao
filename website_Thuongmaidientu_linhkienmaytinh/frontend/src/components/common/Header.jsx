import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

export default function Header() {
  const { cart, currentUser, logout } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const totalItems = cart ? cart.reduce((sum, item) => sum + item.qty, 0) : 0;

  // Auto-close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    } else {
      navigate('/products');
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm w-full">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex justify-between items-center gap-2 sm:gap-4 relative">
        {/* Brand Logo */}
        <Link to="/" className="text-xl sm:text-2xl font-bold text-blue-700 flex items-center gap-1.5 flex-shrink-0">
          <span className="material-symbols-outlined text-2xl sm:text-3xl text-blue-600">computer</span>
          <span className="bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent font-extrabold tracking-tight">
            TechHub <span className="hidden min-[400px]:inline">PC</span>
          </span>
        </Link>

        {/* Search Bar - Desktop & Tablet */}
        <form onSubmit={handleSearch} className="flex-1 max-w-md relative hidden md:block">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm CPU, VGA, RAM, SSD..."
            className="w-full pl-4 pr-10 py-1.5 border border-slate-300 rounded-full text-xs bg-slate-50 focus:border-blue-700 focus:bg-white outline-none transition-all"
          />
          <button type="submit" aria-label="Tìm kiếm" className="absolute right-3 top-2 text-slate-400 hover:text-blue-700">
            <span className="material-symbols-outlined text-base">search</span>
          </button>
        </form>

        {/* Right Action Icons */}
        <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
          <Link to="/products" className="hidden lg:flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-blue-700">
            <span className="material-symbols-outlined text-lg">grid_view</span>
            <span>Sản phẩm</span>
          </Link>

          {/* Cart Icon */}
          <Link to="/cart" aria-label="Giỏ hàng" className="relative p-1.5 text-slate-700 hover:text-blue-700 transition-colors">
            <span className="material-symbols-outlined text-2xl">shopping_cart</span>
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>

          {/* Admin shortcut if Admin role */}
          {currentUser && currentUser.role === 'Admin' && (
            <Link
              to="/admin"
              className="hidden sm:flex items-center gap-1 bg-purple-50 text-purple-700 hover:bg-purple-100 font-bold px-2.5 py-1 rounded-lg text-xs border border-purple-200"
            >
              <span className="material-symbols-outlined text-base">admin_panel_settings</span>
              <span>Admin</span>
            </Link>
          )}

          {/* User Profile / Auth Button */}
          {currentUser ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-1.5 p-1 rounded-lg hover:bg-slate-100 transition-colors text-slate-700 border border-slate-200"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="hidden xl:inline text-xs font-semibold max-w-[90px] truncate">{currentUser.name}</span>
                <span className="material-symbols-outlined text-sm">expand_more</span>
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-2xl py-2 z-50 divide-y divide-slate-100 animate-fadeIn">
                  <div className="px-4 py-2">
                    <p className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                  </div>
                  <div className="py-1 text-xs">
                    <Link
                      to="/account/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-blue-50 hover:text-blue-700 font-medium"
                    >
                      <span className="material-symbols-outlined text-base">person</span>
                      <span>Hồ sơ cá nhân</span>
                    </Link>
                    <Link
                      to="/account/orders"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-blue-50 hover:text-blue-700 font-medium"
                    >
                      <span className="material-symbols-outlined text-base">receipt_long</span>
                      <span>Đơn hàng của tôi</span>
                    </Link>
                  </div>
                  <div className="py-1 text-xs">
                    <button
                      onClick={() => { logout(); setUserDropdownOpen(false); }}
                      className="w-full text-left flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 font-bold"
                    >
                      <span className="material-symbols-outlined text-base">logout</span>
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                to="/login"
                className="text-xs font-bold text-slate-700 hover:text-blue-700 px-3 py-1.5 rounded-lg hover:bg-slate-100"
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg shadow-sm"
              >
                Đăng ký
              </Link>
            </div>
          )}

          {/* Hamburger Menu Button - Always visible on mobile */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
            className="md:hidden p-1.5 text-slate-700 hover:text-blue-700 focus:outline-none"
          >
            <span className="material-symbols-outlined text-2xl">{mobileMenuOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 px-4 py-3 bg-white space-y-3 w-full animate-fadeIn">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm linh kiện máy tính..."
              className="w-full pl-4 pr-10 py-2 border border-slate-300 rounded-full text-xs bg-slate-50 outline-none"
            />
            <button type="submit" aria-label="Tìm kiếm" className="absolute right-3 top-2.5 text-slate-400">
              <span className="material-symbols-outlined text-base">search</span>
            </button>
          </form>

          <div className="grid grid-cols-1 gap-1 text-xs font-semibold pt-1">
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="p-2.5 rounded-lg hover:bg-slate-100 flex items-center gap-2 text-slate-800">
              <span className="material-symbols-outlined text-lg text-blue-600">home</span> Trang chủ
            </Link>
            <Link to="/products" onClick={() => setMobileMenuOpen(false)} className="p-2.5 rounded-lg hover:bg-slate-100 flex items-center gap-2 text-slate-800">
              <span className="material-symbols-outlined text-lg text-blue-600">grid_view</span> Sản phẩm
            </Link>

            {currentUser ? (
              <>
                <Link to="/account/profile" onClick={() => setMobileMenuOpen(false)} className="p-2.5 rounded-lg hover:bg-slate-100 flex items-center gap-2 text-slate-800">
                  <span className="material-symbols-outlined text-lg text-blue-600">person</span> Hồ sơ cá nhân ({currentUser.name})
                </Link>
                <Link to="/account/orders" onClick={() => setMobileMenuOpen(false)} className="p-2.5 rounded-lg hover:bg-slate-100 flex items-center gap-2 text-slate-800">
                  <span className="material-symbols-outlined text-lg text-blue-600">receipt_long</span> Đơn hàng của tôi
                </Link>
                {currentUser.role === 'Admin' && (
                  <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="p-2.5 rounded-lg bg-purple-50 text-purple-700 flex items-center gap-2 font-bold">
                    <span className="material-symbols-outlined text-lg">admin_panel_settings</span> Trang Quản Trị Admin
                  </Link>
                )}
                <button
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="w-full text-left p-2.5 rounded-lg hover:bg-red-50 flex items-center gap-2 text-red-600 font-bold"
                >
                  <span className="material-symbols-outlined text-lg">logout</span> Đăng xuất
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 bg-slate-100 text-slate-800 rounded-lg font-bold"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 bg-blue-600 text-white rounded-lg font-bold"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
