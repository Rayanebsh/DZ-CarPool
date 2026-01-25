// lib/api.ts - Configuration de l'API
import axios from 'axios';

// Configuration de base
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Instance axios configurée
export const api = axios.create({
  baseURL: `${API_BASE_URL}`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Intercepteur pour gérer le refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si erreur 401 et pas déjà en train de retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) throw new Error('No refresh token');

        const response = await axios.post(
          `${API_BASE_URL}/api/v1/users/token/refresh/`,
          { refresh: refreshToken },
        );

        const { access } = response.data;
        localStorage.setItem('access_token', access);

        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Déconnecter l'utilisateur
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

// ============ SERVICES API ============

// Users Service
export const usersService = {
  register: (data: any) => api.post('/users/register/', data),
  login: (credentials: any) => api.post('/users/login/', credentials),
  googleAuth: (token: string) => api.post('/users/google_auth/', { token }),
  getProfile: () => api.get('/users/me/'),
  updateProfile: (data: any) => api.patch('/users/me/', data),

  // Vérifications
  sendEmailVerification: () => api.post('/users/send_email_verification/'),
  verifyEmail: (code: string) => api.post('/users/verify_email/', { code }),
  sendPhoneVerification: () => api.post('/users/send_phone_verification/'),
  verifyPhone: (code: string) => api.post('/users/verify_phone/', { code }),
  getVerificationStatus: () => api.get('/users/verification_status/'),

  // Documents
  uploadDocument: (formData: FormData) =>
    api.post('/users/upload_document/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getDocuments: () => api.get('/users/documents/'),
  checkDocumentStatus: () => api.get('/users/check-document-status/'),

  // Préférences
  getPreferences: () => api.get('/users/preferences/'),
  getMyPreferences: () => api.get('/users/my_preferences/'),
  updatePreferences: (preferences: number[]) =>
    api.post('/users/preferences/', { preferences }),

  // Rôles
  getRoles: () => api.get('/users/roles/'),
};

// Trajets Service
export const trajetsService = {
  list: (params?: any) => api.get('/trajets/', { params }),
  create: (data: any) => api.post('/trajets/', data),
  get: (id: number) => api.get(`/trajets/${id}/`),
  update: (id: number, data: any) => api.put(`/trajets/${id}/`, data),
  delete: (id: number) => api.delete(`/trajets/${id}/`),

  // Recherche
  search: (data: any) => api.post('/trajets/search/', data),
  intelligentSearch: (data: any) =>
    api.post('/trajets/intelligent_search/', data),

  // Mes trajets
  myTrips: () => api.get('/trajets/my_trips/'),
  upcoming: () => api.get('/trajets/upcoming/'),
  past: () => api.get('/trajets/past/'),

  // Actions
  cancel: (id: number, reason: string) =>
    api.post(`/trajets/${id}/cancel/`, { reason }),
  getReservations: (id: number) => api.get(`/trajets/${id}/reservations/`),
  getStatistics: (id: number) => api.get(`/trajets/${id}/statistics/`),

  // Prix carburant
  getFuelPrices: () => api.get('/trajets/fuel-prices/'),
};

// Reservations Service
export const reservationsService = {
  list: () => api.get('/reservations/'),
  create: (data: any) => api.post('/reservations/', data),
  get: (id: number) => api.get(`/reservations/${id}/`),
  update: (id: number, data: any) => api.put(`/reservations/${id}/`, data),
  delete: (id: number) => api.delete(`/reservations/${id}/`),

  // Mes réservations
  myBookings: () => api.get('/reservations/my-bookings/'),
  myTripsBookings: () => api.get('/reservations/my-trips-bookings/'),

  // Actions
  confirm: (id: number) => api.post(`/reservations/${id}/confirm/`),
  reject: (id: number, reason: string) =>
    api.post(`/reservations/${id}/reject/`, { reason }),
  cancel: (id: number, reason: string) =>
    api.post(`/reservations/${id}/cancel/`, { reason }),

  // Permissions
  checkBookingPermission: (trajetId: number) =>
    api.get('/reservations/check-booking-permission/', {
      params: { trajet_id: trajetId },
    }),
};

// Messages Service
export const messagesService = {
  list: (params?: any) => api.get('/messaging/messages/', { params }),
  send: (data: any) => api.post('/messaging/messages/', data),
  get: (id: number) => api.get(`/messaging/messages/${id}/`),

  // Média
  uploadMedia: (formData: FormData) =>
    api.post('/messaging/messages/upload-media/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

// Conversations Service
export const conversationsService = {
  list: () => api.get('/messaging/conversations/'),
  create: (data: any) => api.post('/messaging/conversations/', data),
  get: (id: number) => api.get(`/messaging/conversations/${id}/`),
  getMessages: (id: number, params?: any) =>
    api.get(`/messaging/conversations/${id}/messages/`, { params }),
};

// Notifications Service
export const notificationsService = {
  list: (params?: any) => api.get('/notifications/', { params }),
  get: (id: number) => api.get(`/notifications/${id}/`),
  markAsRead: (id: number) => api.post(`/notifications/${id}/mark_as_read/`),
  markAllAsRead: () => api.post('/notifications/mark_all_as_read/'),
  getUnreadCount: () => api.get('/notifications/unread_count/'),
};

export default api;
