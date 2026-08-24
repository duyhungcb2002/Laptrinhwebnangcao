import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

export default function Footer() {
  const { showToast } = useApp();

  const handlePolicyClick = (policyName) => {
    showToast(`Thông tin ${policyName} đang được cập nhật. Vui lòng quay lại sau!`, 'info');
  };

  return (
    <footer className="bg-slate-900 text-slate-400 text-sm mt-12 border-t border-slate-800 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand & info */}
        <div className="space-y-4">
          <Link to="/" className="text-2xl font-bold text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-3xl text-blue-500">computer</span>
            <span>TechHub PC</span>
          </Link>
          <p className="text-xs text-slate-400 leading-relaxed">
            Hệ thống bán lẻ linh kiện máy tính, PC Gaming, Workstation cao cấp hàng đầu Việt Nam. Cam kết hàng chính hãng 100%, bảo hành tận nơi.
          </p>
          <div className="flex gap-3 pt-1">
            <button
              onClick={() => showToast('Kênh Facebook TechHub PC đang cập nhật!', 'info')}
              aria-label="Facebook TechHub PC"
              className="w-9 h-9 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors"
            >
              <span className="font-bold text-xs">FB</span>
            </button>
            <button
              onClick={() => showToast('Kênh YouTube TechHub PC đang cập nhật!', 'info')}
              aria-label="YouTube TechHub PC"
              className="w-9 h-9 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center hover:bg-red-600 hover:text-white transition-colors"
            >
              <span className="font-bold text-xs">YT</span>
            </button>
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-3">
          <h4 className="text-white font-bold text-sm uppercase tracking-wider">Danh mục linh kiện</h4>
          <ul className="space-y-2 text-xs">
            <li><Link to="/products?category=CPU" className="hover:text-white transition-colors">Bộ vi xử lý Intel / AMD</Link></li>
            <li><Link to="/products?category=VGA" className="hover:text-white transition-colors">Card màn hình NVIDIA RTX 40</Link></li>
            <li><Link to="/products?category=RAM" className="hover:text-white transition-colors">Bộ nhớ RAM DDR5 chính hãng</Link></li>
            <li><Link to="/products?category=SSD" className="hover:text-white transition-colors">Ổ cứng SSD NVMe tốc độ cao</Link></li>
            <li><Link to="/products?category=Mainboard" className="hover:text-white transition-colors">Bo mạch chủ Gaming ATX</Link></li>
          </ul>
        </div>

        {/* Customer Support */}
        <div className="space-y-3">
          <h4 className="text-white font-bold text-sm uppercase tracking-wider">Hỗ trợ khách hàng</h4>
          <ul className="space-y-2 text-xs">
            <li><Link to="/account/orders" className="hover:text-white transition-colors">Tra cứu đơn hàng</Link></li>
            <li><button onClick={() => handlePolicyClick('Chính sách bảo hành')} className="hover:text-white text-left transition-colors">Chính sách bảo hành & đổi trả</button></li>
            <li><button onClick={() => handlePolicyClick('Hướng dẫn thanh toán')} className="hover:text-white text-left transition-colors">Hướng dẫn thanh toán & trả góp</button></li>
            <li><button onClick={() => handlePolicyClick('Chính sách giao hàng')} className="hover:text-white text-left transition-colors">Chính sách giao hàng toàn quốc</button></li>
            <li><button onClick={() => handlePolicyClick('Bảo mật thông tin')} className="hover:text-white text-left transition-colors">Quy định bảo mật thông tin</button></li>
          </ul>
        </div>

        {/* Contact */}
        <div className="space-y-3">
          <h4 className="text-white font-bold text-sm uppercase tracking-wider">Liên hệ & Showroom</h4>
          <div className="space-y-2 text-xs">
            <p className="flex items-start gap-2">
              <span className="material-symbols-outlined text-blue-500 text-base">location_on</span>
              <span>123 Xuân Thủy, Cầu Giấy, Hà Nội</span>
            </p>
            <p className="flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-500 text-base">call</span>
              <span className="font-bold text-white">1900 6789 - 0988 123 456</span>
            </p>
            <p className="flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-500 text-base">mail</span>
              <span>support@techhub.vn</span>
            </p>
            <p className="text-[11px] text-slate-500 pt-2">Giờ làm việc: 8:00 - 21:00 (Tất cả các ngày trong tuần)</p>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800 text-center py-4 text-xs text-slate-500">
        © 2026 TechHub PC - Hệ Thống Bán Lẻ Linh Kiện Máy Tính Cao Cấp. All rights reserved.
      </div>
    </footer>
  );
}
