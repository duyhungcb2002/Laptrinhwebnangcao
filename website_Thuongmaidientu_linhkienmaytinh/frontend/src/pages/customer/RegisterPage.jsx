import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

export default function RegisterPage() {
  const { register } = useApp();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim() || !email.trim() || !password.trim()) {
      setErrorMessage('Vui lòng điền đầy đủ các trường thông tin.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Mật khẩu phải có độ dài tối thiểu từ 8 ký tự trở lên.');
      return;
    }

    if (password !== confirmPass) {
      setErrorMessage('Mật khẩu xác nhận không trùng khớp.');
      return;
    }

    const res = register(name.trim(), email.trim(), password);
    if (res.success) {
      navigate('/');
    } else {
      setErrorMessage(res.message || 'Đăng ký không thành công.');
    }
  };

  return (
    <div className="max-w-md mx-auto py-8 sm:py-12 px-2">
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl">person_add</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Tạo Tài Khoản Mới</h2>
          <p className="text-xs text-slate-500">Đăng ký thành viên để mua sắm linh kiện TechHub PC</p>
        </div>

        {errorMessage && (
          <div className="bg-red-50 text-red-600 text-xs p-3 rounded-xl border border-red-200 font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined text-base">error</span>
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Họ và tên *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nguyễn Văn A"
              className="w-full p-3 border border-slate-300 rounded-xl text-xs outline-none focus:border-blue-600 transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Địa chỉ Email *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nhap.email@gmail.com"
              className="w-full p-3 border border-slate-300 rounded-xl text-xs outline-none focus:border-blue-600 transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Mật khẩu (Tối thiểu 8 ký tự) *</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full p-3 border border-slate-300 rounded-xl text-xs outline-none focus:border-blue-600 transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Xác nhận mật khẩu *</label>
            <input
              type="password"
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
              placeholder="••••••••"
              className="w-full p-3 border border-slate-300 rounded-xl text-xs outline-none focus:border-blue-600 transition-colors"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-xs shadow-md hover:shadow-blue-500/25 transition-all"
          >
            Đăng Ký Tài Khoản
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 border-t border-slate-100 pt-4">
          Đã có tài khoản?{' '}
          <Link to="/login" className="text-blue-600 font-bold hover:underline">
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    </div>
  );
}
