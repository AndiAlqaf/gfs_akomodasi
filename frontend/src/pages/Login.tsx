import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/stores/useAppStore';
import { Building2, Lock, User as UserIcon, ArrowRight, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PRESET_ACCOUNTS } from '@/config/roles';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();
  const { login } = useAppStore();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    setTimeout(() => {
      const found = PRESET_ACCOUNTS.find(
        (acc) =>
          acc.username.toLowerCase() === username.trim().toLowerCase() &&
          (password === acc.password || password === 'admin123' || password === 'password123')
      );

      if (found) {
        login({
          id: found.id,
          name: found.name,
          email: found.email,
          role: found.role,
        });
        setIsSuccess(true);
        setTimeout(() => {
          navigate('/');
        }, 800);
      } else {
        setError('Invalid username or password. Please check your credentials.');
        setIsLoading(false);
      }
    }, 600);
  };

  return (
    <div className={`min-h-screen flex bg-white overflow-hidden transition-opacity duration-700 ease-in-out ${isSuccess ? 'opacity-0' : 'opacity-100'}`}>
      {/* Left Pane - Image & Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-emerald-950 items-center justify-center animate-in fade-in slide-in-from-left-8 duration-1000 z-50">
        <div className="absolute inset-0 bg-black/40 z-10" />
        <img
          src="/DJI_20260215123424_0157_D.JPG.jpeg"
          alt="Hotel Accommodation"
          className="absolute inset-0 w-full h-full object-cover z-0"
        />

        <div className="relative z-20 px-16 text-stone-50 max-w-2xl text-center">
          <div className="inline-flex items-center justify-center p-4 bg-lime-400 rounded-3xl mb-8 shadow-2xl shadow-lime-400/20 animate-pulse">
            <Building2 className="w-16 h-16 text-emerald-950" />
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight mb-4 text-white drop-shadow-md">
            SILARIA
          </h1>
          <p className="text-xl text-emerald-100 font-medium tracking-wide drop-shadow mb-4">
            SISTEM INFORMASI LAYANAN AKOMODASI GFS
          </p>
          <p className="text-lg text-emerald-200 font-medium tracking-wide drop-shadow mb-8">
            PT. CERIA
          </p>
          <div className="w-24 h-1 bg-lime-400 mx-auto rounded-full opacity-80" />
        </div>
      </div>

      {/* Right Pane - Form */}
      <div className="flex-1 flex flex-col justify-center py-10 px-6 sm:px-12 lg:px-20 relative bg-stone-50/50 z-0 overflow-y-auto">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-lime-200/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-emerald-200/30 rounded-full blur-3xl pointer-events-none" />

        <div className="mx-auto w-full max-w-[440px] relative z-10 animate-in fade-in slide-in-from-right-8 duration-700">
          <div className="lg:hidden mb-8 text-center">
            <div className="inline-flex bg-lime-400 p-3 rounded-2xl shadow-lg text-emerald-950 mb-3">
              <Building2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-extrabold text-emerald-950">GFS Ceria</h2>
            <p className="text-xs text-emerald-700 font-medium uppercase tracking-widest">Accommodation System</p>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 sm:p-10 shadow-lg border border-emerald-100/60 aspect-square flex flex-col justify-center gap-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-emerald-950">Welcome Back</h3>
                <p className="text-emerald-700/80 text-xs">Sign in to your account</p>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="border-emerald-300 text-emerald-900 hover:bg-emerald-50 rounded-xl text-xs gap-1.5 font-bold">
                    <ShieldCheck size={16} /> Role Authority
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-emerald-950 text-xl font-bold flex items-center gap-2">
                      <ShieldCheck className="text-emerald-700" /> Role Access Authority Matrix (8 Roles)
                    </DialogTitle>
                  </DialogHeader>
                  <div className="text-xs space-y-4 pt-2">
                    <div className="overflow-x-auto border border-emerald-200 rounded-xl">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-emerald-950 text-stone-50 font-bold uppercase">
                          <tr>
                            <th className="p-2 border border-emerald-900">Module / Action</th>
                            <th className="p-2 border border-emerald-900 text-center">SUPER</th>
                            <th className="p-2 border border-emerald-900 text-center">ADMIN</th>
                            <th className="p-2 border border-emerald-900 text-center">FRON</th>
                            <th className="p-2 border border-emerald-900 text-center">SUPERVISOR</th>
                            <th className="p-2 border border-emerald-900 text-center">CANTEEN</th>
                            <th className="p-2 border border-emerald-900 text-center">LAUNDR</th>
                            <th className="p-2 border border-emerald-900 text-center">DRIVER</th>
                            <th className="p-2 border border-emerald-900 text-center">LAUNDRY</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-emerald-100">
                          <tr className="bg-stone-100 font-bold text-emerald-950"><td colSpan={9} className="p-2">1. Manage Access Accounts</td></tr>
                          <tr><td className="p-2 pl-4">Create / Edit / Delete Accounts</td><td className="text-center text-emerald-700 font-bold">✅</td><td className="text-center text-red-400">❌</td><td className="text-center text-red-400">❌</td><td className="text-center text-red-400">❌</td><td className="text-center text-red-400">❌</td><td className="text-center text-red-400">❌</td><td className="text-center text-red-400">❌</td><td className="text-center text-red-400">❌</td></tr>
                          <tr className="bg-stone-100 font-bold text-emerald-950"><td colSpan={9} className="p-2">2. Batch Excel Import</td></tr>
                          <tr><td className="p-2 pl-4">Import to DB</td><td className="text-center text-emerald-700 font-bold">✅</td><td className="text-center text-red-400">❌</td><td className="text-center text-red-400">❌</td><td className="text-center text-red-400">❌</td><td className="text-center text-red-400">❌</td><td className="text-center text-red-400">❌</td><td className="text-center text-red-400">❌</td><td className="text-center text-red-400">❌</td></tr>
                          <tr className="bg-stone-100 font-bold text-emerald-950"><td colSpan={9} className="p-2">3. Dashboard & 6. Information</td></tr>
                          <tr><td className="p-2 pl-4">View Overview & Info</td><td className="text-center text-emerald-700 font-bold">✅</td><td className="text-center text-emerald-700 font-bold">✅</td><td className="text-center text-emerald-700 font-bold">✅</td><td className="text-center text-emerald-700 font-bold">✅</td><td className="text-center text-emerald-700 font-bold">✅</td><td className="text-center text-emerald-700 font-bold">✅</td><td className="text-center text-emerald-700 font-bold">✅</td><td className="text-center text-emerald-700 font-bold">✅</td></tr>
                          <tr className="bg-stone-100 font-bold text-emerald-950"><td colSpan={9} className="p-2">4. Data Register</td></tr>
                          <tr><td className="p-2 pl-4">View Data</td><td className="text-center text-emerald-700 font-bold">✅</td><td className="text-center text-emerald-700 font-bold">✅</td><td className="text-center text-emerald-700 font-bold">✅</td><td className="text-center text-emerald-700 font-bold">✅</td><td className="text-center text-emerald-700 font-bold">✅</td><td className="text-center text-emerald-700 font-bold">✅</td><td className="text-center text-emerald-700 font-bold">✅</td><td className="text-center text-emerald-700 font-bold">✅</td></tr>
                          <tr><td className="p-2 pl-4">Insert / Edit / Delete / Export</td><td className="text-center text-emerald-700 font-bold">✅</td><td className="text-center text-emerald-700 font-bold">✅</td><td className="text-center text-red-400">❌</td><td className="text-center text-red-400">❌</td><td className="text-center text-red-400">❌</td><td className="text-center text-red-400">❌</td><td className="text-center text-red-400">❌</td><td className="text-center text-red-400">❌</td></tr>
                          <tr className="bg-stone-100 font-bold text-emerald-950"><td colSpan={9} className="p-2">5. Reservations & Check-In/Out</td></tr>
                          <tr><td className="p-2 pl-4">View Reservations & Check-In</td><td className="text-center text-emerald-700 font-bold">✅</td><td className="text-center text-emerald-700 font-bold">✅</td><td className="text-center text-emerald-700 font-bold">✅</td><td className="text-center text-emerald-700 font-bold">✅</td><td className="text-center text-red-400">❌</td><td className="text-center text-red-400">❌</td><td className="text-center text-red-400">❌</td><td className="text-center text-red-400">❌</td></tr>
                          <tr><td className="p-2 pl-4">Insert Booking Form</td><td className="text-center text-emerald-700 font-bold">✅</td><td className="text-center text-emerald-700 font-bold">✅</td><td className="text-center text-emerald-700 font-bold">✅</td><td className="text-center text-red-400">❌</td><td className="text-center text-red-400">❌</td><td className="text-center text-red-400">❌</td><td className="text-center text-red-400">❌</td><td className="text-center text-red-400">❌</td></tr>
                          <tr><td className="p-2 pl-4">Approve / Reschedule / Cancel Action</td><td className="text-center text-emerald-700 font-bold">✅</td><td className="text-center text-emerald-700 font-bold">✅</td><td className="text-center text-red-400">❌</td><td className="text-center text-emerald-700 font-bold">✅</td><td className="text-center text-red-400">❌</td><td className="text-center text-red-400">❌</td><td className="text-center text-red-400">❌</td><td className="text-center text-red-400">❌</td></tr>
                          <tr className="bg-stone-100 font-bold text-emerald-950"><td colSpan={9} className="p-2">7. Meals Services</td></tr>
                          <tr><td className="p-2 pl-4">Meals on Request View</td><td className="text-center text-emerald-700 font-bold">✅</td><td className="text-center text-emerald-700 font-bold">✅</td><td className="text-center text-emerald-700 font-bold">✅</td><td className="text-center text-emerald-700 font-bold">✅</td><td className="text-center text-emerald-700 font-bold">✅</td><td className="text-center text-red-400">❌</td><td className="text-center text-red-400">❌</td><td className="text-center text-red-400">❌</td></tr>
                          <tr><td className="p-2 pl-4">Insert Request Form</td><td className="text-center text-emerald-700 font-bold">✅</td><td className="text-center text-emerald-700 font-bold">✅</td><td className="text-center text-emerald-700 font-bold">✅</td><td className="text-center text-red-400">❌</td><td className="text-center text-emerald-700 font-bold">✅</td><td className="text-center text-red-400">❌</td><td className="text-center text-red-400">❌</td><td className="text-center text-red-400">❌</td></tr>
                          <tr><td className="p-2 pl-4">Approve / Cancel Request</td><td className="text-center text-emerald-700 font-bold">✅</td><td className="text-center text-emerald-700 font-bold">✅</td><td className="text-center text-red-400">❌</td><td className="text-center text-emerald-700 font-bold">✅</td><td className="text-center text-red-400">❌</td><td className="text-center text-red-400">❌</td><td className="text-center text-red-400">❌</td><td className="text-center text-red-400">❌</td></tr>
                          <tr className="bg-stone-100 font-bold text-emerald-950"><td colSpan={9} className="p-2">8. Laundry Services</td></tr>
                          <tr><td className="p-2 pl-4">Dropping & Distributing (Drop Form)</td><td className="text-center text-emerald-700 font-bold">✅</td><td className="text-center text-emerald-700 font-bold">✅</td><td className="text-center text-red-400">❌</td><td className="text-center text-red-400">❌</td><td className="text-center text-red-400">❌</td><td className="text-center text-emerald-700 font-bold">✅</td><td className="text-center text-red-400">❌</td><td className="text-center text-red-400">❌</td></tr>
                          <tr><td className="p-2 pl-4">Delivering & Returning (Deliver Form)</td><td className="text-center text-emerald-700 font-bold">✅</td><td className="text-center text-emerald-700 font-bold">✅</td><td className="text-center text-red-400">❌</td><td className="text-center text-red-400">❌</td><td className="text-center text-red-400">❌</td><td className="text-center text-red-400">❌</td><td className="text-center text-emerald-700 font-bold">✅</td><td className="text-center text-red-400">❌</td></tr>
                          <tr><td className="p-2 pl-4">Receiving & Cleaning (Laundry Detail Form)</td><td className="text-center text-emerald-700 font-bold">✅</td><td className="text-center text-emerald-700 font-bold">✅</td><td className="text-center text-red-400">❌</td><td className="text-center text-red-400">❌</td><td className="text-center text-red-400">❌</td><td className="text-center text-red-400">❌</td><td className="text-center text-red-400">❌</td><td className="text-center text-emerald-700 font-bold">✅</td></tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <form className="space-y-4" onSubmit={handleLogin}>
              {error && (
                <div className="bg-red-50/80 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <div className="w-1.5 h-full bg-red-500 rounded-full" />
                  {error}
                </div>
              )}

              <div className="space-y-1 group">
                <Label htmlFor="username" className="text-xs font-semibold text-emerald-900">
                  Username
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <UserIcon className="h-4 w-4 text-emerald-500" />
                  </div>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10 py-5 bg-white/60 w-full border-emerald-200 focus:ring-lime-400 focus:border-lime-400 rounded-xl text-sm"
                    placeholder="Enter username"
                  />
                </div>
              </div>

              <div className="space-y-1 group">
                <Label htmlFor="password" className="text-xs font-semibold text-emerald-900">
                  Password
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-emerald-500" />
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 py-5 bg-white/60 w-full border-emerald-200 focus:ring-lime-400 focus:border-lime-400 rounded-xl text-sm"
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-emerald-500 hover:text-emerald-700"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isLoading || isSuccess}
                  className="w-full flex justify-center items-center gap-2 py-5 px-4 rounded-xl shadow-md text-sm font-bold text-emerald-950 bg-lime-400 hover:bg-lime-500 transition-all hover:scale-[1.01]"
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

          <div className="mt-6 text-center text-xs font-medium text-emerald-600/70">
            &copy; {new Date().getFullYear()} GFS Ceria Accommodation System.
          </div>
        </div>
      </div>
    </div>
  );
}
