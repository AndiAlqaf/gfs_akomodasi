import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search, UserCheck, ShieldCheck, Edit, Trash2, Key, Mail, User, Eye, EyeOff, Lock } from 'lucide-react';
import { UserAccount, RoleCode, ROLE_LABELS, getStoredAccounts, saveStoredAccounts, normalizeRole, getRoleLabel } from '@/config/roles';
import { userAPI } from '@/services/api';
import Swal from 'sweetalert2';

const ITEMS_PER_PAGE = 20;

const UserManagement: React.FC = () => {
  const [accounts, setAccounts] = useState<UserAccount[]>(() => getStoredAccounts());
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showModalPassword, setShowModalPassword] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<RoleCode>('admin');

  const fetchAccounts = async () => {
    try {
      const resp = await userAPI.getAll();
      const rows = resp?.data?.data;
      if (Array.isArray(rows) && rows.length > 0) {
        const mapped: UserAccount[] = rows.map((r: any) => {
          const roleCode = normalizeRole(r.role || 'admin');
          return {
            id: String(r.id),
            name: r.name || '',
            username: r.username || '',
            password: r.password || 'password123',
            email: r.email || `${r.username || 'user'}@gfsceria.com`,
            role: roleCode,
            roleLabel: getRoleLabel(roleCode),
          };
        });
        setAccounts(mapped);
        saveStoredAccounts(mapped);
      }
    } catch {
      // Fallback to stored accounts if backend is not reachable
      setAccounts(getStoredAccounts());
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const toggleRowPassword = (id: string) => {
    setVisiblePasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredAccounts = accounts.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.username.toLowerCase().includes(search.toLowerCase()) ||
      a.role.toLowerCase().includes(search.toLowerCase()) ||
      a.roleLabel.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredAccounts.length / ITEMS_PER_PAGE));
  const paginatedAccounts = filteredAccounts.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleOpenDialog = (acc?: UserAccount) => {
    setShowModalPassword(false);
    if (acc) {
      setEditingId(acc.id);
      setName(acc.name);
      setUsername(acc.username);
      setEmail(acc.email);
      setPassword(acc.password);
      setRole(normalizeRole(acc.role));
    } else {
      setEditingId(null);
      setName('');
      setUsername('');
      setEmail('');
      setPassword('');
      setRole('admin');
    }
    setIsDialogOpen(true);
  };

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    const cleanUsername = username.trim();
    const cleanEmail = email.trim() || `${cleanUsername.toLowerCase().replace(/[^a-z0-9._-]/g, '')}@gfsceria.com`;

    if (!cleanName || !cleanUsername || !password) {
      return Swal.fire({ icon: 'warning', title: 'Perhatian', text: 'Nama, Username, dan Password wajib diisi!' });
    }

    setIsSubmitting(true);
    try {
      if (editingId) {
        try {
          await userAPI.update({
            id: editingId,
            name: cleanName,
            username: cleanUsername,
            email: cleanEmail,
            password,
            role,
          });
          await fetchAccounts();
        } catch (err: any) {
          // Update local storage state if offline, or show validation error if duplicate
          if (err?.message && err.message.includes('sudah digunakan')) {
            throw err;
          }
          const updated = accounts.map((a) =>
            a.id === editingId
              ? { ...a, name: cleanName, username: cleanUsername, email: cleanEmail, password, role, roleLabel: getRoleLabel(role) }
              : a
          );
          setAccounts(updated);
          saveStoredAccounts(updated);
        }
        Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Akun role berhasil diperbarui!', timer: 1800, showConfirmButton: false });
      } else {
        try {
          await userAPI.create({
            name: cleanName,
            username: cleanUsername,
            email: cleanEmail,
            password,
            role,
          });
          await fetchAccounts();
        } catch (err: any) {
          if (err?.message && err.message.includes('sudah digunakan')) {
            throw err;
          }
          const newAcc: UserAccount = {
            id: String(Date.now()),
            name: cleanName,
            username: cleanUsername,
            email: cleanEmail,
            password,
            role,
            roleLabel: getRoleLabel(role),
          };
          const updated = [...accounts, newAcc];
          setAccounts(updated);
          saveStoredAccounts(updated);
        }
        Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Akun role baru berhasil ditambahkan!', timer: 1800, showConfirmButton: false });
      }
      setIsDialogOpen(false);
    } catch (err: any) {
      Swal.fire({ icon: 'error', title: 'Gagal Menyimpan', text: err?.message || 'Terjadi kesalahan saat menyimpan akun.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (acc: UserAccount) => {
    if (normalizeRole(acc.role) === 'super' && accounts.filter((a) => normalizeRole(a.role) === 'super').length <= 1) {
      return Swal.fire({ icon: 'error', title: 'Tidak Diizinkan', text: 'Akun Super Admin utama tidak boleh dihapus!' });
    }

    Swal.fire({
      title: 'Hapus Akun Role?',
      text: `Apakah Anda yakin ingin menghapus akun "${acc.username}" (${acc.roleLabel})?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
    }).then(async (res) => {
      if (res.isConfirmed) {
        try {
          await userAPI.delete(acc.id);
          await fetchAccounts();
        } catch {
          const updated = accounts.filter((a) => a.id !== acc.id);
          setAccounts(updated);
          saveStoredAccounts(updated);
        }
        Swal.fire({ icon: 'success', title: 'Terhapus', text: 'Akun berhasil dihapus.', timer: 1500, showConfirmButton: false });
      }
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] w-full max-w-full min-w-0 overflow-hidden">
      <Card className="flex flex-col flex-1 border-0 shadow-sm rounded-xl overflow-hidden border-emerald-100 w-full min-w-0 max-w-full min-h-0">
        <CardHeader className="bg-white border-b border-emerald-100 flex flex-row items-center justify-between shrink-0 py-2.5 px-6">
          <div className="flex items-center gap-3">
            <CardTitle className="text-lg text-emerald-950 uppercase font-bold flex items-center gap-2">
              <UserCheck className="text-lime-600" /> Super Admin — Manage Role Accounts
            </CardTitle>
            <span className="text-xs font-semibold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full border border-emerald-200">
              Authority: SUPER ADMIN ONLY
            </span>
            <span className="hidden sm:inline-flex text-xs font-semibold bg-stone-100 text-stone-700 px-2.5 py-0.5 rounded-full border border-stone-200 items-center gap-1.5" title="Password di MySQL terenkripsi AES-256 dan hanya didekripsi untuk Super Admin">
              <Lock size={12} className="text-emerald-700" /> DB AES-256 Encrypted
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-emerald-600" />
              <Input
                placeholder="Cari nama, username, atau role..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9 w-64 border-emerald-200 focus:border-emerald-500 rounded-lg"
              />
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => handleOpenDialog()}
                  className="bg-lime-400 text-emerald-950 hover:bg-lime-500 shadow-sm border border-lime-500/20 font-bold flex items-center gap-2 px-6 rounded-full"
                >
                  <Plus size={18} /> Add Role Account
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                  <DialogTitle className="text-emerald-950 text-xl uppercase font-bold flex items-center gap-2">
                    <UserCheck className="text-lime-600" /> {editingId ? 'Edit Akun Role' : 'Tambah Akun Role Baru'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSaveAccount} className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-emerald-900 flex items-center gap-1">
                      <ShieldCheck size={14} /> PILIH ROLE
                    </label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as RoleCode)}
                      className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-emerald-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                    >
                      <option value="admin">ADMIN (Administrator)</option>
                      <option value="fron">FRON (Front Office)</option>
                      <option value="supervisor">SUPERVISOR</option>
                      <option value="canteen">CANTEEN (Canteen Officer)</option>
                      <option value="laundr">LAUNDR (Laundry Dropper)</option>
                      <option value="driver">DRIVER (Transport Driver)</option>
                      <option value="laundry">LAUNDRY (Laundry Cleaning)</option>
                      <option value="super">SUPER ADMIN (Master Role Manager)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-emerald-900 flex items-center gap-1">
                      <User size={14} /> NAMA LENGKAP / JABATAN
                    </label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      maxLength={150}
                      placeholder="Contoh: Front Office Staff"
                      className="bg-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-emerald-900 flex items-center gap-1">
                      <UserCheck size={14} /> USERNAME
                    </label>
                    <Input
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      maxLength={100}
                      placeholder="Contoh: frontoffice"
                      className="bg-white font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-emerald-900 flex items-center gap-1">
                      <Key size={14} /> PASSWORD
                    </label>
                    <div className="relative">
                      <Input
                        type={showModalPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        maxLength={255}
                        placeholder="Masukkan password"
                        className="bg-white pr-10 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowModalPassword(!showModalPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-emerald-600 hover:text-emerald-800"
                      >
                        {showModalPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-emerald-900 flex items-center gap-1">
                      <Mail size={14} /> EMAIL (OPSIONAL)
                    </label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      maxLength={150}
                      placeholder="Otomatis terisi jika dikosongkan (user@gfsceria.com)"
                      className="bg-white"
                    />
                  </div>

                  <div className="md:col-span-2 flex justify-end gap-2 mt-4 pt-2 border-t">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Batal
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-emerald-950 text-stone-50 hover:bg-emerald-900 font-bold px-8"
                    >
                      {isSubmitting ? 'Menyimpan...' : editingId ? 'Simpan Perubahan' : 'Buat Akun Role'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="p-6 bg-stone-50/50 flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="w-full bg-white rounded-xl border border-emerald-100 shadow-sm relative overflow-hidden flex-1 flex flex-col max-h-full min-h-0">
            <div className="overflow-auto max-h-full min-h-0 flex-1 w-full relative">
              <table className="w-full min-w-max text-sm text-left whitespace-nowrap">
                <thead className="bg-emerald-950 text-stone-50 uppercase text-sm font-semibold sticky top-0 z-10">
                  <tr>
                    <th className="px-3 py-3 text-center">NO</th>
                    <th className="px-3 py-3">NAME</th>
                    <th className="px-3 py-3">USERNAME</th>
                    <th className="px-3 py-3">PASSWORD</th>
                    <th className="px-3 py-3">EMAIL</th>
                    <th className="px-3 py-3 text-center">ROLE CODE</th>
                    <th className="px-3 py-3">ROLE LEVEL</th>
                    <th className="px-3 py-3 text-center">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-50">
                  {paginatedAccounts.map((acc, idx) => {
                    const isPwVisible = Boolean(visiblePasswords[acc.id]);
                    return (
                      <tr key={acc.id} className="hover:bg-emerald-50/50 transition-colors">
                        <td className="px-3 py-2 text-center font-medium text-emerald-950">
                          {(page - 1) * ITEMS_PER_PAGE + idx + 1}
                        </td>
                        <td className="px-3 py-2 font-semibold text-emerald-900">{acc.name}</td>
                        <td className="px-3 py-2 text-emerald-800 font-mono font-semibold">{acc.username}</td>
                        <td className="px-3 py-2 font-mono text-emerald-900">
                          <div className="inline-flex items-center gap-2 bg-stone-100 px-2.5 py-1 rounded-md border border-stone-200">
                            <span>{isPwVisible ? acc.password : '••••••••'}</span>
                            <button
                              type="button"
                              onClick={() => toggleRowPassword(acc.id)}
                              className="text-emerald-600 hover:text-emerald-900"
                              title={isPwVisible ? 'Sembunyikan password' : 'Lihat password'}
                            >
                              {isPwVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                          </div>
                        </td>
                        <td className="px-3 py-2 text-emerald-700">{acc.email}</td>
                        <td className="px-3 py-2 text-center">
                          <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase bg-lime-100 text-emerald-900 border border-lime-300">
                            {acc.role}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-emerald-800 font-medium">{acc.roleLabel}</td>
                        <td className="px-3 py-2 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-blue-600 hover:bg-blue-50"
                              onClick={() => handleOpenDialog(acc)}
                              title="Edit Username / Password / Role"
                            >
                              <Edit size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-600 hover:bg-red-50"
                              onClick={() => handleDelete(acc)}
                              title="Hapus Akun"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-3 border-t border-emerald-100 bg-stone-50/50 shrink-0 w-full">
              <div className="text-sm text-emerald-800">
                Showing <span className="font-semibold">{filteredAccounts.length > 0 ? (page - 1) * ITEMS_PER_PAGE + 1 : 0}</span> to{' '}
                <span className="font-semibold">{Math.min(page * ITEMS_PER_PAGE, filteredAccounts.length)}</span> of{' '}
                <span className="font-semibold">{filteredAccounts.length}</span> entries
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(p - 1, 1))} disabled={page === 1}>
                  Previous
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p >= Math.floor((page - 1) / 10) * 10 + 1 && p <= Math.floor((page - 1) / 10) * 10 + 10)
                  .map((p) => (
                    <Button
                      key={p}
                      variant={page === p ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPage(p)}
                      className={page === p ? 'bg-emerald-600 text-white' : ''}
                    >
                      {p}
                    </Button>
                  ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;
