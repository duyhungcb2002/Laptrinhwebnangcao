import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import Toast from '../components/common/Toast';
import ConfirmModal from '../components/common/ConfirmModal';

export default function CustomerLayout() {
  return (
    <div className="min-h-screen flex flex-col font-['Be_Vietnam_Pro'] bg-slate-50 text-slate-900 w-full overflow-x-hidden">
      <Header />
      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 flex-1 w-full overflow-x-hidden">
        <Outlet />
      </main>
      <Footer />
      <Toast />
      <ConfirmModal />
    </div>
  );
}
