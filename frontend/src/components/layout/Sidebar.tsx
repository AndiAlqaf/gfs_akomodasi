import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BedDouble, 
  Users, 
  UtensilsCrossed, 
  Shirt,
  Settings,
  ChevronLeft,
  ChevronRight,
  Building2,
  Info
} from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import { cn } from '@/lib/utils';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Building2, label: 'Data Register', path: '/data-register' },
  { icon: BedDouble, label: 'Reservations', path: '/reservations' },
  { icon: Info, label: 'Information', path: '/information' },
  { icon: UtensilsCrossed, label: 'Meals Services', path: '/meals' },
  { icon: Shirt, label: 'Laundry Services', path: '/laundry' },
];

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { sidebarOpen, toggleSidebar } = useAppStore();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-full bg-emerald-950 border-r border-emerald-900/50 text-stone-300 transition-all duration-300 z-40 shadow-2xl',
        sidebarOpen ? 'w-64' : 'w-20'
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b border-emerald-900/50">
        {sidebarOpen && (
          <div className="flex items-center gap-3">
            <div className="bg-lime-400 p-2 rounded-lg text-emerald-950 shadow-lg shadow-lime-400/20">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-white tracking-tight">Layanan Akomodasi</h1>
              <p className="text-[10px] uppercase tracking-wider text-lime-400 font-medium">GFS Ceria</p>
            </div>
          </div>
        )}
        {!sidebarOpen && (
          <div className="flex items-center justify-center w-full">
            <div className="bg-lime-400 p-2 rounded-lg text-emerald-950 shadow-lg shadow-lime-400/20">
              <Building2 className="w-6 h-6" />
            </div>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className={cn(
            "p-2 rounded-lg hover:bg-emerald-900 text-stone-400 hover:text-white transition-colors",
            !sidebarOpen && "absolute -right-3 top-6 bg-emerald-900 border border-emerald-800 rounded-full shadow-lg"
          )}
        >
          {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 p-3 rounded-lg transition-all duration-200 group',
                isActive
                  ? 'bg-lime-400 text-emerald-950 shadow-md shadow-lime-400/20 font-medium'
                  : 'text-stone-400 hover:bg-emerald-900/50 hover:text-white'
              )}
              title={!sidebarOpen ? item.label : undefined}
            >
              <Icon size={20} />
              {sidebarOpen && <span className="font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
