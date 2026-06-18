import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/stores/useAppStore';
import { Building2, Lock, User as UserIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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
        navigate('/');
      } else {
        setError('Invalid username or password. Please try again.');
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md animate-fade-in">
        <div className="flex justify-center mb-6">
          <div className="bg-lime-400 p-3 rounded-2xl shadow-lg shadow-lime-400/20 text-emerald-950">
            <Building2 className="w-12 h-12" />
          </div>
        </div>
        <h2 className="mt-2 text-center text-3xl font-extrabold text-emerald-950 tracking-tight">
          GFS Ceria
        </h2>
        <p className="text-center text-sm text-emerald-700 mt-2 font-medium tracking-widest uppercase">
          Accommodation System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <Card className="bg-white/80 backdrop-blur-md shadow-xl border-emerald-100 rounded-2xl overflow-hidden">
          <CardContent className="py-8 px-4 sm:px-10">
            <form className="space-y-6" onSubmit={handleLogin}>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm text-center font-medium animate-shake">
                  {error}
                </div>
              )}

              <div>
                <Label htmlFor="username" className="block text-sm font-medium text-emerald-900 mb-2">
                  Username
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-emerald-400" />
                  </div>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10 block w-full border-emerald-200 focus:ring-lime-400 focus:border-lime-400 rounded-xl"
                    placeholder="Enter 'admin'"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password" className="block text-sm font-medium text-emerald-900 mb-2">
                  Password
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-emerald-400" />
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 block w-full border-emerald-200 focus:ring-lime-400 focus:border-lime-400 rounded-xl"
                    placeholder="Enter 'admin123'"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-lime-500 focus:ring-lime-400 border-emerald-300 rounded"
                  />
                  <Label htmlFor="remember-me" className="ml-2 block text-sm text-emerald-800">
                    Remember me
                  </Label>
                </div>

                <div className="text-sm">
                  <a href="#" className="font-medium text-emerald-600 hover:text-emerald-500">
                    Forgot your password?
                  </a>
                </div>
              </div>

              <div>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-6 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-emerald-950 bg-lime-400 hover:bg-lime-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lime-500 transition-all duration-200"
                >
                  {isLoading ? 'Authenticating...' : 'Sign In'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
      
      {/* Footer / Copyright */}
      <div className="mt-12 text-center text-sm text-emerald-600/60 animate-fade-in" style={{ animationDelay: '0.2s' }}>
        &copy; {new Date().getFullYear()} GFS Ceria Accommodation. All rights reserved.
      </div>
    </div>
  );
}
