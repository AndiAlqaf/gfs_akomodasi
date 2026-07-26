export type RoleCode = 
  | 'super' 
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

export const PRESET_ACCOUNTS: UserAccount[] = [
  {
    id: '1',
    name: 'Super Administrator',
    username: 'superadmin',
    password: 'password123',
    email: 'superadmin@gfsceria.com',
    role: 'super',
    roleLabel: 'SUPER (Super Admin)'
  },
  {
    id: '2',
    name: 'System Administrator',
    username: 'admin',
    password: 'password123',
    email: 'admin@gfsceria.com',
    role: 'admin',
    roleLabel: 'ADMIN (Administrator)'
  },
  {
    id: '3',
    name: 'Front Office Staff',
    username: 'frontoffice',
    password: 'password123',
    email: 'frontoffice@gfsceria.com',
    role: 'fron',
    roleLabel: 'FRON (Front Office)'
  },
  {
    id: '4',
    name: 'Supervisor Staff',
    username: 'supervisor',
    password: 'password123',
    email: 'supervisor@gfsceria.com',
    role: 'supervisor',
    roleLabel: 'SUPERVISOR'
  },
  {
    id: '5',
    name: 'Canteen Officer',
    username: 'canteen',
    password: 'password123',
    email: 'canteen@gfsceria.com',
    role: 'canteen',
    roleLabel: 'CANTEEN (Canteen Officer)'
  },
  {
    id: '6',
    name: 'Laundry Dropper',
    username: 'laundrydrop',
    password: 'password123',
    email: 'laundrydrop@gfsceria.com',
    role: 'laundr',
    roleLabel: 'LAUNDR (Laundry Dropper)'
  },
  {
    id: '7',
    name: 'Transport Driver',
    username: 'driver',
    password: 'password123',
    email: 'driver@gfsceria.com',
    role: 'driver',
    roleLabel: 'DRIVER'
  },
  {
    id: '8',
    name: 'Laundry Cleaner',
    username: 'laundry',
    password: 'password123',
    email: 'laundry@gfsceria.com',
    role: 'laundry',
    roleLabel: 'LAUNDRY (Laundry Cleaning)'
  }
];

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

export function hasPermission(role: RoleCode | string | undefined, allowedRoles: string[]): boolean {
  if (!role) return false;
  return allowedRoles.includes(role);
}
