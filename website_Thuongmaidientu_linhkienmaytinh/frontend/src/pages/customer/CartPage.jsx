import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import EmptyState from '../../components/common/EmptyState';

export default function CartPage() {
  const { cart, updateCartQty, removeFromCart, clearCart, showToast } = useApp();
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const navigate = useNavigate();

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const applyPromo = (e) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === 'TECHHUB10') {
      const discAmount = subtotal * 0.1;
      setDiscount(discAmount);
      showToast('Đã áp dụng thành công mã giảm giá 10%!', 'success');
    } else {
      showToast('Mã giảm giá không hợp lệ. Gợi ý sử dụng mã: TECHHUB10', 'error');
    }
  };

  const grandTotal = Math.max(0, subtotal - discount);

  if (cart.length === 0) {
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
        <button
          onClick={clearCart}
          className="text-xs text-red-600 hover:underline flex items-center gap-1 font-semibold"
        >
          <span className="material-symbols-outlined text-sm">delete_sweep</span>
          <span>Xóa toàn bộ giỏ hàng</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Item Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm divide-y divide-slate-200 space-y-4">
          {cart.map((item) => (
            <div key={item.id} className="pt-4 first:pt-0 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1">
                <img
                  src={item.img}
                  alt={item.name}
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=500&auto=format&fit=crop&q=80'; }}
                  className="w-16 h-16 object-contain bg-slate-50 p-2 rounded-xl border border-slate-100"
                />
                <div>
                  <h4 className="font-bold text-sm text-slate-900 line-clamp-1">{item.name}</h4>
                  <p className="text-xs text-slate-500 font-mono">Mã: {item.code}</p>
                  <p className="text-xs font-bold text-blue-700">{item.price.toLocaleString('vi-VN')}₫</p>
                </div>
              </div>

              <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                {/* Quantity Controls */}
                <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => updateCartQty(item.id, -1)}
                    className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 font-bold text-xs"
                  >
                    -
                  </button>
                  <span className="px-3 text-xs font-bold">{item.qty}</span>
                  <button
                    onClick={() => updateCartQty(item.id, 1)}
                    className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 font-bold text-xs"
                  >
                    +
                  </button>
                </div>

                <div className="font-extrabold text-red-600 text-sm w-28 text-right">
                  {(item.price * item.qty).toLocaleString('vi-VN')}₫
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

          {/* Promo code */}
          <form onSubmit={applyPromo} className="flex gap-2">
            <input
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              placeholder="Nhập mã TECHHUB10"
              className="flex-1 p-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-600"
            />
            <button type="submit" className="bg-slate-800 text-white text-xs px-3 rounded-lg font-bold hover:bg-slate-900">
              Áp dụng
            </button>
          </form>

          <div className="space-y-2 text-xs divide-y divide-slate-100">
            <div className="flex justify-between py-1.5 text-slate-600">
              <span>Tạm tính ({cart.length} sản phẩm)</span>
              <span>{subtotal.toLocaleString('vi-VN')}₫</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between py-1.5 text-emerald-600 font-bold">
                <span>Giảm giá (10%)</span>
                <span>-{discount.toLocaleString('vi-VN')}₫</span>
              </div>
            )}
            <div className="flex justify-between py-1.5 text-slate-600">
              <span>Phí vận chuyển</span>
              <span className="text-emerald-600 font-bold">Miễn phí</span>
            </div>
            <div className="flex justify-between pt-3 text-base font-black text-slate-900">
              <span>Tổng thanh toán</span>
              <span className="text-red-600">{grandTotal.toLocaleString('vi-VN')}₫</span>
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
