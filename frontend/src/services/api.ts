import axios from 'axios';

const DEFAULT_API_PORT = import.meta.env.VITE_API_PORT || '31145';

const buildDefaultApiBaseUrl = () => {
  if (typeof window === 'undefined') {
    return `http://127.0.0.1:${DEFAULT_API_PORT}`;
  }

  const runtimeHost = import.meta.env.VITE_API_HOST || window.location.hostname || '127.0.0.1';
  return `http://${runtimeHost}:${DEFAULT_API_PORT}`;
};

const normalizeBaseUrl = (value: string) => value.replace(/\/+$/, '');

export const API_BASE_URL = normalizeBaseUrl(
  import.meta.env.VITE_API_BASE_URL || buildDefaultApiBaseUrl()
) + '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error || error.message || 'API request failed';
    return Promise.reject(new Error(message));
  }
);

export const areaAPI = {
  getAll: () => api.get('/areas'),
  getById: (id: string) => api.get(`/areas/${id}`),
  create: (data: any) => api.post('/areas', data),
  update: (id: string, data: any) => api.put(`/areas/${id}`, data),
  delete: (id: string) => api.delete(`/areas/${id}`),
};

export const dataRegisterAPI = {
  getAreas: () => api.get('/data-register', { params: { action: 'get_areas' } }),
  getMesses: () => api.get('/data-register', { params: { action: 'get_messes' } }),
  getRooms: () => api.get('/data-register', { params: { action: 'get_rooms' } }),
  getMealsDp: () => api.get('/data-register', { params: { action: 'get_meals_dp' } }),
  getLaundryDp: () => api.get('/data-register', { params: { action: 'get_laundry_dp' } }),
  getLaundryBag: () => api.get('/data-register', { params: { action: 'get_laundry_bag' } }),
  getGuests: () => api.get('/data-register', { params: { action: 'get_guests' } }),
  getMeetingRooms: () => api.get('/data-register', { params: { action: 'get_meeting_rooms' } }),
  create: (type: string, data: any) =>
    api.post('/data-register', data, { params: { action: `add_${type}` } }),
  update: (type: string, id: string | number, data: any) =>
    api.post('/data-register', { id, ...data }, { params: { action: `update_${type}` } }),
  delete: (type: string, id: string | number) =>
    api.post('/data-register', { id }, { params: { action: `delete_${type}` } }),
};

export const messAPI = {
  getAll: () => api.get('/mess'),
  getById: (id: string) => api.get(`/mess/${id}`),
  getByArea: (areaId: string) => api.get(`/mess/area/${areaId}`),
  create: (data: any) => api.post('/mess', data),
  update: (id: string, data: any) => api.put(`/mess/${id}`, data),
  delete: (id: string) => api.delete(`/mess/${id}`),
};

export const roomAPI = {
  getAll: (category?: string) => api.get('/rooms', { params: category ? { category } : undefined }),
  updateStatus: (id: string, status: string) => api.post(`/rooms/status`, { id, status }),
};

export const guestAPI = {
  getAll: () => api.get('/guests'),
  create: (data: any) => api.post('/guests', data),
};

export const reservationAPI = {
  getAll: () => api.get('/reservations'),
  create: (data: any) => api.post('/reservations', data),
  updateStatus: (id: string, status: string, estimated_arrival?: string, estimated_departure?: string) =>
    api.post(`/reservations`, { action: 'update_status', id, status, estimated_arrival, estimated_departure }),
};

export const meetingRoomAPI = {
  getAll: () => api.get('/meeting-rooms'),
  book: (data: any) => api.post('/meeting-rooms', { action: 'book', ...data }),
  cancel: (id: string | number, room?: string) => api.post('/meeting-rooms', { action: 'cancel', id, room }),
};

export const mealsAPI = {
  getSchedule: () => api.get('/meals', { params: { type: 'schedule' } }),
  getRequests: () => api.get('/meals', { params: { type: 'requests' } }),
  getDeliveryPoints: () => api.get('/meals', { params: { type: 'dp' } }),
  createRequest: (data: any) => api.post('/meals/request', data),
  approveRequest: (id: string, approvedBy: string) => api.post('/meals/approve', { id, approved_by: approvedBy }),
};

export const laundryAPI = {
  getAll: () => api.get('/laundry'),
  getData: () => api.get('/laundry'),
  createDrop: (data: any) => api.post('/laundry', { action: 'create_drop', ...data }),
  deliverToLaundry: (boxId: string) => api.post('/laundry', { action: 'deliver_to_laundry', laundry_box_id: boxId }),
  receiveBag: (data: any) => api.post('/laundry', { action: 'receive_bag', ...data }),
  addDetails: (data: any) => api.post('/laundry', { action: 'add_details', ...data }),
  completeProcess: (bagId: string) => api.post('/laundry', { action: 'complete_process', laundry_bag_id: bagId }),
  returnToDrop: (boxId: string) => api.post('/laundry', { action: 'return_to_drop', laundry_box_id: boxId }),
  distributeToRoom: (bagId: string) => api.post('/laundry', { action: 'distribute_to_room', laundry_bag_id: bagId }),
  updateAction: (action: string, id: string, data?: any) => {
    if (action === 'deliver') return api.post('/laundry', { action: 'deliver_to_laundry', laundry_box_id: id });
    if (action === 'return') return api.post('/laundry', { action: 'return_to_drop', laundry_box_id: id });
    if (action === 'receive') return api.post('/laundry', { action: 'receive_bag', laundry_bag_id: id, ...data });
    if (action === 'add_details') return api.post('/laundry', { action: 'add_details', ...data });
    if (action === 'complete') return api.post('/laundry', { action: 'complete_process', laundry_bag_id: id });
    if (action === 'distribute') return api.post('/laundry', { action: 'distribute_to_room', laundry_bag_id: id });
    return api.get('/laundry');
  }
};

export const dashboardAPI = {
  getStats: () => api.get('/dashboard'),
};

export const informationAPI = {
  getRooms: () => api.get('/information', { params: { type: 'room' } }),
  getPob: () => api.get('/information', { params: { type: 'pob' } }),
  getMealsDelivery: () => api.get('/information', { params: { type: 'meals_delivery' } }),
  getMealsInfo: () => api.get('/information', { params: { type: 'meals_info' } }),
  getMeetingRooms: () => api.get('/information', { params: { type: 'meeting' } }),
};

export default api;
