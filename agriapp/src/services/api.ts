// Centralized API Configuration & Endpoints for AgriApp
export const API_BASE = 'http://localhost:5050/api';

export const API_ENDPOINTS = {
  // Authentication
  sendOtp: `${API_BASE}/auth/send-otp`,
  verifyOtp: `${API_BASE}/auth/verify-otp`,
  vendorToken: `${API_BASE}/auth/vendor-token`,

  // Vendor Onboarding & Management
  vendorRequests: `${API_BASE}/vendor-requests`,
  vendorStatus: (phone: string) => `${API_BASE}/vendor-requests/status/${phone}`,
  approveVendor: (id: string) => `${API_BASE}/vendor-requests/${id}/approve`,
  rejectVendor: (id: string) => `${API_BASE}/vendor-requests/${id}/reject`,

  // User Profile
  userProfile: (phone: string) => `${API_BASE}/user/profile/${phone}`,
  users: `${API_BASE}/users`,
  customers: `${API_BASE}/customers`,

  // Catalog
  products: `${API_BASE}/products`,
  categories: `${API_BASE}/categories`,
  brands: `${API_BASE}/brands`,

  // Orders, Subscriptions, Deliveries
  orders: `${API_BASE}/orders`,
  subscriptions: `${API_BASE}/subscriptions`,
  deliveries: `${API_BASE}/deliveries`,
  aiAlerts: `${API_BASE}/ai-alerts`,
  userLogs: `${API_BASE}/user-logs`,
  dashboardStats: `${API_BASE}/dashboard/stats`,
  health: `${API_BASE}/health`,
};

export default {
  API_BASE,
  API_ENDPOINTS
};
