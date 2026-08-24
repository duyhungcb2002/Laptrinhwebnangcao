import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export default function AdminCategoriesPage() {
  const { categories, saveCategory, deleteCategory } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const handleOpenModal = (cat = null) => {
    setEditingCategory(cat);
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      id: formData.get('id').toUpperCase(),
      label: formData.get('label'),
      icon: formData.get('icon') || 'memory',
      description: formData.get('description')
    };

    saveCategory(data);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Quản Lý Danh Mục Linh Kiện</h2>
          <p className="text-xs text-slate-500">Phân loại linh kiện PC (CPU, VGA, RAM, SSD...)</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-md"
        >
          <span className="material-symbols-outlined text-base">add</span>
          <span>Thêm Danh Mục</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((c) => (
          <div key={c.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-2xl">{c.icon}</span>
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">{c.id}</h3>
                  <p className="text-xs text-slate-500">{c.label}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => handleOpenModal(c)} className="p-1 hover:text-blue-700">
                  <span className="material-symbols-outlined text-base">edit</span>
                </button>
                <button onClick={() => deleteCategory(c.id)} className="p-1 hover:text-red-600">
                  <span className="material-symbols-outlined text-base">delete</span>
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">{c.description}</p>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-base">{editingCategory ? 'Chỉnh Sửa Danh Mục' : 'Thêm Danh Mục Mới'}</h3>
              <button onClick={() => setIsModalOpen(false)}>
                <span className="material-symbols-outlined text-slate-400">close</span>
              </button>
            </div>
            <form onSubmit={handleFormSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Mã Danh Mục (ID) *</label>
                <input name="id" defaultValue={editingCategory?.id} placeholder="VGA / CPU / RAM" className="w-full p-2.5 border rounded-lg" required />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên Hiển Thị *</label>
                <input name="label" defaultValue={editingCategory?.label} placeholder="VGA - Card Màn Hình" className="w-full p-2.5 border rounded-lg" required />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Icon Material Symbol</label>
                <input name="icon" defaultValue={editingCategory?.icon} placeholder="videogame_asset / memory" className="w-full p-2.5 border rounded-lg" />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Mô Tả Danh Mục</label>
                <textarea name="description" rows="2" defaultValue={editingCategory?.description} className="w-full p-2.5 border rounded-lg"></textarea>
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-lg">Hủy</button>
                <button type="submit" className="px-5 py-2 bg-blue-600 text-white font-bold rounded-lg">Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
