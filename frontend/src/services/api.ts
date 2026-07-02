import axios from 'axios';

const DEFAULT_API_PORT = import.meta.env.VITE_API_PORT || '31145';

const buildDefaultApiBaseUrl = () => {
  if (typeof window === 'undefined') {
    return `http://127.0.0.1:${DEFAULT_API_PORT}/api`;
  }

  const runtimeHost = import.meta.env.VITE_API_HOST || window.location.hostname || '127.0.0.1';
  return `http://${runtimeHost}:${DEFAULT_API_PORT}/api`;
};

const normalizeBaseUrl = (value: string) => value.replace(/\/+$/, '');

export const API_BASE_URL = normalizeBaseUrl(
  import.meta.env.VITE_API_BASE_URL || buildDefaultApiBaseUrl()
);

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
  getAreas: () => api.get('/data_register.php', { params: { action: 'get_areas' } }),
  getMesses: () => api.get('/data_register.php', { params: { action: 'get_messes' } }),
  getRooms: () => api.get('/data_register.php', { params: { action: 'get_rooms' } }),
  getMealsDp: () => api.get('/data_register.php', { params: { action: 'get_meals_dp' } }),
  getLaundryDp: () => api.get('/data_register.php', { params: { action: 'get_laundry_dp' } }),
  getLaundryBag: () => api.get('/data_register.php', { params: { action: 'get_laundry_bag' } }),
  getGuests: () => api.get('/data_register.php', { params: { action: 'get_guests' } }),
  create: (type: string, data: any) =>
    api.post('/data_register.php', data, { params: { action: `add_${type}` } }),
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
  getAll: (category?: string) => api.get('/rooms.php', { params: category ? { category } : undefined }),
  updateStatus: (id: string, status: string) => api.post(`/rooms.php`, { action: 'update_status', id, status }),
};

export const guestAPI = {
  getAll: () => api.get('/guests.php'),
  create: (data: any) => api.post('/guests.php', data),
};

export const reservationAPI = {
  getAll: () => api.get('/reservations.php'),
  create: (data: any) => api.post('/reservations.php', data),
  updateStatus: (id: string, status: string) => api.post(`/reservations.php`, { action: 'update_status', id, status }),
};

export const mealsAPI = {
  getSchedule: () => api.get('/meals.php', { params: { type: 'schedule' } }),
  getRequests: () => api.get('/meals.php', { params: { type: 'requests' } }),
  getDeliveryPoints: () => api.get('/meals.php', { params: { type: 'dp' } }),
  createRequest: (data: any) => api.post('/meals.php', { action: 'create_request', ...data }),
  approveRequest: (id: string, approvedBy: string) => api.post('/meals.php', { action: 'approve_request', id, approved_by: approvedBy }),
};

export const laundryAPI = {
  getAll: () => api.get('/laundry.php'),
  createDrop: (data: any) => api.post('/laundry.php?action=create_drop', data),
  deliverToLaundry: (boxId: string) => api.post('/laundry.php?action=deliver_to_laundry', { laundry_box_id: boxId }),
  receiveBag: (data: any) => api.post('/laundry.php?action=receive_bag', data),
  addDetails: (data: any) => api.post('/laundry.php?action=add_details', data),
  completeProcess: (bagId: string) => api.post('/laundry.php?action=complete_process', { laundry_bag_id: bagId }),
  returnToDrop: (boxId: string) => api.post('/laundry.php?action=return_to_drop', { laundry_box_id: boxId }),
  distributeToRoom: (bagId: string) => api.post('/laundry.php?action=distribute_to_room', { laundry_bag_id: bagId }),
};

export const dashboardAPI = {
  getStats: () => api.get('/dashboard.php'),
};

export const informationAPI = {
<<<<<<< HEAD
  getRooms: () => api.get('/information.php?type=room'),
  getPob: () => api.get('/information.php?type=pob'),
  getMeals: () => api.get('/information.php?type=meals'),
  getMeetingRooms: () => api.get('/information.php?type=meeting'),
=======
  getRooms: () => api.get('/information.php', { params: { type: 'room' } }),
  getPob: () => api.get('/information.php', { params: { type: 'pob' } }),
  getMeals: () => api.get('/information.php', { params: { type: 'meals' } }),
>>>>>>> 428d1d17bff55d9f07e205787a4304a5b25d4155
};

export default api;
