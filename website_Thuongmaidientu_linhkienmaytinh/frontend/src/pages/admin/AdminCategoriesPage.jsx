import React, { useState, useEffect, useCallback } from 'react';
import { catalogApi } from '../../api/catalogApi';
import { useApp } from '../../context/AppContext';

export default function AdminCategoriesPage() {
  const { showToast, confirmAction, refreshCategories } = useApp();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchAdminCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await catalogApi.getAdminCategories();
      setCategories(data || []);
    } catch (err) {
      console.error('Lỗi tải danh mục admin:', err);
      setError(err?.response?.data?.detail || 'Không thể tải danh sách danh mục.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdminCategories();
  }, [fetchAdminCategories]);

  const handleOpenModal = (cat = null) => {
    setEditingCategory(cat);
    setSubmitError(null);
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
      description: formData.get('description')?.trim(),
      isActive: formData.get('isActive') === 'true',
    };

    try {
      if (editingCategory) {
        await catalogApi.updateAdminCategory(editingCategory.id, data);
        showToast('Cập nhật danh mục thành công!', 'success');
      } else {
        await catalogApi.createAdminCategory(data);
        showToast('Tạo mới danh mục thành công!', 'success');
      }
      setIsModalOpen(false);
      fetchAdminCategories();
      refreshCategories();
    } catch (err) {
      console.error('Lỗi lưu danh mục:', err);
      const detail = err?.response?.data?.detail || 'Lưu danh mục thất bại. Vui lòng kiểm tra dữ liệu.';
      setSubmitError(detail);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = (cat) => {
    confirmAction(`Bạn có chắc chắn muốn ẩn/xóa mềm danh mục '${cat.name}'?`, async () => {
      try {
        await catalogApi.deleteAdminCategory(cat.id);
        showToast(`Đã ẩn danh mục '${cat.name}' thành công!`, 'info');
        fetchAdminCategories();
        refreshCategories();
      } catch (err) {
        console.error('Lỗi xóa danh mục:', err);
        showToast(err?.response?.data?.detail || 'Xóa danh mục thất bại.', 'error');
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Quản Lý Danh Mục Linh Kiện</h2>
          <p className="text-xs text-slate-500">Thêm, sửa, ẩn danh mục sản phẩm trên toàn bộ hệ thống</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-md transition-colors"
        >
          <span className="material-symbols-outlined text-base">add</span>
          <span>Thêm Danh Mục</span>
        </button>
      </div>

      {loading ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-slate-500 text-sm font-medium">Đang tải danh sách danh mục...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 p-6 rounded-2xl border border-red-200 text-red-700 text-center">
          <p className="font-semibold text-sm">{error}</p>
          <button
            onClick={fetchAdminCategories}
            className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-red-700"
          >
            Thử lại
          </button>
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
          <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">category</span>
          <p className="text-slate-500 text-sm font-medium">Chưa có danh mục nào. Hãy bấm "Thêm Danh Mục".</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((c) => (
            <div
              key={c.id}
              className={`bg-white p-6 rounded-2xl border shadow-sm flex flex-col justify-between space-y-4 ${
                c.isActive ? 'border-slate-200' : 'border-slate-300 bg-slate-50/80 opacity-75'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold font-mono">
                    {c.code}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-slate-900">{c.name}</h3>
                      {!c.isActive && (
                        <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded">
                          Đã ẩn
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-mono text-slate-400">Mã: {c.code}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleOpenModal(c)} className="p-1 hover:text-blue-700 text-slate-500" title="Sửa">
                    <span className="material-symbols-outlined text-lg">edit</span>
                  </button>
                  {c.isActive && (
                    <button onClick={() => handleDeleteCategory(c)} className="p-1 hover:text-red-600 text-slate-500" title="Ẩn/Xóa mềm">
                      <span className="material-symbols-outlined text-lg">visibility_off</span>
                    </button>
                  )}
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">{c.description || 'Chưa có mô tả'}</p>
            </div>
          ))}
        </div>
      )}

      {/* Modal Add / Edit Category */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-base">{editingCategory ? 'Chỉnh Sửa Danh Mục' : 'Thêm Danh Mục Mới'}</h3>
              <button onClick={() => setIsModalOpen(false)}>
                <span className="material-symbols-outlined text-slate-400">close</span>
              </button>
            </div>

            {submitError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                {submitError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Mã Danh Mục (Code) *</label>
                <input
                  name="code"
                  defaultValue={editingCategory?.code}
                  placeholder="Ví dụ: CPU, VGA, RAM..."
                  className="w-full p-2.5 border rounded-lg outline-none focus:border-blue-600 font-mono"
                  required
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên Danh Mục *</label>
                <input
                  name="name"
                  defaultValue={editingCategory?.name}
                  placeholder="Ví dụ: Bo mạch chủ (Mainboard)"
                  className="w-full p-2.5 border rounded-lg outline-none focus:border-blue-600"
                  required
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Mô Tả Danh Mục</label>
                <textarea
                  name="description"
                  rows="3"
                  defaultValue={editingCategory?.description}
                  placeholder="Mô tả chi tiết nhóm linh kiện..."
                  className="w-full p-2.5 border rounded-lg outline-none focus:border-blue-600"
                ></textarea>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Trạng Thái Hiển Thị</label>
                <select
                  name="isActive"
                  defaultValue={editingCategory ? String(editingCategory.isActive) : 'true'}
                  className="w-full p-2.5 border rounded-lg outline-none focus:border-blue-600"
                >
                  <option value="true">Đang hoạt động (Hiển thị public)</option>
                  <option value="false">Ẩn danh mục (Ẩn public)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
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
                  {submitting ? 'Đang lưu...' : 'Lưu Danh Mục'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
