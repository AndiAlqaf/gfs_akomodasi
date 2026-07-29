import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search, UserCheck, ShieldCheck, Edit, Trash2, Key, Mail, User } from 'lucide-react';
import { PRESET_ACCOUNTS, UserAccount, RoleCode } from '@/config/roles';
import Swal from 'sweetalert2';

const ITEMS_PER_PAGE = 20;

const UserManagement: React.FC = () => {
  const [accounts, setAccounts] = useState<UserAccount[]>(PRESET_ACCOUNTS);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123');
  const [role, setRole] = useState<RoleCode>('admin');

  const filteredAccounts = accounts.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.username.toLowerCase().includes(search.toLowerCase()) ||
      a.role.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredAccounts.length / ITEMS_PER_PAGE));
  const paginatedAccounts = filteredAccounts.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleOpenDialog = (acc?: UserAccount) => {
    if (acc) {
      setEditingId(acc.id);
      setName(acc.name);
      setUsername(acc.username);
      setEmail(acc.email);
      setPassword(acc.password);
      setRole(acc.role);
    } else {
      setEditingId(null);
      setName('');
      setUsername('');
      setEmail('');
      setPassword('password123');
      setRole('admin');
    }
    setIsDialogOpen(true);
  };

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !username || !email) {
      return Swal.fire({ icon: 'warning', title: 'Attention', text: 'Please fill all required fields' });
    }

    const roleLabelMap: Record<RoleCode, string> = {
      super: 'SUPER (Super Admin)',
      admin: 'ADMIN (Administrator)',
      fron: 'FRON (Front Office)',
      supervisor: 'SUPERVISOR',
      canteen: 'CANTEEN (Canteen Officer)',
      laundr: 'LAUNDR (Laundry Dropper)',
      driver: 'DRIVER',
      laundry: 'LAUNDRY (Laundry Cleaning)'
    };

    if (editingId) {
      setAccounts(prev =>
        prev.map(a =>
          a.id === editingId
            ? { ...a, name, username, email, password, role, roleLabel: roleLabelMap[role] }
            : a
        )
      );
      Swal.fire({ icon: 'success', title: 'Success', text: 'User account modified successfully!', timer: 2000, showConfirmButton: false });
    } else {
      const newAcc: UserAccount = {
        id: (accounts.length + 1).toString(),
        name,
        username,
        email,
        password,
        role,
        roleLabel: roleLabelMap[role]
      };
      setAccounts(prev => [...prev, newAcc]);
      Swal.fire({ icon: 'success', title: 'Success', text: 'New user account created successfully!', timer: 2000, showConfirmButton: false });
    }

    setIsDialogOpen(false);
  };

  const handleDelete = (acc: UserAccount) => {
    if (acc.role === 'super' && accounts.filter(a => a.role === 'super').length <= 1) {
      return Swal.fire({ icon: 'error', title: 'Action Forbidden', text: 'Cannot delete the main Super Admin account!' });
    }

    Swal.fire({
      title: 'Delete Account?',
      text: `Are you sure you want to delete account ${acc.username}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Delete'
    }).then(res => {
      if (res.isConfirmed) {
        setAccounts(prev => prev.filter(a => a.id !== acc.id));
        Swal.fire({ icon: 'success', title: 'Deleted', text: 'Account deleted successfully', timer: 1500, showConfirmButton: false });
      }
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] w-full max-w-full min-w-0 overflow-hidden">
      <Card className="flex flex-col flex-1 border-0 shadow-sm rounded-xl overflow-hidden border-emerald-100 w-full min-w-0 max-w-full min-h-0">
        <CardHeader className="bg-white border-b border-emerald-100 flex flex-row items-center justify-between shrink-0 py-1.5 px-6">
          <div className="flex items-center gap-3">
            <CardTitle className="text-lg text-emerald-950 uppercase font-bold flex items-center gap-2">
              <UserCheck className="text-lime-600" /> Manage Access Accounts (User Name & Password)
            </CardTitle>
            <span className="text-xs font-semibold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full border border-emerald-200">
              Authority: SUPER ADMIN ONLY
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-emerald-600" />
              <Input
                placeholder="Search accounts..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="pl-9 w-64 border-emerald-200 focus:border-emerald-500 rounded-lg"
              />
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => handleOpenDialog()} className="bg-lime-400 text-emerald-950 hover:bg-lime-500 shadow-sm border border-lime-500/20 font-bold flex items-center gap-2 px-6 rounded-full">
                  <Plus size={18} /> Create New Account
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                  <DialogTitle className="text-emerald-950 text-xl uppercase font-bold flex items-center gap-2">
                    <UserCheck className="text-lime-600" /> {editingId ? 'Modify Access Account' : 'Create Access Account'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSaveAccount} className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-emerald-900 flex items-center gap-1">
                      <User size={14} /> FULL NAME
                    </label>
                    <Input value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. John Doe" className="bg-white" />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-emerald-900 flex items-center gap-1">
                      <UserCheck size={14} /> USERNAME
                    </label>
                    <Input value={username} onChange={e => setUsername(e.target.value)} required placeholder="e.g. johndoe" className="bg-white" />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-emerald-900 flex items-center gap-1">
                      <Mail size={14} /> EMAIL
                    </label>
                    <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="user@gfsceria.com" className="bg-white" />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-emerald-900 flex items-center gap-1">
                      <Key size={14} /> PASSWORD
                    </label>
                    <Input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="bg-white" />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-emerald-900 flex items-center gap-1">
                      <ShieldCheck size={14} /> ROLE LEVEL
                    </label>
                    <select
                      value={role}
                      onChange={e => setRole(e.target.value as RoleCode)}
                      className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                    >
                      <option value="super">SUPER (Super Admin)</option>
                      <option value="admin">ADMIN (Administrator)</option>
                      <option value="fron">FRON (Front Office)</option>
                      <option value="supervisor">SUPERVISOR</option>
                      <option value="canteen">CANTEEN (Canteen Officer)</option>
                      <option value="laundr">LAUNDR (Laundry Dropper)</option>
                      <option value="driver">DRIVER (Transport Driver)</option>
                      <option value="laundry">LAUNDRY (Laundry Station)</option>
                    </select>
                  </div>

                  <div className="md:col-span-2 flex justify-end gap-2 mt-4 pt-2 border-t">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                    <Button type="submit" className="bg-emerald-950 text-stone-50 hover:bg-emerald-900 font-bold px-8">
                      {editingId ? 'Save Modifications' : 'Create Account'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="p-6 bg-stone-50/50 flex-1 flex flex-col min-h-0 overflow-hidden ">
          <div className="w-full bg-white rounded-xl border border-emerald-100 shadow-sm relative overflow-hidden flex-1 flex flex-col max-h-full min-h-0">
            <div className="overflow-auto max-h-full min-h-0 flex-1 w-full relative">
              <table className="w-full min-w-max text-sm text-left whitespace-nowrap">
                <thead className="bg-emerald-950 text-stone-50 uppercase text-sm font-semibold sticky top-0 z-10">
                  <tr>
                    <th className="px-3 py-3 text-center">NO</th>
                    <th className="px-3 py-3">NAME</th>
                    <th className="px-3 py-3">USERNAME</th>
                    <th className="px-3 py-3">EMAIL</th>
                    <th className="px-3 py-3 text-center">ROLE CODE</th>
                    <th className="px-3 py-3">ROLE LEVEL</th>
                    <th className="px-3 py-3 text-center">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-50">
                  {paginatedAccounts.map((acc, idx) => (
                    <tr key={acc.id} className="hover:bg-emerald-50/50 transition-colors">
                      <td className="px-1 py-1 text-center font-medium text-emerald-950">{(page - 1) * ITEMS_PER_PAGE + idx + 1}</td>
                      <td className="px-1 py-1 font-semibold text-emerald-900">{acc.name}</td>
                      <td className="px-1 py-1 text-emerald-800 font-mono">{acc.username}</td>
                      <td className="px-1 py-1 text-emerald-700">{acc.email}</td>
                      <td className="px-1 py-1 text-center">
                        <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase bg-lime-100 text-emerald-900 border border-lime-300">
                          {acc.role}
                        </span>
                      </td>
                      <td className="px-1 py-1 text-emerald-800 font-medium">{acc.roleLabel}</td>
                      <td className="px-1 py-1 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:bg-blue-50" onClick={() => handleOpenDialog(acc)}>
                            <Edit size={16} />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:bg-red-50" onClick={() => handleDelete(acc)}>
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-3 border-t border-emerald-100 bg-stone-50/50 shrink-0 w-full">
              <div className="text-sm text-emerald-800">
                Showing <span className="font-semibold">{filteredAccounts.length > 0 ? (page - 1) * ITEMS_PER_PAGE + 1 : 0}</span> to <span className="font-semibold">{Math.min(page * ITEMS_PER_PAGE, filteredAccounts.length)}</span> of <span className="font-semibold">{filteredAccounts.length}</span> entries
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1}>Previous</Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <Button key={p} variant={page === p ? 'default' : 'outline'} size="sm" onClick={() => setPage(p)} className={page === p ? 'bg-emerald-600 text-white' : ''}>{p}</Button>
                ))}
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(p + 1, totalPages))} disabled={page === totalPages}>Next</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;
