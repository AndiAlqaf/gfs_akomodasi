import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/stores/useAppStore';
import { Building2, Lock, User as UserIcon, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();
  const { login } = useAppStore();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate network delay
    setTimeout(() => {
      if (username === 'admin' && password === 'admin123') {
        login({ id: '1', name: 'Admin User', email: 'admin@gfsceria.com', role: 'admin' });
        setIsSuccess(true);
        // Wait for the slide animation to finish before navigating
        setTimeout(() => {
          navigate('/');
        }, 800);
      } else {
        setError('Invalid username or password. Please try again.');
        setIsLoading(false);
      }
    }, 600);
  };

  return (
    <div className={`min-h-screen flex bg-white overflow-hidden transition-opacity duration-700 ease-in-out ${isSuccess ? 'opacity-0' : 'opacity-100'}`}>
      {/* Left Pane - Image & Branding */}
      <div 
        className="hidden lg:flex lg:w-1/2 relative bg-emerald-950 items-center justify-center animate-in fade-in slide-in-from-left-8 duration-1000 z-50"
      >
        <div className="absolute inset-0 bg-black/40 z-10" />
        <img 
          src="https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop" 
          alt="Hotel Accommodation" 
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
        
        <div className="relative z-20 px-16 text-stone-50 max-w-2xl text-center">
          <div className="inline-flex items-center justify-center p-4 bg-lime-400 rounded-3xl mb-8 shadow-2xl shadow-lime-400/20 animate-pulse">
            <Building2 className="w-16 h-16 text-emerald-950" />
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight mb-4 text-white drop-shadow-md">
            GFS Ceria
          </h1>
          <p className="text-xl text-emerald-100 font-medium tracking-wide drop-shadow mb-8">
            Integrated Accommodation Management System
          </p>
          <div className="w-24 h-1 bg-lime-400 mx-auto rounded-full opacity-80" />
        </div>
      </div>

      {/* Right Pane - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-6 sm:px-12 lg:px-24 relative bg-stone-50/50 z-0">
        {/* Subtle decorative blob */}
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-lime-200/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-emerald-200/30 rounded-full blur-3xl pointer-events-none" />

        <div className="mx-auto w-full max-w-md relative z-10 animate-in fade-in slide-in-from-right-8 duration-700 delay-150 fill-mode-both">
          <div className="lg:hidden mb-12 text-center">
            <div className="inline-flex bg-lime-400 p-3 rounded-2xl shadow-lg shadow-lime-400/20 text-emerald-950 mb-4">
              <Building2 className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-extrabold text-emerald-950 tracking-tight">GFS Ceria</h2>
            <p className="text-sm text-emerald-700 mt-2 font-medium tracking-widest uppercase">Accommodation System</p>
          </div>

          <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-emerald-50">
            <h3 className="text-2xl font-bold text-emerald-950 mb-2">Welcome Back</h3>
            <p className="text-emerald-600/80 mb-8 text-sm">Please sign in to access your dashboard.</p>

            <form className="space-y-6" onSubmit={handleLogin}>
              {error && (
                <div className="bg-red-50/80 backdrop-blur-sm border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 animate-in slide-in-from-top-2">
                  <div className="w-1.5 h-full py-2 bg-red-500 rounded-full" />
                  {error}
                </div>
              )}

              <div className="space-y-1.5 group">
                <Label htmlFor="username" className="text-sm font-semibold text-emerald-900 ml-1 transition-colors group-focus-within:text-lime-600">
                  Username
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-emerald-400 transition-colors group-focus-within:text-lime-500" />
                  </div>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-12 py-6 bg-white/50 block w-full border-emerald-100 focus:ring-lime-400 focus:border-lime-400 rounded-2xl shadow-sm transition-all"
                    placeholder="Enter 'admin'"
                  />
                </div>
              </div>

              <div className="space-y-1.5 group">
                <Label htmlFor="password" className="text-sm font-semibold text-emerald-900 ml-1 transition-colors group-focus-within:text-lime-600">
                  Password
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-emerald-400 transition-colors group-focus-within:text-lime-500" />
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-12 py-6 bg-white/50 block w-full border-emerald-100 focus:ring-lime-400 focus:border-lime-400 rounded-2xl shadow-sm transition-all"
                    placeholder="Enter 'admin123'"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-lime-500 focus:ring-lime-400 border-emerald-200 rounded cursor-pointer"
                  />
                  <Label htmlFor="remember-me" className="ml-2 block text-sm text-emerald-700 cursor-pointer select-none">
                    Remember me
                  </Label>
                </div>

                <div className="text-sm">
                  <a href="#" className="font-semibold text-emerald-600 hover:text-emerald-500 transition-colors">
                    Forgot password?
                  </a>
                </div>
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={isLoading || isSuccess}
                  className="w-full flex justify-center items-center gap-2 py-6 px-4 border border-transparent rounded-2xl shadow-lg shadow-lime-400/20 text-sm font-bold text-emerald-950 bg-lime-400 hover:bg-lime-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lime-500 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isLoading || isSuccess ? 'Authenticating...' : (
                    <>
                      Sign In To Dashboard
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
          
          <div className="mt-10 text-center text-sm font-medium text-emerald-600/50">
            &copy; {new Date().getFullYear()} GFS Ceria Accommodation.
          </div>
        </div>
      </div>
    </div>
  );
}
