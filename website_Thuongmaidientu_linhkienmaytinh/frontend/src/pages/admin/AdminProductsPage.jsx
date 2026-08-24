import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export default function AdminProductsPage() {
  const { products, categories, saveProduct, deleteProduct } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const filteredProducts = products.filter(p => {
    const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleOpenModal = (product = null) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      id: editingProduct ? editingProduct.id : undefined,
      code: formData.get('code'),
      name: formData.get('name'),
      category: formData.get('category'),
      price: Number(formData.get('price')),
      oldPrice: Number(formData.get('oldPrice')) || undefined,
      stock: Number(formData.get('stock')),
      description: formData.get('description'),
      img: formData.get('img') || (editingProduct ? editingProduct.img : undefined)
    };

    saveProduct(data);
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Quản Lý Sản Phẩm Linh Kiện</h2>
          <p className="text-xs text-slate-500">Thêm, sửa, xóa thông tin danh mục linh kiện máy tính</p>
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
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên hoặc mã SP..."
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-xl text-xs outline-none focus:border-blue-600"
          />
          <span className="material-symbols-outlined absolute left-2.5 top-2 text-slate-400 text-base">search</span>
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="p-2 border border-slate-300 rounded-xl text-xs bg-white font-semibold outline-none"
        >
          <option value="All">Tất cả danh mục</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.id}</option>
          ))}
        </select>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 uppercase text-slate-600 font-semibold border-b">
              <tr>
                <th className="p-4">Hình ảnh</th>
                <th className="p-4">Mã SP</th>
                <th className="p-4">Tên Sản Phẩm</th>
                <th className="p-4">Danh Mục</th>
                <th className="p-4">Giá Bán</th>
                <th className="p-4">Tồn Kho</th>
                <th className="p-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <img src={p.img} alt={p.name} className="w-12 h-12 object-contain bg-slate-50 rounded-lg p-1 border border-slate-100" />
                  </td>
                  <td className="p-4 font-mono font-bold text-blue-700">{p.code}</td>
                  <td className="p-4 font-semibold text-slate-900 max-w-xs truncate">{p.name}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 bg-blue-50 text-blue-700 font-bold rounded text-[10px] uppercase">
                      {p.category}
                    </span>
                  </td>
                  <td className="p-4 font-extrabold text-red-600">{p.price.toLocaleString('vi-VN')}₫</td>
                  <td className="p-4 font-bold">
                    <span className={p.stock <= 10 ? 'text-amber-600' : 'text-slate-700'}>
                      {p.stock} cái
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => handleOpenModal(p)}
                      className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-600 hover:text-blue-700"
                    >
                      <span className="material-symbols-outlined text-lg">edit</span>
                    </button>
                    <button
                      onClick={() => deleteProduct(p.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-slate-600 hover:text-red-600"
                    >
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="text-lg font-bold">{editingProduct ? 'Chỉnh Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}</h3>
              <button onClick={() => setIsModalOpen(false)}>
                <span className="material-symbols-outlined text-slate-400 hover:text-slate-700">close</span>
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mã Sản Phẩm *</label>
                  <input name="code" defaultValue={editingProduct?.code} className="w-full p-2.5 border rounded-lg" required />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Danh Mục *</label>
                  <select name="category" defaultValue={editingProduct?.category || 'CPU'} className="w-full p-2.5 border rounded-lg bg-white">
                    {categories.map(c => <option key={c.id} value={c.id}>{c.id}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên Sản Phẩm *</label>
                <input name="name" defaultValue={editingProduct?.name} className="w-full p-2.5 border rounded-lg" required />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Giá Bán (VNĐ) *</label>
                  <input name="price" type="number" defaultValue={editingProduct?.price} className="w-full p-2.5 border rounded-lg" required />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Giá Cũ (Gốc)</label>
                  <input name="oldPrice" type="number" defaultValue={editingProduct?.oldPrice} className="w-full p-2.5 border rounded-lg" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Số Lượng Tồn Kho *</label>
                  <input name="stock" type="number" defaultValue={editingProduct?.stock} className="w-full p-2.5 border rounded-lg" required />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Link Ảnh Sản Phẩm (URL)</label>
                <input name="img" defaultValue={editingProduct?.img} placeholder="https://..." className="w-full p-2.5 border rounded-lg" />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mô Tả Sản Phẩm</label>
                <textarea name="description" rows="3" defaultValue={editingProduct?.description} className="w-full p-2.5 border rounded-lg"></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-lg">Hủy</button>
                <button type="submit" className="px-5 py-2 bg-blue-600 text-white font-bold rounded-lg">Lưu Thông Tin</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
