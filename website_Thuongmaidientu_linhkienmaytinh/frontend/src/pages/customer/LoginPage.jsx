import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

export default function LoginPage() {
  const { login } = useApp();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Vui lòng nhập đầy đủ địa chỉ Email và Mật khẩu.');
      return;
    }

    const res = login(email.trim(), password.trim());
    if (res.success) {
      if (res.role === 'Admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } else {
      setErrorMessage(res.message || 'Mật khẩu hoặc tài khoản không chính xác.');
    }
  };

  return (
    <div className="max-w-md mx-auto py-8 sm:py-12 px-2">
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl">account_circle</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Đăng Nhập Tài Khoản</h2>
          <p className="text-xs text-slate-500">Đăng nhập để trải nghiệm mua sắm linh kiện TechHub PC</p>
        </div>

        {errorMessage && (
          <div className="bg-red-50 text-red-600 text-xs p-3 rounded-xl border border-red-200 font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined text-base">error</span>
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
            <label className="block text-xs font-bold text-slate-700 mb-1">Mật khẩu *</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full p-3 border border-slate-300 rounded-xl text-xs outline-none focus:border-blue-600 transition-colors"
              required
            />
          </div>

          {/* Demo Accounts Card */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-slate-700 text-xs space-y-1.5">
            <p className="font-bold text-slate-900 flex items-center gap-1">
              <span className="material-symbols-outlined text-sm text-blue-600">info</span>
              <span>Tài khoản thử nghiệm hệ thống:</span>
            </p>
            <div className="space-y-1 text-[11px]">
              <p>• <strong>Quản trị viên (Admin):</strong> <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200">admin@techhub.vn</code> / Mật khẩu: <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200">Admin@123</code></p>
              <p>• <strong>Khách hàng (Customer):</strong> <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200">user@gmail.com</code> / Mật khẩu: <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200">User@123</code></p>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-xs shadow-md hover:shadow-blue-500/25 transition-all"
          >
            Đăng Nhập
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 border-t border-slate-100 pt-4">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="text-blue-600 font-bold hover:underline">
            Đăng ký tài khoản mới
          </Link>
        </div>
      </div>
    </div>
  );
}
