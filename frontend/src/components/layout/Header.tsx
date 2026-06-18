import React from 'react';
import { Bell, Search, User, LogOut, Settings } from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const Header: React.FC = () => {
  const { user, logout } = useAppStore();

  return (
    <header className="sticky top-0 z-30 bg-white/70 backdrop-blur-md border-b border-slate-200/50 px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <Input
              type="search"
              placeholder="Search guests, rooms, reservations..."
              className="pl-10 bg-white/50 border-emerald-100 focus-visible:ring-lime-400 rounded-full transition-all"
            />
          </div>
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
              <DropdownMenuItem>
                <User className="mr-2" size={16} />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
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
