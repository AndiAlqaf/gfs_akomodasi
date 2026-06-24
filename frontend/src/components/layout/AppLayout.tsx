import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAppStore } from '@/stores/useAppStore';

const AppLayout: React.FC = () => {
  const { sidebarOpen } = useAppStore();
  const location = useLocation();

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className={`flex-1 min-w-0 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <Header />
        <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden p-6 relative">
          <div key={location.pathname} className="animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out fill-mode-both">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
