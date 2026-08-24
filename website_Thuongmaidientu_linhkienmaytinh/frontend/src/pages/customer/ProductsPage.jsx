import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import ProductCard from '../../components/common/ProductCard';
import EmptyState from '../../components/common/EmptyState';

export default function ProductsPage() {
  const { products, categories } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialCat = searchParams.get('category') || 'All';
  const initialSearch = searchParams.get('search') || '';

  const [selectedCat, setSelectedCat] = useState(initialCat);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [sortBy, setSortBy] = useState('default');
  const [maxPrice, setMaxPrice] = useState(50000000);

  useEffect(() => {
    const cat = searchParams.get('category') || 'All';
    const q = searchParams.get('search') || '';
    setSelectedCat(cat);
    setSearchQuery(q);
  }, [searchParams]);

  const filteredProducts = products
    .filter((p) => {
      const matchCat = selectedCat === 'All' || p.category === selectedCat;
      const matchQuery =
        !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.code.toLowerCase().includes(searchQuery.toLowerCase());
      const matchPrice = p.price <= maxPrice;
      return matchCat && matchQuery && matchPrice;
    })
    .sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      return 0;
    });

  const handleCatChange = (catId) => {
    setSelectedCat(catId);
    setSearchParams((prev) => {
      if (catId === 'All') prev.delete('category');
      else prev.set('category', catId);
      return prev;
    });
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Danh Sách Linh Kiện Máy Tính</h2>
          <p className="text-xs text-slate-500">
            Hiển thị {filteredProducts.length} sản phẩm phù hợp
          </p>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-600">Sắp xếp theo:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="p-2 border border-slate-300 rounded-lg text-xs bg-white font-medium outline-none focus:border-blue-600"
          >
            <option value="default">Mặc định</option>
            <option value="price-low">Giá tăng dần</option>
            <option value="price-high">Giá giảm dần</option>
            <option value="rating">Đánh giá cao nhất</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filter Sidebar */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm h-fit space-y-6">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-3">
            <span className="material-symbols-outlined text-blue-600 text-lg">filter_alt</span>
            <span>Bộ Lọc Tìm Kiếm</span>
          </h3>

          {/* Category Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-slate-400">Danh mục</label>
            <div className="space-y-1">
              <button
                onClick={() => handleCatChange('All')}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold flex justify-between items-center transition-colors ${
                  selectedCat === 'All' ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>Tất cả danh mục</span>
                <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">{products.length}</span>
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCatChange(cat.id)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold flex justify-between items-center transition-colors ${
                    selectedCat === cat.id ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{cat.label.split('-')[0]}</span>
                  <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                    {products.filter((p) => p.category === cat.id).length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Price Filter */}
          <div className="space-y-2 pt-2 border-t border-slate-200">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="uppercase text-slate-400">Mức giá tối đa</span>
              <span className="text-blue-700">{maxPrice.toLocaleString('vi-VN')}₫</span>
            </div>
            <input
              type="range"
              min="1000000"
              max="50000000"
              step="1000000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
          </div>
        </div>

        {/* Product Grid Area */}
        <div className="lg:col-span-3">
          {filteredProducts.length === 0 ? (
            <EmptyState
              icon="search_off"
              title="Không tìm thấy linh kiện phù hợp"
              message="Vui lòng thử điều chỉnh lại bộ lọc tìm kiếm hoặc từ khóa."
              actionText="Xóa bộ lọc"
              actionLink="/products"
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
