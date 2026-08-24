import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import ProductCard from '../../components/common/ProductCard';

export default function HomePage() {
  const { products, categories } = useApp();
  const [selectedCat, setSelectedCat] = useState('All');
  const navigate = useNavigate();

  const filtered = selectedCat === 'All'
    ? products
    : products.filter(p => p.category === selectedCat);

  return (
    <div className="space-y-10">
      {/* Category Icons Row */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
        <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-4">Danh Mục Linh Kiện Nổi Bật</h3>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
          <button
            onClick={() => setSelectedCat('All')}
            className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${
              selectedCat === 'All'
                ? 'bg-blue-600 text-white font-bold shadow-md'
                : 'bg-slate-50 text-slate-700 hover:bg-blue-50 hover:text-blue-700'
            }`}
          >
            <span className="material-symbols-outlined text-2xl">apps</span>
            <span className="text-xs">Tất cả</span>
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(cat.id)}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${
                selectedCat === cat.id
                  ? 'bg-blue-600 text-white font-bold shadow-md'
                  : 'bg-slate-50 text-slate-700 hover:bg-blue-50 hover:text-blue-700'
              }`}
            >
              <span className="material-symbols-outlined text-2xl">{cat.icon}</span>
              <span className="text-xs truncate w-full text-center">{cat.id}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Hero Banner */}
      <div className="rounded-3xl overflow-hidden relative shadow-lg bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 text-white p-8 md:p-12 flex items-center min-h-[360px]">
        <div className="max-w-xl space-y-4 z-10">
          <span className="bg-orange-500 text-white text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
            Siêu Ưu Đãi Mùa Hè 2026
          </span>
          <h2 className="text-3xl md:text-5xl font-black leading-tight">
            XÂY DỰNG RIG PC <br />
            <span className="text-blue-400">ĐỈNH CAO CÔNG NGHỆ</span>
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Sở hữu các dòng Card màn hình RTX 4090, Vi xử lý Intel Core i9-14900K chính hãng với mức giá hấp dẫn nhất.
          </p>
          <div className="flex gap-4 pt-2">
            <Link
              to="/products"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg hover:shadow-blue-500/25 flex items-center gap-2"
            >
              <span>Xem Ngay Sản Phẩm</span>
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </Link>
          </div>
        </div>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:block w-1/2 h-full opacity-80 pointer-events-none">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAn0mN73KRAsGpUlS9EV0MGCzGHaRZ7U4aLrOrnEX9l5H8RnRzhiPbVGbOVyZXivWQDWkjxRy1UZVWVt-RMsnvU7em-caWfHtmxh2eaymVynsW6oGdM8lJEQMzdZpP4t26u5H28jj1qWqeznhWwE3V-lLe3hXTHrAZspvidOIXHPUiayu84oNCoo8UH_bA8GUHmeuX6tmY2JEdsVt5GW3yZSz_2cn4Gn8MZCnfYWn_RkJd-SA3w7odU_A"
            alt="Hero RTX 4090"
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      {/* Featured Products Grid */}
      <div className="space-y-6">
        <div className="flex justify-between items-end border-b border-slate-200 pb-3">
          <div>
            <h3 className="text-2xl font-bold text-slate-900">Sản Phẩm Linh Kiện Hot</h3>
            <p className="text-xs text-slate-500">Các linh kiện PC chất lượng cao được ưa chuộng nhất</p>
          </div>
          <Link to="/products" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
            <span>Xem tất cả ({products.length})</span>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>

      {/* Trust Badges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-200">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-3xl">verified</span>
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900">100% Chính Hãng</h4>
            <p className="text-xs text-slate-500">Cam kết nguồn gốc xuất xứ rõ ràng</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-3xl">local_shipping</span>
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900">Giao Hàng Nhanh 2h</h4>
            <p className="text-xs text-slate-500">Miễn phí vận chuyển nội thành</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-3xl">support_agent</span>
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900">Bảo Hành Tận Nơi</h4>
            <p className="text-xs text-slate-500">Đội ngũ kỹ thuật hỗ trợ 24/7</p>
          </div>
        </div>
      </div>
    </div>
  );
}
