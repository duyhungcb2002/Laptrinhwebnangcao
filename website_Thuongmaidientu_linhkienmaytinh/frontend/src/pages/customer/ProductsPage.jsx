import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { catalogApi } from '../../api/catalogApi';
import ProductCard from '../../components/common/ProductCard';
import EmptyState from '../../components/common/EmptyState';

export default function ProductsPage() {
  const { categories } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination state derived directly from URL
  const page = Number(searchParams.get('page')) || 1;
  const pageSize = 12;
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Filter & Sort state derived directly from URL searchParams
  const search = searchParams.get('search') || '';
  const categoryId = searchParams.get('categoryId') || '';
  const categoryCode = searchParams.get('categoryCode') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const sortBy = searchParams.get('sortBy') || 'newest';

  // Form input states for user typing
  const [searchInput, setSearchInput] = useState(search);
  const [minPriceInput, setMinPriceInput] = useState(minPrice);
  const [maxPriceInput, setMaxPriceInput] = useState(maxPrice);

  // Synchronize form inputs when URL searchParams change (e.g. Browser Back / Forward)
  useEffect(() => {
    setSearchInput(search);
    setMinPriceInput(minPrice);
    setMaxPriceInput(maxPrice);
  }, [search, minPrice, maxPrice]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        pageSize,
        sortBy,
      };

      if (search) params.search = search;
      if (categoryId) params.categoryId = categoryId;
      if (categoryCode) params.categoryCode = categoryCode;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;

      const res = await catalogApi.getPublicProducts(params);
      setProducts(res.items || []);
      setTotalItems(res.totalItems || 0);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      console.error('Lỗi tải danh sách sản phẩm:', err);
      setError(err?.response?.data?.detail || 'Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, sortBy, search, categoryId, categoryCode, minPrice, maxPrice]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Update URL search parameters helper
  const updateUrlParams = (newParams) => {
    setSearchParams((prev) => {
      const updated = new URLSearchParams(prev);
      Object.entries(newParams).forEach(([key, value]) => {
        if (value === null || value === undefined || value === '') {
          updated.delete(key);
        } else {
          updated.set(key, value);
        }
      });
      return updated;
    });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateUrlParams({ search: searchInput, page: 1 });
  };

  const handleCategorySelect = (catId) => {
    updateUrlParams({ categoryId: catId, categoryCode: '', page: 1 });
  };

  const handlePriceApply = (e) => {
    e.preventDefault();
    updateUrlParams({ minPrice: minPriceInput, maxPrice: maxPriceInput, page: 1 });
  };

  const handleSortChange = (e) => {
    const val = e.target.value;
    updateUrlParams({ sortBy: val, page: 1 });
  };

  const handleClearFilters = () => {
    setSearchInput('');
    setMinPriceInput('');
    setMaxPriceInput('');
    setSearchParams({});
  };

  return (
    <div className="space-y-6">
      {/* Title & Search Bar Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Danh Sách Linh Kiện Máy Tính</h2>
          <p className="text-xs text-slate-500">
            {loading ? 'Đang tải sản phẩm...' : `Hiển thị ${products.length} trên tổng số ${totalItems} sản phẩm`}
          </p>
        </div>

        {/* Search & Sort Controls */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <form onSubmit={handleSearchSubmit} className="flex gap-2 flex-1 md:flex-initial">
            <input
              type="text"
              placeholder="Tìm theo tên, mã SKU..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-600 w-full md:w-56"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-3 py-2 rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors"
            >
              Tìm
            </button>
          </form>

          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-600 whitespace-nowrap">Sắp xếp:</label>
            <select
              value={sortBy}
              onChange={handleSortChange}
              className="p-2 border border-slate-300 rounded-lg text-xs bg-white font-medium outline-none focus:border-blue-600"
            >
              <option value="newest">Mới nhất</option>
              <option value="priceAsc">Giá tăng dần</option>
              <option value="priceDesc">Giá giảm dần</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filter Sidebar */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm h-fit space-y-6">
          <div className="flex justify-between items-center border-b border-slate-200 pb-3">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600 text-lg">filter_alt</span>
              <span>Bộ Lọc Tìm Kiếm</span>
            </h3>
            {(search || categoryId || categoryCode || minPrice || maxPrice) && (
              <button
                onClick={handleClearFilters}
                className="text-[11px] font-bold text-red-600 hover:underline"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-slate-400">Danh mục</label>
            <div className="space-y-1">
              <button
                onClick={() => handleCategorySelect('')}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold flex justify-between items-center transition-colors ${
                  !categoryId && !categoryCode ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>Tất cả danh mục</span>
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.id)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold flex justify-between items-center transition-colors ${
                    categoryId === cat.id ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono">
                    {cat.code}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter Form */}
          <form onSubmit={handlePriceApply} className="space-y-3 pt-3 border-t border-slate-200">
            <label className="text-xs font-bold uppercase text-slate-400">Khoảng giá (VNĐ)</label>
            <div className="flex gap-2 items-center">
              <input
                type="number"
                placeholder="Từ"
                value={minPriceInput}
                onChange={(e) => setMinPriceInput(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded text-xs outline-none focus:border-blue-600"
              />
              <span className="text-slate-400">-</span>
              <input
                type="number"
                placeholder="Đến"
                value={maxPriceInput}
                onChange={(e) => setMaxPriceInput(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded text-xs outline-none focus:border-blue-600"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-slate-800 hover:bg-slate-900 text-white py-1.5 rounded text-xs font-bold transition-colors"
            >
              Áp dụng giá
            </button>
          </form>
        </div>

        {/* Product Grid Area */}
        <div className="lg:col-span-3 space-y-6">
          {loading ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-slate-500 text-sm font-medium">Đang tải sản phẩm từ hệ thống...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 p-6 rounded-2xl border border-red-200 text-red-700 text-center">
              <span className="material-symbols-outlined text-4xl mb-2">error</span>
              <p className="font-semibold text-sm">{error}</p>
              <button
                onClick={fetchProducts}
                className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-red-700"
              >
                Thử lại
              </button>
            </div>
          ) : products.length === 0 ? (
            <EmptyState
              icon="search_off"
              title="Không tìm thấy sản phẩm nào"
              message="Vui lòng thử điều chỉnh lại bộ lọc tìm kiếm hoặc từ khóa."
              actionText="Xóa bộ lọc"
              onAction={handleClearFilters}
            />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>

              {/* Server-side Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 pt-6">
                  <button
                    disabled={page <= 1}
                    onClick={() => updateUrlParams({ page: page - 1 })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                      page <= 1
                        ? 'border-slate-200 text-slate-400 cursor-not-allowed'
                        : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Trước
                  </button>

                  <span className="text-xs font-semibold text-slate-600 px-3">
                    Trang {page} / {totalPages}
                  </span>

                  <button
                    disabled={page >= totalPages}
                    onClick={() => updateUrlParams({ page: page + 1 })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                      page >= totalPages
                        ? 'border-slate-200 text-slate-400 cursor-not-allowed'
                        : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Sau
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
