import React from 'react';
import { useApp } from '../../context/AppContext';

export default function AdminUsersPage() {
  const { users, currentUser, toggleUserStatus, confirmAction } = useApp();

  const handleToggleStatus = (user) => {
    if (currentUser && currentUser.id === user.id) {
      confirmAction('Tài khoản này là quản trị viên chính bạn đang đăng nhập. Bạn có chắc muốn chuyển trạng thái?', () => {
        toggleUserStatus(user.id);
      });
      return;
    }

    confirmAction(`Bạn có chắc chắn muốn ${user.status === 'Active' ? 'khóa' : 'mở khóa'} tài khoản ${user.email}?`, () => {
      toggleUserStatus(user.id);
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Quản Lý Người Dùng</h2>
        <p className="text-xs text-slate-500">Danh sách tài khoản khách hàng và quản trị viên hệ thống</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 uppercase text-slate-600 font-semibold border-b">
              <tr>
                <th className="p-4">Mã User</th>
                <th className="p-4">Họ và Tên</th>
                <th className="p-4">Email</th>
                <th className="p-4">Vai Trò</th>
                <th className="p-4">Ngày Tham Gia</th>
                <th className="p-4">Trạng Thái</th>
                <th className="p-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-mono font-bold text-blue-700">{u.id}</td>
                  <td className="p-4 font-bold text-slate-900">{u.name}</td>
                  <td className="p-4 text-slate-600">{u.email}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded font-bold text-[10px] ${u.role === 'Admin' ? 'bg-purple-50 text-purple-700' : 'bg-slate-100 text-slate-700'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500">{u.joinedDate || '2026-01-01'}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded font-bold text-[10px] ${u.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                      {u.status === 'Active' ? 'Hoạt động' : 'Bị khóa'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleToggleStatus(u)}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                        u.status === 'Active'
                          ? 'bg-red-50 text-red-600 hover:bg-red-100'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      }`}
                    >
                      {u.status === 'Active' ? 'Khóa TK' : 'Mở khóa'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
