import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { ordersApi } from '../../api/orderCartApi';
import { getProductImageUrl } from '../../components/common/ProductCard';
import EmptyState from '../../components/common/EmptyState';

export default function CheckoutPage() {
  const { cart, refreshCart, refreshProducts, showToast } = useApp();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    recipientName: user?.fullName || user?.name || '',
    phoneNumber: '',
    shippingAddress: '',
    paymentMethod: 'Cod'
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const items = cart.items || [];
  const subtotal = cart.subtotal || 0;

  if (items.length === 0) {
    return (
      <EmptyState
        icon="shopping_cart"
        title="Giỏ hàng trống"
        message="Vui lòng chọn linh kiện trước khi tiến hành thanh toán."
        actionText="Quay lại mua sắm"
        actionLink="/products"
      />
    );
  }

  const validate = () => {
    const errs = {};
    const name = formData.recipientName.trim();
    if (!name) errs.recipientName = 'Vui lòng nhập họ và tên người nhận';
    else if (name.length > 150) errs.recipientName = 'Họ tên người nhận tối đa 150 ký tự';

    const phone = formData.phoneNumber.trim();
    const normalizedPhone = phone.replace(/[\+\s\-]/g, '');
    if (!phone) errs.phoneNumber = 'Vui lòng nhập số điện thoại';
    else if (phone.length > 20) errs.phoneNumber = 'Số điện thoại tối đa 20 ký tự';
    else if (!/^\d{9,15}$/.test(normalizedPhone)) errs.phoneNumber = 'Số điện thoại không hợp lệ (cần 9-15 chữ số)';

    const address = formData.shippingAddress.trim();
    if (!address) errs.shippingAddress = 'Vui lòng nhập địa chỉ giao hàng';
    else if (address.length > 500) errs.shippingAddress = 'Địa chỉ giao hàng tối đa 500 ký tự';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const order = await ordersApi.checkout({
        recipientName: formData.recipientName.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        shippingAddress: formData.shippingAddress.trim(),
        paymentMethod: formData.paymentMethod
      });

      showToast('Đặt hàng thành công!', 'success');
      await refreshCart();
      await refreshProducts();
      navigate(`/account/orders/${order.id}`);
    } catch (err) {
      const message = err.response?.data?.detail || err.response?.data?.title || 'Đặt hàng không thành công. Vui lòng kiểm tra lại.';
      showToast(message, 'error');
      refreshCart();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-xs text-slate-500 flex items-center gap-2">
        <Link to="/cart" className="hover:text-blue-600">Giỏ hàng</Link>
        <span>/</span>
        <span className="text-slate-800 font-bold">Thanh toán đơn hàng</span>
      </div>

      <h2 className="text-2xl font-bold text-slate-900">Thanh Toán Đơn Hàng</h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Customer Information Form */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600">person</span>
            <span>Thông Tin Giao Hàng</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Họ và tên người nhận *</label>
              <input
                type="text"
                value={formData.recipientName}
                onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                className={`w-full p-2.5 border rounded-xl text-xs outline-none ${errors.recipientName ? 'border-red-500' : 'border-slate-300 focus:border-blue-600'}`}
                placeholder="Nguyễn Văn A"
              />
              {errors.recipientName && <p className="text-[11px] text-red-500 mt-1">{errors.recipientName}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Số điện thoại liên hệ *</label>
              <input
                type="text"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                className={`w-full p-2.5 border rounded-xl text-xs outline-none ${errors.phoneNumber ? 'border-red-500' : 'border-slate-300 focus:border-blue-600'}`}
                placeholder="0988 123 456"
              />
              {errors.phoneNumber && <p className="text-[11px] text-red-500 mt-1">{errors.phoneNumber}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Địa chỉ nhận hàng chi tiết *</label>
            <textarea
              rows="3"
              value={formData.shippingAddress}
              onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
              className={`w-full p-2.5 border rounded-xl text-xs outline-none ${errors.shippingAddress ? 'border-red-500' : 'border-slate-300 focus:border-blue-600'}`}
              placeholder="Số nhà, Đường, Phường/Xã, Quận/Huyện, Tỉnh/Thành phố"
            ></textarea>
            {errors.shippingAddress && <p className="text-[11px] text-red-500 mt-1">{errors.shippingAddress}</p>}
          </div>

          {/* Payment Method Selection */}
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <h4 className="text-xs font-bold uppercase text-slate-500">Phương thức thanh toán</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                onClick={() => setFormData({ ...formData, paymentMethod: 'Cod' })}
                className={`p-4 rounded-xl border cursor-pointer flex flex-col items-center gap-2 transition-all ${
                  formData.paymentMethod === 'Cod'
                    ? 'border-blue-600 bg-blue-50/50 text-blue-700 font-bold'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <span className="material-symbols-outlined text-2xl">payments</span>
                <span className="text-xs">Thanh toán COD (Tiền mặt)</span>
              </label>

              <label
                onClick={() => setFormData({ ...formData, paymentMethod: 'MockGateway' })}
                className={`p-4 rounded-xl border cursor-pointer flex flex-col items-center gap-2 transition-all ${
                  formData.paymentMethod === 'MockGateway'
                    ? 'border-blue-600 bg-blue-50/50 text-blue-700 font-bold'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <span className="material-symbols-outlined text-2xl">account_balance</span>
                <span className="text-xs">Cổng thanh toán giả lập (MockGateway)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Order Items Review */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm h-fit space-y-5">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-3">Sản Phẩm Đã Chọn</h3>

          <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto space-y-3 pr-1">
            {items.map((item) => (
              <div key={item.id} className="pt-2 first:pt-0 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <img
                    src={getProductImageUrl(item.mainImageUrl)}
                    alt={item.productName}
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=500&auto=format&fit=crop&q=80'; }}
                    className="w-10 h-10 object-contain bg-slate-50 rounded p-1"
                  />
                  <div>
                    <p className="font-bold text-slate-800 line-clamp-1">{item.productName}</p>
                    <p className="text-[11px] text-slate-500">Số lượng: x{item.quantity}</p>
                  </div>
                </div>
                <span className="font-bold text-slate-900">{item.lineTotal.toLocaleString('vi-VN')}₫</span>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-200 pt-4 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Tổng tiền hàng</span>
              <span className="font-bold text-slate-900">{subtotal.toLocaleString('vi-VN')}₫</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Phí vận chuyển</span>
              <span className="text-emerald-600 font-bold">Miễn phí</span>
            </div>
            <div className="flex justify-between pt-2 text-base font-black text-slate-900">
              <span>Thành tiền</span>
              <span className="text-red-600">{subtotal.toLocaleString('vi-VN')}₫</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <span className="material-symbols-outlined animate-spin text-base">sync</span>
                <span>Đang xử lý checkout...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">check_circle</span>
                <span>Xác Nhận Đặt Hàng</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
