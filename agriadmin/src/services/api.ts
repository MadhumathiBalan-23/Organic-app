export const API_BASE = 'http://localhost:5050/api';

export const API_ENDPOINTS = {
  products: `${API_BASE}/products`,
  categories: `${API_BASE}/categories`,
  brands: `${API_BASE}/brands`,
  customers: `${API_BASE}/customers`,
  orders: `${API_BASE}/orders`,
  userLogs: `${API_BASE}/user-logs`,
  dashboardStats: `${API_BASE}/dashboard/stats`,
  subscriptions: `${API_BASE}/subscriptions`,
  deliveries: `${API_BASE}/deliveries`,
  aiAlerts: `${API_BASE}/ai-alerts`,
  health: `${API_BASE}/health`,
  vendorRequests: `${API_BASE}/vendor-requests`,
  upload: `${API_BASE}/upload`,
};

export async function uploadImageAPI(base64Data: string, fileName?: string): Promise<string> {
  const res = await request<{ success: boolean; url: string }>(API_ENDPOINTS.upload, {
    method: 'POST',
    body: JSON.stringify({ image: base64Data, fileName })
  });
  return res.url;
}

// Generic fetch helper
async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
    ...options
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API Error ${res.status}: ${errorText}`);
  }
  return res.json();
}

// ── Products API ──────────────────────────────────────────────
export async function getProductsAPI(params?: { category?: string; search?: string }) {
  const query = new URLSearchParams();
  if (params?.category && params.category !== 'All') query.set('category', params.category);
  if (params?.search) query.set('search', params.search);
  const qStr = query.toString() ? `?${query.toString()}` : '';
  const data = await request<{ success: boolean; data: any[] }>(`${API_ENDPOINTS.products}${qStr}`);
  return data.success ? data.data : [];
}

export async function createProductAPI(productData: any) {
  return request<{ success: boolean; data: any }>(API_ENDPOINTS.products, {
    method: 'POST',
    body: JSON.stringify({
      name: productData.name,
      categoryName: productData.categoryName || productData.category,
      brand: productData.brand || 'NatureFarm',
      price: Number(productData.price),
      stock: Number(productData.stock || 0),
      unit: productData.unit || 'Kg',
      description: productData.description || `Fresh Organic ${productData.name}`,
      imageUrl: productData.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600',
      benefits: productData.benefits || ['Pesticide Free', '100% Organic Certified']
    })
  });
}

export async function updateProductAPI(id: string | number, productData: any) {
  return request<{ success: boolean; data: any }>(`${API_ENDPOINTS.products}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(productData)
  });
}

export async function deleteProductAPI(id: string | number) {
  return request<{ success: boolean; message: string }>(`${API_ENDPOINTS.products}/${id}`, {
    method: 'DELETE',
    headers: { 'x-admin-pin': '9999' }
  });
}

// ── Categories API ────────────────────────────────────────────
export async function getCategoriesAPI() {
  const data = await request<{ success: boolean; data: any[] }>(API_ENDPOINTS.categories);
  return data.success ? data.data : [];
}

export async function createCategoryAPI(categoryData: { name: string; emoji?: string; description?: string }) {
  return request<{ success: boolean; data: any }>(API_ENDPOINTS.categories, {
    method: 'POST',
    body: JSON.stringify(categoryData)
  });
}

export async function updateCategoryAPI(id: string | number, categoryData: any) {
  return request<{ success: boolean; data: any }>(`${API_ENDPOINTS.categories}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(categoryData)
  });
}

export async function deleteCategoryAPI(id: string | number) {
  return request<{ success: boolean; message: string }>(`${API_ENDPOINTS.categories}/${id}`, {
    method: 'DELETE'
  });
}

// ── Brands API ────────────────────────────────────────────────
export async function getBrandsAPI() {
  const data = await request<{ success: boolean; data: any[] }>(API_ENDPOINTS.brands);
  return data.success ? data.data : [];
}

export async function createBrandAPI(brandData: { name: string; origin?: string; rating?: number; productCount?: number }) {
  return request<{ success: boolean; data: any }>(API_ENDPOINTS.brands, {
    method: 'POST',
    body: JSON.stringify(brandData)
  });
}

export async function updateBrandAPI(id: string | number, brandData: any) {
  return request<{ success: boolean; data: any }>(`${API_ENDPOINTS.brands}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(brandData)
  });
}

export async function deleteBrandAPI(id: string | number) {
  return request<{ success: boolean; message: string }>(`${API_ENDPOINTS.brands}/${id}`, {
    method: 'DELETE'
  });
}

// ── Orders API ────────────────────────────────────────────────
export async function getOrdersAPI() {
  const data = await request<{ success: boolean; data: any[] }>(API_ENDPOINTS.orders);
  return data.success ? data.data : [];
}

export async function updateOrderAPI(id: string, updateData: { status?: string; deliveryStatus?: string; paymentStatus?: string }) {
  return request<{ success: boolean; data: any }>(`${API_ENDPOINTS.orders}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updateData)
  });
}

// ── Customers API ─────────────────────────────────────────────
export async function getCustomersAPI() {
  const data = await request<{ success: boolean; data: any[] }>(API_ENDPOINTS.customers);
  return data.success ? data.data : [];
}

// ── User Logs API ─────────────────────────────────────────────
export async function getUserLogsAPI() {
  const data = await request<{ success: boolean; data: any[] }>(API_ENDPOINTS.userLogs);
  return data.success ? data.data : [];
}

export async function createUserLogAPI(logData: { user: string; role: string; action: string; module: string; type: string }) {
  return request<{ success: boolean; data: any }>(API_ENDPOINTS.userLogs, {
    method: 'POST',
    body: JSON.stringify(logData)
  });
}

// ── Dashboard Stats API ───────────────────────────────────────
export async function getDashboardStatsAPI() {
  const data = await request<{ success: boolean; data: any }>(API_ENDPOINTS.dashboardStats);
  return data.success ? data.data : null;
}

// ── Subscriptions & Deliveries API ────────────────────────────
export async function getSubscriptionsAPI() {
  const data = await request<{ success: boolean; data: any[] }>(API_ENDPOINTS.subscriptions);
  return data.success ? data.data : [];
}

export async function getDeliveriesAPI() {
  const data = await request<{ success: boolean; data: any[] }>(API_ENDPOINTS.deliveries);
  return data.success ? data.data : [];
}

export async function getAIAlertsAPI() {
  const data = await request<{ success: boolean; data: any[] }>(API_ENDPOINTS.aiAlerts);
  return data.success ? data.data : [];
}

// ── Vendor Requests / Approvals API ───────────────────────────
export async function getVendorRequestsAPI(status?: string) {
  const q = status && status !== 'ALL' ? `?status=${status}` : '';
  const data = await request<{ success: boolean; data: any[] }>(`${API_ENDPOINTS.vendorRequests}${q}`);
  return data.success ? data.data : [];
}

export async function approveVendorAPI(id: string) {
  return request<{ success: boolean; message: string; data: any }>(`${API_ENDPOINTS.vendorRequests}/${id}/approve`, {
    method: 'POST'
  });
}

export async function rejectVendorAPI(id: string, reason?: string) {
  return request<{ success: boolean; message: string; data: any }>(`${API_ENDPOINTS.vendorRequests}/${id}/reject`, {
    method: 'POST',
    body: JSON.stringify({ reason })
  });
}
