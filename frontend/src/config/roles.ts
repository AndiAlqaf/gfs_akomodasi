export type RoleCode = 
  | 'super' 
  | 'superadmin'
  | 'admin' 
  | 'fron' 
  | 'supervisor' 
  | 'canteen' 
  | 'laundr' 
  | 'driver' 
  | 'laundry';

export interface UserAccount {
  id: string;
  name: string;
  username: string;
  password: string;
  email: string;
  role: RoleCode;
  roleLabel: string;
}

export const ROLE_LABELS: Record<string, string> = {
  super: 'SUPER ADMIN (Master Role Manager)',
  superadmin: 'SUPER ADMIN (Master Role Manager)',
  admin: 'ADMIN (Administrator)',
  fron: 'FRON (Front Office)',
  frontoffice: 'FRON (Front Office)',
  supervisor: 'SUPERVISOR',
  canteen: 'CANTEEN (Canteen Officer)',
  laundr: 'LAUNDR (Laundry Dropper)',
  laundrydrop: 'LAUNDR (Laundry Dropper)',
  driver: 'DRIVER (Transport Driver)',
  laundry: 'LAUNDRY (Laundry Cleaning)',
};

export function normalizeRole(role: string | undefined | null): RoleCode {
  if (!role) return 'super';
  const clean = String(role).trim().toLowerCase();
  if (
    clean === 'super' || 
    clean === 'superadmin' || 
    clean === 'super_admin' || 
    clean === 'super admin' || 
    clean.includes('super')
  ) {
    return 'super';
  }
  if (clean === 'frontoffice' || clean === 'front_office' || clean === 'front office' || clean === 'fron') {
    return 'fron';
  }
  if (clean === 'laundrydrop' || clean === 'laundry_drop' || clean === 'laundr') {
    return 'laundr';
  }
  if (clean === 'admin' || clean === 'administrator') {
    return 'admin';
  }
  if (clean === 'supervisor') {
    return 'supervisor';
  }
  if (clean === 'canteen') {
    return 'canteen';
  }
  if (clean === 'driver') {
    return 'driver';
  }
  if (clean === 'laundry') {
    return 'laundry';
  }
  return clean as RoleCode;
}

export function getRoleLabel(role: string | undefined | null): string {
  if (!role) return ROLE_LABELS.super;
  const normalized = normalizeRole(role);
  return ROLE_LABELS[normalized] || ROLE_LABELS[role] || String(role).toUpperCase();
}

export const PRESET_ACCOUNTS: UserAccount[] = [
  {
    id: '1',
    name: 'Super Administrator',
    username: 'superadmin',
    password: 'password123',
    email: 'superadmin@gfsceria.com',
    role: 'super',
    roleLabel: ROLE_LABELS.super
  },
  {
    id: '2',
    name: 'System Administrator',
    username: 'admin',
    password: 'password123',
    email: 'admin@gfsceria.com',
    role: 'admin',
    roleLabel: ROLE_LABELS.admin
  },
  {
    id: '3',
    name: 'Front Office Staff',
    username: 'frontoffice',
    password: 'password123',
    email: 'frontoffice@gfsceria.com',
    role: 'fron',
    roleLabel: ROLE_LABELS.fron
  },
  {
    id: '4',
    name: 'Supervisor Staff',
    username: 'supervisor',
    password: 'password123',
    email: 'supervisor@gfsceria.com',
    role: 'supervisor',
    roleLabel: ROLE_LABELS.supervisor
  },
  {
    id: '5',
    name: 'Canteen Officer',
    username: 'canteen',
    password: 'password123',
    email: 'canteen@gfsceria.com',
    role: 'canteen',
    roleLabel: ROLE_LABELS.canteen
  },
  {
    id: '6',
    name: 'Laundry Dropper',
    username: 'laundrydrop',
    password: 'password123',
    email: 'laundrydrop@gfsceria.com',
    role: 'laundr',
    roleLabel: ROLE_LABELS.laundr
  },
  {
    id: '7',
    name: 'Transport Driver',
    username: 'driver',
    password: 'password123',
    email: 'driver@gfsceria.com',
    role: 'driver',
    roleLabel: ROLE_LABELS.driver
  },
  {
    id: '8',
    name: 'Laundry Cleaner',
    username: 'laundry',
    password: 'password123',
    email: 'laundry@gfsceria.com',
    role: 'laundry',
    roleLabel: ROLE_LABELS.laundry
  },
  {
    id: '9',
    name: 'Hermansyah Marzuki',
    username: 'hermansm',
    password: 'gfs04',
    email: 'hermansyah.marzuki@cmprima.com',
    role: 'admin',
    roleLabel: ROLE_LABELS.admin
  },
  {
    id: '10',
    name: 'Muhammad Idul',
    username: 'muhIdul',
    password: '654321',
    email: 'muhammad.idul@cerindocorp.co.id',
    role: 'admin',
    roleLabel: ROLE_LABELS.admin
  },
  {
    id: '11',
    name: 'Ummu Atia Ahmad',
    username: 'ummua',
    password: '280900',
    email: 'ummu.ahmad@cerindocorp.co.id',
    role: 'admin',
    roleLabel: ROLE_LABELS.admin
  }
];

const ACCOUNTS_STORAGE_KEY = 'silaria_accounts_cache_v2';

export function getStoredAccounts(): UserAccount[] {
  if (typeof window === 'undefined') return PRESET_ACCOUNTS;
  try {
    const raw = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
    if (!raw) return PRESET_ACCOUNTS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      const mapped: UserAccount[] = parsed.map((acc: any) => ({
        id: String(acc.id),
        name: acc.name || '',
        username: acc.username || '',
        password: acc.password || 'password123',
        email: acc.email || `${acc.username || 'user'}@gfsceria.com`,
        role: (acc.role || 'admin') as RoleCode,
        roleLabel: ROLE_LABELS[(acc.role || 'admin') as RoleCode] || String(acc.role || '').toUpperCase(),
      }));

      // Ensure any newly added preset accounts (e.g. hermansm, muhIdul, ummua) are present
      for (const preset of PRESET_ACCOUNTS) {
        const exists = mapped.some(
          (m) => m.username.toLowerCase() === preset.username.toLowerCase()
        );
        if (!exists) {
          mapped.push(preset);
        }
      }
      return mapped;
    }
  } catch {
    // fallback to preset
  }
  return PRESET_ACCOUNTS;
}

export function saveStoredAccounts(accounts: UserAccount[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
  } catch {
    // ignore storage errors
  }
}

export const ROLE_PERMISSIONS = {
  // 1. Manage Access Account (User Name & Password)
  manageAccounts: {
    create: ['super'],
    modify: ['super'],
    delete: ['super'],
  },
  // 2. Batch Data Excel
  batchDataExcel: {
    import: ['super'],
  },
  // 3. Dashboard
  dashboard: {
    view: ['super', 'admin', 'fron', 'supervisor', 'canteen', 'laundr', 'driver', 'laundry'],
  },
  // 4. Data Register
  dataRegister: {
    view: ['super', 'admin', 'fron', 'supervisor', 'canteen', 'laundr', 'driver', 'laundry'],
    insert: ['super', 'admin'],
    edit: ['super', 'admin'],
    delete: ['super', 'admin'],
    download: ['super', 'admin'],
  },
  // 5. Reservation & Check-In/Out
  reservations: {
    bedroomView: ['super', 'admin', 'fron', 'supervisor'],
    bedroomInsert: ['super', 'admin', 'fron'],
    bedroomAction: ['super', 'admin', 'supervisor'],
    meetingView: ['super', 'admin', 'fron', 'supervisor'],
    meetingInsert: ['super', 'admin', 'fron'],
    meetingAction: ['super', 'admin', 'supervisor'],
    checkInOutView: ['super', 'admin', 'fron', 'supervisor'],
    checkInOutAction: ['super', 'admin', 'fron', 'supervisor'],
  },
  // 6. Information
  information: {
    view: ['super', 'admin', 'fron', 'supervisor', 'canteen', 'laundr', 'driver', 'laundry'],
  },
  // 7. Meals Services
  meals: {
    requestView: ['super', 'admin', 'fron', 'supervisor', 'canteen'],
    requestInsert: ['super', 'admin', 'fron', 'canteen'],
    requestAction: ['super', 'admin', 'supervisor'],
    scheduleView: ['super', 'admin', 'fron', 'supervisor', 'canteen', 'driver'],
    deliveryView: ['super', 'admin', 'fron', 'supervisor', 'canteen', 'driver'],
  },
  // 8. Laundry Services
  laundry: {
    droppingView: ['super', 'admin', 'supervisor', 'laundr', 'driver', 'laundry'],
    droppingInsert: ['super', 'admin', 'laundr'],
    droppingEdit: ['super', 'admin', 'laundr'],
    droppingDelete: ['super', 'admin', 'laundr'],
    
    deliveringView: ['super', 'admin', 'supervisor', 'laundr', 'driver', 'laundry'],
    deliveringInsert: ['super', 'admin', 'driver'],
    deliveringEdit: ['super', 'admin', 'driver'],
    deliveringDelete: ['super', 'admin', 'driver'],
    
    receivingView: ['super', 'admin', 'supervisor', 'laundr', 'driver', 'laundry'],
    receivingInsert: ['super', 'admin', 'laundry'],
    receivingEdit: ['super', 'admin', 'laundry'],
    receivingDelete: ['super', 'admin', 'laundry'],
  }
};

export function hasPermission(role: RoleCode | string | undefined | null, allowedRoles: string[]): boolean {
  if (!role) return false;
  const normalized = normalizeRole(role);
  
  // Super Admin has master authority over all modules and actions
  if (normalized === 'super') return true;

  const lowerAllowed = allowedRoles.map((r) => r.toLowerCase().trim());
  return lowerAllowed.includes(normalized) || lowerAllowed.includes(String(role).toLowerCase().trim());
}
