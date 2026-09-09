import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { getProductImageUrl } from '../../components/common/ProductCard';
import EmptyState from '../../components/common/EmptyState';

export default function CartPage() {
  const { cart, updateCartQty, removeFromCart, isLoadingCart } = useApp();
  const navigate = useNavigate();

  const items = cart.items || [];
  const subtotal = cart.subtotal || 0;

  if (isLoadingCart) {
    return (
      <div className="flex justify-center items-center py-20 text-slate-500">
        <span className="material-symbols-outlined animate-spin text-3xl">sync</span>
        <span className="ml-2 font-medium">Đang tải giỏ hàng...</span>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon="shopping_cart_off"
        title="Giỏ hàng của bạn đang trống"
        message="Hãy khám phá các linh kiện máy tính cao cấp và thêm sản phẩm yêu thích vào giỏ hàng ngay!"
        actionText="Khám phá linh kiện"
        actionLink="/products"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-slate-200 pb-3">
        <h2 className="text-2xl font-bold text-slate-900">Giỏ Hàng Của Bạn</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Item Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm divide-y divide-slate-200 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="pt-4 first:pt-0 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1">
                <img
                  src={getProductImageUrl(item.mainImageUrl)}
                  alt={item.productName}
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=500&auto=format&fit=crop&q=80'; }}
                  className="w-16 h-16 object-contain bg-slate-50 p-2 rounded-xl border border-slate-100"
                />
                <div>
                  <h4 className="font-bold text-sm text-slate-900 line-clamp-1">{item.productName}</h4>
                  <p className="text-xs text-slate-500 font-mono">Mã: {item.productCode}</p>
                  <p className="text-xs text-slate-500">Tồn kho: {item.stockQuantity}</p>
                  <p className="text-xs font-bold text-blue-700">{item.currentPrice.toLocaleString('vi-VN')}₫</p>
                </div>
              </div>

              <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                {/* Quantity Controls */}
                <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => updateCartQty(item.id, item.quantity - 1)}
                    className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 font-bold text-xs"
                  >
                    -
                  </button>
                  <span className="px-3 text-xs font-bold">{item.quantity}</span>
                  <button
                    onClick={() => updateCartQty(item.id, item.quantity + 1)}
                    className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 font-bold text-xs"
                  >
                    +
                  </button>
                </div>

                <div className="font-extrabold text-red-600 text-sm w-28 text-right">
                  {item.lineTotal.toLocaleString('vi-VN')}₫
                </div>

                <button
                  onClick={() => removeFromCart(item.id)}
                  aria-label="Xóa sản phẩm"
                  className="text-slate-400 hover:text-red-600 p-1"
                >
                  <span className="material-symbols-outlined text-lg">delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary & Checkout Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm h-fit space-y-5">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-3">Tóm Tắt Đơn Hàng</h3>

          <div className="space-y-2 text-xs divide-y divide-slate-100">
            <div className="flex justify-between py-1.5 text-slate-600">
              <span>Tạm tính ({cart.totalQuantity} sản phẩm)</span>
              <span>{subtotal.toLocaleString('vi-VN')}₫</span>
            </div>
            <div className="flex justify-between py-1.5 text-slate-600">
              <span>Phí vận chuyển</span>
              <span className="text-emerald-600 font-bold">Miễn phí</span>
            </div>
            <div className="flex justify-between pt-3 text-base font-black text-slate-900">
              <span>Tổng thanh toán</span>
              <span className="text-red-600">{subtotal.toLocaleString('vi-VN')}₫</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-md hover:shadow-blue-500/25 transition-all text-sm flex items-center justify-center gap-2"
          >
            <span>Tiến Hành Thanh Toán</span>
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
}
