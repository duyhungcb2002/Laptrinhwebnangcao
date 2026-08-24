import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import EmptyState from '../../components/common/EmptyState';

export default function CheckoutPage() {
  const { cart, createOrder, currentUser } = useApp();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    customerName: currentUser.name || '',
    email: currentUser.email || '',
    phone: '',
    address: '',
    note: '',
    paymentMethod: 'Banking'
  });

  const [errors, setErrors] = useState({});

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  if (cart.length === 0) {
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
    if (!formData.customerName.trim()) errs.customerName = 'Vui lòng nhập họ và tên';
    if (!formData.email.trim()) errs.email = 'Vui lòng nhập email';
    if (!formData.phone.trim()) errs.phone = 'Vui lòng nhập số điện thoại';
    if (!formData.address.trim()) errs.address = 'Vui lòng nhập địa chỉ giao hàng';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const newOrder = createOrder({
      customerName: formData.customerName,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      note: formData.note,
      paymentMethod: formData.paymentMethod,
      totalAmount,
      items: cart.map(item => ({ id: item.id, name: item.name, price: item.price, qty: item.qty }))
    });

    navigate(`/account/orders/${newOrder.id}`);
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
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                className={`w-full p-2.5 border rounded-xl text-xs outline-none ${errors.customerName ? 'border-red-500' : 'border-slate-300 focus:border-blue-600'}`}
                placeholder="Nguyễn Văn A"
              />
              {errors.customerName && <p className="text-[11px] text-red-500 mt-1">{errors.customerName}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Số điện thoại liên hệ *</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={`w-full p-2.5 border rounded-xl text-xs outline-none ${errors.phone ? 'border-red-500' : 'border-slate-300 focus:border-blue-600'}`}
                placeholder="0988 123 456"
              />
              {errors.phone && <p className="text-[11px] text-red-500 mt-1">{errors.phone}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Địa chỉ Email nhận thông tin *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={`w-full p-2.5 border rounded-xl text-xs outline-none ${errors.email ? 'border-red-500' : 'border-slate-300 focus:border-blue-600'}`}
              placeholder="example@gmail.com"
            />
            {errors.email && <p className="text-[11px] text-red-500 mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Địa chỉ nhận hàng chi tiết *</label>
            <textarea
              rows="2"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className={`w-full p-2.5 border rounded-xl text-xs outline-none ${errors.address ? 'border-red-500' : 'border-slate-300 focus:border-blue-600'}`}
              placeholder="Số nhà, Đường, Phường/Xã, Quận/Huyện, Tỉnh/Thành phố"
            ></textarea>
            {errors.address && <p className="text-[11px] text-red-500 mt-1">{errors.address}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Ghi chú đơn hàng (Tùy chọn)</label>
            <input
              type="text"
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              className="w-full p-2.5 border border-slate-300 rounded-xl text-xs outline-none focus:border-blue-600"
              placeholder="Giao hàng ngoài giờ hành chính, gọi trước khi giao..."
            />
          </div>

          {/* Payment Method Selection */}
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <h4 className="text-xs font-bold uppercase text-slate-500">Phương thức thanh toán</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label
                onClick={() => setFormData({ ...formData, paymentMethod: 'Banking' })}
                className={`p-4 rounded-xl border cursor-pointer flex flex-col items-center gap-2 transition-all ${
                  formData.paymentMethod === 'Banking'
                    ? 'border-blue-600 bg-blue-50/50 text-blue-700 font-bold'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <span className="material-symbols-outlined text-2xl">account_balance</span>
                <span className="text-xs">Chuyển khoản Banking</span>
              </label>

              <label
                onClick={() => setFormData({ ...formData, paymentMethod: 'COD' })}
                className={`p-4 rounded-xl border cursor-pointer flex flex-col items-center gap-2 transition-all ${
                  formData.paymentMethod === 'COD'
                    ? 'border-blue-600 bg-blue-50/50 text-blue-700 font-bold'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <span className="material-symbols-outlined text-2xl">payments</span>
                <span className="text-xs">Thanh toán COD</span>
              </label>

              <label
                onClick={() => setFormData({ ...formData, paymentMethod: 'VNPay' })}
                className={`p-4 rounded-xl border cursor-pointer flex flex-col items-center gap-2 transition-all ${
                  formData.paymentMethod === 'VNPay'
                    ? 'border-blue-600 bg-blue-50/50 text-blue-700 font-bold'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <span className="material-symbols-outlined text-2xl">qr_code_scanner</span>
                <span className="text-xs">Ví điện tử VNPay / MoMo</span>
              </label>
            </div>
          </div>
        </div>

        {/* Order Items Review */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm h-fit space-y-5">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-3">Sản Phẩm Đã Chọn</h3>

          <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto space-y-3 pr-1">
            {cart.map((item) => (
              <div key={item.id} className="pt-2 first:pt-0 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <img src={item.img} alt={item.name} className="w-10 h-10 object-contain bg-slate-50 rounded p-1" />
                  <div>
                    <p className="font-bold text-slate-800 line-clamp-1">{item.name}</p>
                    <p className="text-[11px] text-slate-500">Số lượng: x{item.qty}</p>
                  </div>
                </div>
                <span className="font-bold text-slate-900">{(item.price * item.qty).toLocaleString('vi-VN')}₫</span>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-200 pt-4 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Tổng tiền hàng</span>
              <span className="font-bold text-slate-900">{totalAmount.toLocaleString('vi-VN')}₫</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Phí vận chuyển</span>
              <span className="text-emerald-600 font-bold">Miễn phí</span>
            </div>
            <div className="flex justify-between pt-2 text-base font-black text-slate-900">
              <span>Thành tiền</span>
              <span className="text-red-600">{totalAmount.toLocaleString('vi-VN')}₫</span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all text-sm flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">check_circle</span>
            <span>Xác Nhận Đặt Hàng</span>
          </button>
        </div>
      </form>
    </div>
  );
}
