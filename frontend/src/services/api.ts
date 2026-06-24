import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost/gfs_akomodasi/backend';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
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

export const areaAPI = {
  getAll: () => api.get('/areas'),
  getById: (id: string) => api.get(`/areas/${id}`),
  create: (data: any) => api.post('/areas', data),
  update: (id: string, data: any) => api.put(`/areas/${id}`, data),
  delete: (id: string) => api.delete(`/areas/${id}`),
};

export const dataRegisterAPI = {
  create: (type: string, data: any) => api.post(`/data_register.php?action=add_${type}`, data),
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
  getAll: (category?: string) => api.get(`/rooms.php${category ? `?category=${category}` : ''}`),
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
  getSchedule: () => api.get('/meals.php?type=schedule'),
  getRequests: () => api.get('/meals.php?type=requests'),
  getDeliveryPoints: () => api.get('/meals.php?type=dp'),
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
  getRooms: () => api.get('/information.php?type=room'),
  getPob: () => api.get('/information.php?type=pob'),
  getMeals: () => api.get('/information.php?type=meals'),
};

export default api;
