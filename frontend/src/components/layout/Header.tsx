import React from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, User, LogOut, Settings } from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

const Header: React.FC = () => {
  const { user, logout } = useAppStore();
  const location = useLocation();

  const pageTitles: Record<string, string> = {
    '/': 'Dashboard',
    '/data-register': 'Data Register',
    '/reservations': 'Reservation & Check-In/ Out',
    '/information': 'Information',
    '/meals': 'Meals Services',
    '/laundry': 'Laundry Services',
  };

  const currentTitle = pageTitles[location.pathname] || '';

  return (
    <header className="sticky top-0 z-30 bg-white/70 backdrop-blur-md border-b border-slate-200/50 px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Page Title */}
        <div className="flex-1 max-w-md flex items-center">
          <h1 className="text-xl font-bold text-emerald-950 tracking-tight uppercase">{currentTitle}</h1>
        </div>
        {/* Right section */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 hover:bg-emerald-50/50 rounded-full pr-4">
                <div className="w-8 h-8 rounded-full bg-emerald-950 flex items-center justify-center shadow-md border border-emerald-900/20">
                  <User size={18} className="text-lime-400" />
                </div>
                <div className="text-left hidden md:block">
                  <p className="text-sm font-medium">{user?.name || 'Admin User'}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role || 'Administrator'}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => {
                import('sweetalert2').then(Swal => {
                  Swal.default.fire({
                    title: 'My Profile',
                    html: `<b>Name:</b> ${user?.name || 'Admin User'}<br/><b>Role:</b> ${user?.role || 'Administrator'}`,
                    icon: 'info',
                    confirmButtonText: 'Close',
                    confirmButtonColor: '#064e3b'
                  });
                });
              }}>
                <User className="mr-2" size={16} />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                import('sweetalert2').then(Swal => {
                  Swal.default.fire({
                    title: 'Settings',
                    text: 'System Settings and Preferences will be available here soon.',
                    icon: 'warning',
                    confirmButtonText: 'Got it',
                    confirmButtonColor: '#064e3b'
                  });
                });
              }}>
                <Settings className="mr-2" size={16} />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-red-600">
                <LogOut className="mr-2" size={16} />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
