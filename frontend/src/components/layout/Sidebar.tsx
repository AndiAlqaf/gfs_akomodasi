import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  BedDouble,
  UtensilsCrossed,
  Shirt,
  Building2,
  Info,
  UserCog
} from 'lucide-react';
import { useAppStore, useUIStore } from '@/stores/useAppStore';
import { cn } from '@/lib/utils';
import { ROLE_PERMISSIONS, hasPermission } from '@/config/roles';

const Sidebar: React.FC = () => {
  const [isHovered, setIsHovered] = React.useState(false);
  const location = useLocation();
  const { user } = useAppStore();
  const { setSidebarHovered } = useUIStore();
  const role = user?.role || 'super';
  const isExpanded = isHovered;

  useEffect(() => {
    setSidebarHovered(isHovered);
  }, [isHovered, setSidebarHovered]);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/', allowed: hasPermission(role, ROLE_PERMISSIONS.dashboard.view) },
    { icon: Building2, label: 'Data Register', path: '/data-register', allowed: hasPermission(role, ROLE_PERMISSIONS.dataRegister.view) },
    { icon: BedDouble, label: 'Reservations', path: '/reservations', allowed: hasPermission(role, ROLE_PERMISSIONS.reservations.bedroomView) },
    { icon: Info, label: 'Information', path: '/information', allowed: hasPermission(role, ROLE_PERMISSIONS.information.view) },
    { icon: UtensilsCrossed, label: 'Meals Services', path: '/meals', allowed: hasPermission(role, ROLE_PERMISSIONS.meals.scheduleView) },
    { icon: Shirt, label: 'Laundry Services', path: '/laundry', allowed: hasPermission(role, ROLE_PERMISSIONS.laundry.droppingView) },
    { icon: UserCog, label: 'Manage Accounts', path: '/manage-accounts', allowed: hasPermission(role, ROLE_PERMISSIONS.manageAccounts.create) },
  ].filter(item => item.allowed);

  return (
    <aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'fixed left-0 top-0 h-full bg-emerald-950 border-r border-emerald-900/50 text-stone-300 transition-all duration-300 z-40 shadow-2xl overflow-x-hidden',
        isExpanded ? 'w-64' : 'w-20'
      )}
    >
      {/* Logo */}
      <div className="flex items-center p-4 border-b border-emerald-900/50 relative overflow-hidden h-[73px]">
        <div className="flex items-center gap-3 w-full">
          <div className="shrink-0 bg-lime-400 p-2 rounded-lg text-emerald-950 shadow-lg shadow-lime-400/20">
            <Building2 className="w-6 h-6" />
          </div>
          <div className={cn("transition-all duration-300 whitespace-nowrap", isExpanded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4")}>
            <h1 className="font-bold text-lg text-white tracking-tight">SILARIA</h1>
            <p className="text-[10px] uppercase tracking-wider text-lime-400 font-medium">SITE WOLO</p>
          </div>
        </div>
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
              title={!isExpanded ? item.label : undefined}
            >
              <div className="shrink-0"><Icon size={20} /></div>
              <span className={cn("font-medium transition-all duration-300 whitespace-nowrap overflow-hidden", isExpanded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 w-0")}>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
