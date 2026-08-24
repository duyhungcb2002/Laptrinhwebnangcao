import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export default function AdminInventoryPage() {
  const { products, saveProduct, showToast } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.code.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleStockUpdate = (product, delta) => {
    const newStock = Math.max(0, product.stock + delta);
    saveProduct({ ...product, stock: newStock });
    showToast(`Đã điều chỉnh tồn kho ${product.code}: ${newStock} cái`, 'info');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Quản Lý Tồn Kho Linh Kiện</h2>
          <p className="text-xs text-slate-500">Theo dõi số lượng hàng hóa tồn kho và nhập xuất kho</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Tìm sản phẩm kiểm kê..."
          className="w-full max-w-md p-2.5 border border-slate-300 rounded-xl text-xs outline-none"
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100 uppercase text-slate-600 font-semibold border-b">
            <tr>
              <th className="p-4">Mã SP</th>
              <th className="p-4">Tên Linh Kiện</th>
              <th className="p-4">Danh Mục</th>
              <th className="p-4">Trạng Thái Kho</th>
              <th className="p-4">Số Lượng Tồn</th>
              <th className="p-4 text-right">Điều Chỉnh Kho</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50">
                <td className="p-4 font-mono font-bold text-blue-700">{p.code}</td>
                <td className="p-4 font-semibold text-slate-900">{p.name}</td>
                <td className="p-4 font-bold">{p.category}</td>
                <td className="p-4">
                  {p.stock === 0 ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-600">Hết hàng</span>
                  ) : p.stock <= 10 ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-600">Sắp hết hàng</span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-600">Đủ hàng</span>
                  )}
                </td>
                <td className="p-4 font-extrabold text-sm text-slate-900">{p.stock} cái</td>
                <td className="p-4 text-right">
                  <div className="inline-flex items-center border border-slate-300 rounded-lg overflow-hidden">
                    <button onClick={() => handleStockUpdate(p, -5)} className="px-2 py-1 bg-slate-100 hover:bg-slate-200 font-bold">-5</button>
                    <button onClick={() => handleStockUpdate(p, -1)} className="px-2 py-1 bg-slate-100 hover:bg-slate-200 font-bold">-1</button>
                    <span className="px-3 font-bold text-blue-700">{p.stock}</span>
                    <button onClick={() => handleStockUpdate(p, 1)} className="px-2 py-1 bg-slate-100 hover:bg-slate-200 font-bold">+1</button>
                    <button onClick={() => handleStockUpdate(p, 5)} className="px-2 py-1 bg-slate-100 hover:bg-slate-200 font-bold">+5</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
