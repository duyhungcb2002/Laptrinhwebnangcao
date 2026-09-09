import React, { useState, useEffect, useCallback } from 'react';
import { catalogApi } from '../../api/catalogApi';
import { useApp } from '../../context/AppContext';
import { getProductImageUrl } from '../../components/common/ProductCard';

export default function AdminProductsPage() {
  const { categories, showToast, confirmAction, refreshProducts } = useApp();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Image Upload State inside modal
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [productImages, setProductImages] = useState([]);

  const fetchAdminProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        pageSize,
        search: searchQuery || undefined,
        categoryId: selectedCategory || undefined,
      };

      const res = await catalogApi.getAdminProducts(params);
      setProducts(res.items || []);
      setTotalItems(res.totalItems || 0);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      console.error('Lỗi tải danh sách sản phẩm admin:', err);
      setError(err?.response?.data?.detail || 'Không thể tải danh sách sản phẩm.');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, searchQuery, selectedCategory]);

  useEffect(() => {
    fetchAdminProducts();
  }, [fetchAdminProducts]);

  const handleOpenModal = async (product = null) => {
    setEditingProduct(product);
    setSubmitError(null);
    setSelectedFile(null);
    setProductImages([]);

    if (product?.id) {
      try {
        const detail = await catalogApi.getAdminProductById(product.id);
        setProductImages(detail.productImages || []);
      } catch (err) {
        console.error('Lỗi tải chi tiết sản phẩm admin:', err);
      }
    }

    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitting(true);

    const formData = new FormData(e.target);
    const data = {
      code: formData.get('code')?.trim(),
      name: formData.get('name')?.trim(),
      categoryId: formData.get('categoryId'),
      price: Number(formData.get('price')),
      oldPrice: formData.get('oldPrice') ? Number(formData.get('oldPrice')) : null,
      imageUrl: formData.get('imageUrl')?.trim() || null,
      description: formData.get('description')?.trim(),
      isActive: formData.get('isActive') === 'true',
    };

    if (!editingProduct) {
      data.stockQuantity = Number(formData.get('stockQuantity'));
    }

    try {
      let savedProd;
      if (editingProduct) {
        savedProd = await catalogApi.updateAdminProduct(editingProduct.id, data);
        showToast('Cập nhật sản phẩm thành công!', 'success');
      } else {
        savedProd = await catalogApi.createAdminProduct(data);
        showToast('Thêm mới sản phẩm thành công!', 'success');
      }

      // If a file was selected during creation/update, upload it now
      if (selectedFile && savedProd?.id) {
        try {
          await catalogApi.uploadAdminProductImage(savedProd.id, selectedFile);
          showToast('Tải lên ảnh sản phẩm thành công!', 'success');
        } catch (imgErr) {
          console.error('Lỗi upload ảnh:', imgErr);
          showToast(imgErr?.response?.data?.detail || 'Lỗi khi upload ảnh sản phẩm.', 'error');
        }
      }

      setIsModalOpen(false);
      fetchAdminProducts();
      refreshProducts();
    } catch (err) {
      console.error('Lỗi lưu sản phẩm:', err);
      const detail = err?.response?.data?.detail || 'Lưu thông tin sản phẩm thất bại. Vui lòng kiểm tra lại.';
      setSubmitError(detail);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = (p) => {
    confirmAction(`Bạn có chắc chắn muốn ẩn/xóa mềm sản phẩm '${p.name}'?`, async () => {
      try {
        await catalogApi.deleteAdminProduct(p.id);
        showToast(`Đã ẩn sản phẩm '${p.name}' thành công!`, 'info');
        fetchAdminProducts();
        refreshProducts();
      } catch (err) {
        console.error('Lỗi xóa sản phẩm:', err);
        showToast(err?.response?.data?.detail || 'Xóa sản phẩm thất bại.', 'error');
      }
    });
  };

  const handleRestoreProduct = async (p) => {
    try {
      await catalogApi.restoreAdminProduct(p.id);
      showToast(`Đã khôi phục sản phẩm '${p.name}'!`, 'success');
      fetchAdminProducts();
      refreshProducts();
    } catch (err) {
      console.error('Lỗi khôi phục sản phẩm:', err);
      showToast(err?.response?.data?.detail || 'Khôi phục sản phẩm thất bại.', 'error');
    }
  };

  const handleUploadImageOnly = async () => {
    if (!editingProduct?.id || !selectedFile) return;
    setUploadingImage(true);
    try {
      const newImg = await catalogApi.uploadAdminProductImage(editingProduct.id, selectedFile);
      setProductImages((prev) => [...prev, newImg]);
      setSelectedFile(null);
      showToast('Tải ảnh mới lên thành công!', 'success');
      fetchAdminProducts();
      refreshProducts();
    } catch (err) {
      console.error('Lỗi upload ảnh:', err);
      showToast(err?.response?.data?.detail || 'Lỗi khi upload ảnh sản phẩm.', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (!editingProduct?.id) return;
    try {
      await catalogApi.deleteAdminProductImage(editingProduct.id, imageId);
      setProductImages((prev) => prev.filter((i) => i.id !== imageId));
      showToast('Đã xóa ảnh sản phẩm', 'info');
      fetchAdminProducts();
      refreshProducts();
    } catch (err) {
      console.error('Lỗi xóa ảnh:', err);
      showToast('Xóa ảnh thất bại.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Quản Lý Sản Phẩm Linh Kiện</h2>
          <p className="text-xs text-slate-500">Quản lý kho hàng, tạo, sửa, ẩn/xóa mềm và khôi phục sản phẩm</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-md transition-all"
        >
          <span className="material-symbols-outlined text-base">add</span>
          <span>Thêm Sản Phẩm Mới</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Tìm theo tên hoặc mã SKU..."
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-xl text-xs outline-none focus:border-blue-600"
          />
          <span className="material-symbols-outlined absolute left-2.5 top-2 text-slate-400 text-base">search</span>
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setPage(1);
          }}
          className="p-2 border border-slate-300 rounded-xl text-xs bg-white font-semibold outline-none"
        >
          <option value="">Tất cả danh mục</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.code})
            </option>
          ))}
        </select>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-slate-500 text-xs font-medium">Đang tải sản phẩm...</p>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-600 text-xs">
            <p>{error}</p>
            <button onClick={fetchAdminProducts} className="mt-2 text-blue-600 underline font-bold">
              Thử lại
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">inventory_2</span>
            <p>Không tìm thấy sản phẩm nào.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 uppercase text-slate-600 font-semibold border-b">
                <tr>
                  <th className="p-4">Hình ảnh</th>
                  <th className="p-4">Mã SKU</th>
                  <th className="p-4">Tên Sản Phẩm</th>
                  <th className="p-4">Danh Mục</th>
                  <th className="p-4">Giá Bán</th>
                  <th className="p-4">Tồn Kho</th>
                  <th className="p-4">Trạng Thái</th>
                  <th className="p-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => {
                  const img = getProductImageUrl(p.imageUrl);
                  return (
                    <tr key={p.id} className={`hover:bg-slate-50 transition-colors ${!p.isActive ? 'bg-slate-50/80' : ''}`}>
                      <td className="p-4">
                        <img src={img} alt={p.name} className="w-12 h-12 object-contain bg-slate-50 rounded-lg p-1 border border-slate-100" />
                      </td>
                      <td className="p-4 font-mono font-bold text-blue-700">{p.code}</td>
                      <td className="p-4 font-semibold text-slate-900 max-w-xs truncate">{p.name}</td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 bg-blue-50 text-blue-700 font-bold rounded text-[10px] uppercase">
                          {p.categoryName || p.categoryCode}
                        </span>
                      </td>
                      <td className="p-4 font-extrabold text-red-600">{p.price?.toLocaleString('vi-VN')}₫</td>
                      <td className="p-4 font-bold">
                        <span className={p.stockQuantity <= 0 ? 'text-red-600 font-bold' : p.stockQuantity <= 10 ? 'text-amber-600' : 'text-slate-700'}>
                          {p.stockQuantity <= 0 ? 'Hết hàng (0)' : `${p.stockQuantity} cái`}
                        </span>
                      </td>
                      <td className="p-4">
                        {p.isActive ? (
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full border border-emerald-200">
                            Hoạt động
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-red-50 text-red-600 text-[10px] font-bold rounded-full border border-red-200">
                            Đã ẩn
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right space-x-1">
                        <button
                          onClick={() => handleOpenModal(p)}
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-600 hover:text-blue-700"
                          title="Sửa"
                        >
                          <span className="material-symbols-outlined text-lg">edit</span>
                        </button>

                        {p.isActive ? (
                          <button
                            onClick={() => handleDeleteProduct(p)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-slate-600 hover:text-red-600"
                            title="Ẩn/Xóa mềm"
                          >
                            <span className="material-symbols-outlined text-lg">visibility_off</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRestoreProduct(p)}
                            className="p-1.5 rounded-lg hover:bg-emerald-50 text-slate-600 hover:text-emerald-700"
                            title="Hiện lại sản phẩm"
                          >
                            <span className="material-symbols-outlined text-lg">restore_from_trash</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center p-4 border-t border-slate-100 text-xs">
            <span className="text-slate-500">
              Trang {page} / {totalPages} (Tổng {totalItems} sản phẩm)
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1 border rounded disabled:opacity-40"
              >
                Trước
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1 border rounded disabled:opacity-40"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="text-lg font-bold">{editingProduct ? 'Chỉnh Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}</h3>
              <button onClick={() => setIsModalOpen(false)}>
                <span className="material-symbols-outlined text-slate-400 hover:text-slate-700">close</span>
              </button>
            </div>

            {submitError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                {submitError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mã SKU *</label>
                  <input
                    name="code"
                    defaultValue={editingProduct?.code}
                    placeholder="CPU-INTEL-I7"
                    className="w-full p-2.5 border rounded-lg font-mono outline-none focus:border-blue-600"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Danh Mục *</label>
                  <select
                    name="categoryId"
                    defaultValue={editingProduct?.categoryId || categories[0]?.id}
                    className="w-full p-2.5 border rounded-lg bg-white outline-none focus:border-blue-600"
                    required
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên Sản Phẩm *</label>
                <input
                  name="name"
                  defaultValue={editingProduct?.name}
                  placeholder="Ví dụ: Intel Core i7-13700K"
                  className="w-full p-2.5 border rounded-lg outline-none focus:border-blue-600"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Giá Bán (VNĐ) *</label>
                  <input
                    name="price"
                    type="number"
                    min="1"
                    defaultValue={editingProduct?.price}
                    className="w-full p-2.5 border rounded-lg outline-none focus:border-blue-600"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Giá Cũ (Gốc)</label>
                  <input
                    name="oldPrice"
                    type="number"
                    min="0"
                    defaultValue={editingProduct?.oldPrice}
                    className="w-full p-2.5 border rounded-lg outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tồn Kho *</label>
                  <input
                    name="stockQuantity"
                    type="number"
                    min="0"
                    defaultValue={editingProduct?.stockQuantity ?? editingProduct?.stock ?? 0}
                    disabled={!!editingProduct}
                    className={`w-full p-2.5 border rounded-lg outline-none ${
                      editingProduct ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'focus:border-blue-600'
                    }`}
                    required
                  />
                  {editingProduct && (
                    <p className="text-[10px] text-amber-600 mt-0.5">Dùng trang Quản lý Kho để thay đổi tồn.</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">URL Ảnh Sản Phẩm (Tuỳ chọn)</label>
                <input
                  name="imageUrl"
                  defaultValue={editingProduct?.imageUrl}
                  placeholder="https://... hoặc /uploads/..."
                  className="w-full p-2.5 border rounded-lg outline-none focus:border-blue-600"
                />
              </div>

              {/* Upload Image Section */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <label className="block font-bold text-slate-700">Tải Ảnh Từ Máy Tính (Chấp nhận JPG, PNG, WEBP &lt; 5MB)</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp"
                    onChange={(e) => setSelectedFile(e.target.files[0] || null)}
                    className="text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {editingProduct && selectedFile && (
                    <button
                      type="button"
                      onClick={handleUploadImageOnly}
                      disabled={uploadingImage}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap disabled:opacity-50"
                    >
                      {uploadingImage ? 'Đang tải...' : 'Upload Ngay'}
                    </button>
                  )}
                </div>

                {/* List of uploaded product images if editing */}
                {productImages.length > 0 && (
                  <div className="space-y-1 pt-2">
                    <span className="text-[11px] font-bold text-slate-500">Danh sách ảnh thực tế ({productImages.length}):</span>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {productImages.map((img) => (
                        <div key={img.id} className="relative w-14 h-14 rounded border bg-white p-1 flex-shrink-0 group">
                          <img src={getProductImageUrl(img.url)} alt="Uploaded" className="w-full h-full object-contain" />
                          <button
                            type="button"
                            onClick={() => handleDeleteImage(img.id)}
                            className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Xóa ảnh"
                          >
                            <span className="material-symbols-outlined text-xs">close</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Trạng Thái Sản Phẩm</label>
                <select
                  name="isActive"
                  defaultValue={editingProduct ? String(editingProduct.isActive) : 'true'}
                  className="w-full p-2.5 border rounded-lg bg-white outline-none focus:border-blue-600"
                >
                  <option value="true">Hiển thị (Active)</option>
                  <option value="false">Ẩn sản phẩm (Hidden / Soft Deleted)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mô Tả Sản Phẩm</label>
                <textarea
                  name="description"
                  rows="3"
                  defaultValue={editingProduct?.description}
                  placeholder="Thông số, tính năng sản phẩm..."
                  className="w-full p-2.5 border rounded-lg outline-none focus:border-blue-600"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-lg font-semibold text-slate-600"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg disabled:opacity-50"
                >
                  {submitting ? 'Đang lưu...' : 'Lưu Thông Tin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
