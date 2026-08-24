import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export default function ProfilePage() {
  const { currentUser, updateProfile, showToast } = useApp();

  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '0988 123 456');
  const [address, setAddress] = useState(currentUser?.address || '123 Xuân Thủy, Cầu Giấy, Hà Nội');
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = 'Vui lòng nhập họ và tên';
    if (!email.trim() || !email.includes('@')) errs.email = 'Vui lòng nhập địa chỉ email hợp lệ';
    if (!phone.trim() || phone.length < 9) errs.phone = 'Vui lòng nhập số điện thoại hợp lệ';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    if (!validate()) {
      showToast('Vui lòng kiểm tra lại các thông tin nhập vào!', 'error');
      return;
    }

    updateProfile({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim()
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Hồ Sơ Cá Nhân</h2>

      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-4 border-b border-slate-200 pb-6">
          <div className="w-16 h-16 rounded-full bg-blue-600 text-white font-bold text-2xl flex items-center justify-center shadow-md">
            {name ? name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">{name}</h3>
            <p className="text-xs text-slate-500">{email}</p>
            <span className="inline-block mt-1 bg-blue-50 text-blue-700 font-bold text-[10px] px-2.5 py-0.5 rounded">
              Vai trò: {currentUser?.role || 'Khách hàng'}
            </span>
          </div>
        </div>

        <form onSubmit={handleUpdate} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Họ và tên *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full p-3 border rounded-xl outline-none ${errors.name ? 'border-red-500' : 'border-slate-300 focus:border-blue-600'}`}
            />
            {errors.name && <p className="text-red-500 text-[11px] mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Địa chỉ Email *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full p-3 border rounded-xl outline-none ${errors.email ? 'border-red-500' : 'border-slate-300 focus:border-blue-600'}`}
            />
            {errors.email && <p className="text-red-500 text-[11px] mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Số điện thoại liên hệ *</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={`w-full p-3 border rounded-xl outline-none ${errors.phone ? 'border-red-500' : 'border-slate-300 focus:border-blue-600'}`}
            />
            {errors.phone && <p className="text-red-500 text-[11px] mt-1">{errors.phone}</p>}
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Địa chỉ nhận hàng mặc định</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:border-blue-600"
            />
          </div>

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-md hover:shadow-blue-500/25 transition-all"
          >
            Lưu Thay Đổi
          </button>
        </form>
      </div>
    </div>
  );
}
