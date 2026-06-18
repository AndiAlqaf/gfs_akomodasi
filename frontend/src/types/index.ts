export interface Area {
  id: string;
  name: string;
  areaId: string;
  registeredBy?: string;
  lastRegistration?: Date;
  remarks?: string;
}

export interface Mess {
  id: string;
  name: string;
  messId: string;
  areaId: string;
  areaName?: string;
  rooms: number;
  status: 'OWNED BY CERIA' | 'RENTAL';
  managedBy: string;
  registeredBy?: string;
  lastRegistration?: Date;
  remarks?: string;
}

export interface Room {
  id: string;
  roomNo: string;
  messId: string;
  messName: string;
  areaName: string;
  allocation: 'REGULAR GUEST' | 'SPECIAL GUEST' | 'EXECUTIVE/VIPs GUEST';
  beds: number;
  status: 'READY' | 'UNDER REPAIRED' | 'OUT OF ORDER';
  registeredBy?: string;
  lastRegistration?: Date;
  remarks?: string;
}

export interface Guest {
  id: string;
  name: string;
  personalId: string;
  jobRegIdCard: string;
  position: string;
  level: string;
  category: 'REGULAR GUEST' | 'SPECIAL GUEST' | 'EXECUTIVE/VIPs GUEST';
  institution: string;
}

export interface Reservation {
  id: string;
  roomNo: string;
  messName: string;
  area: string;
  guestId: string;
  guestName: string;
  estimatedArrival?: Date;
  estimatedDeparture?: Date;
  checkIn?: Date;
  checkOut?: Date;
  guestStatus: 'SCHEDULED' | 'ON SITE' | 'OFF SITE';
  remarks?: string;
}

export interface MealsService {
  id: string;
  date: Date;
  roomNo: string;
  mess: string;
  guestName: string;
  mealsPackage: 'STANDARD BUFFET' | 'ROOM DELIVERY' | 'VIP BUFFET';
  deliveryPoint: string;
  breakfast: boolean;
  lunch: boolean;
  dinner: boolean;
  numberOfPacks?: number;
  remarks?: string;
}

export interface MealsRequest {
  id: string;
  date: Date;
  guests: string;
  requestedBy: string;
  approvedBy?: string;
  mealsPackage: 'STANDARD BUFFET' | 'ROOM DELIVERY' | 'VIP BUFFET';
  deliveryPoint: string;
  mealTime: 'BREAKFAST' | 'LUNCH' | 'DINNER';
  numberOfPacks: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  remarks?: string;
}

export interface LaundryService {
  id: string;
  date: Date;
  roomNo: string;
  mess: string;
  guestName: string;
  laundryBagId: string;
  laundryBox: string;
  servicePackage: 'REGULAR' | 'EXPRESS';
  dropPoint: string;
  deliveryPoint: string;
  status: 'COLLECTED_DIRTY' | 'IN_TRANSIT_DIRTY' | 'RECEIVED_AT_LAUNDRY' | 'REJECTED' | 'WEIGHED' | 'WASHING' | 'IRONING' | 'PACKING' | 'CHECKED_CLEAN' | 'IN_TRANSIT_CLEAN' | 'DELIVERED_ROOM' | 'COMPLETED';
  weight?: number;
  numberOfPcs?: number;
  droppedBy?: string;
  droppedDate?: Date;
  deliveredBy?: string;
  deliveredDate?: Date;
  receivedBy?: string;
  receivedDate?: Date;
  completedDate?: Date;
  bagStatus?: 'ACCEPTED' | 'REJECTED';
  remarks?: string;
}

export interface LaundryDetail {
  id: string;
  laundryServiceId: string;
  itemType: string;
  quantity: number;
  condition: 'COMPLETE' | 'INCOMPLETE';
  photoUrl?: string;
}

export interface DashboardStats {
  totalRooms: number;
  occupiedRooms: number;
  availableRooms: number;
  underRepair: number;
  totalGuests: number;
  onSiteGuests: number;
  mealsToday: number;
  laundryInProcess: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'front_desk' | 'office_boy' | 'driver' | 'laundry_coordinator' | 'laundry_officer' | 'laundry_crew' | 'canteen_officer';
}
