import type { MenuItem, Restaurant } from './data'

export type ApiMenuItem = Omit<MenuItem, 'emoji' | 'popular'> & { available: boolean; restaurantId: string }
export type ApiRestaurant = Omit<Restaurant, 'tags' | 'image' | 'accent' | 'menu'> & { isOpen: boolean; menuItems: ApiMenuItem[] }
export type ApiUser = { id: string; email: string; name: string; role: 'CUSTOMER' | 'RESTAURANT_ADMIN' | 'ADMIN' }
export type ApiOrder = { id: string; customerId: string; restaurantId: string; status: string; deliveryAddress: string; subtotal: number; deliveryFee: number; total: number; createdAt: string; items: Array<{ id?: string; menuItemId: string | null; name: string; price: number; quantity: number }>; restaurant?: { name: string } }

const API_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:3000'
const tokenKey = 'morsel_token'

export const getToken = () => localStorage.getItem(tokenKey)
export const clearToken = () => localStorage.removeItem(tokenKey)

async function request<T>(path: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers)
  headers.set('Content-Type', 'application/json')
  const token = getToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)
  const response = await fetch(`${API_URL}${path}`, { ...options, headers })
  const body = await response.json().catch(() => null)
  if (!response.ok) throw new Error(body?.error ?? `Request failed (${response.status})`)
  return body as T
}

export const api = {
  restaurants: (search = '') => request<ApiRestaurant[]>(`/api/restaurants${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  restaurant: (id: string) => request<ApiRestaurant>(`/api/restaurants/${id}`),
  login: (email: string, password: string) => request<{ token: string; user: ApiUser }>('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  signup: (name: string, email: string, password: string) => request<{ token: string; user: ApiUser }>('/api/auth/signup', { method: 'POST', body: JSON.stringify({ name, email, password }) }),
  me: () => request<ApiUser>('/api/auth/me'),
  users: () => request<Array<ApiUser & { createdAt: string }>>('/api/admin/users'),
  myRestaurant: () => request<ApiRestaurant>('/api/me/restaurant'),
  orders: () => request<ApiOrder[]>('/api/me/restaurant/orders'),
  order: (id: string) => request<ApiOrder>(`/api/orders/${id}`),
  createOrder: (input: { restaurantId: string; items: Array<{ menuItemId: string; quantity: number }>; deliveryAddress: string }) => request<ApiOrder>('/api/orders', { method: 'POST', body: JSON.stringify(input) }),
  updateOrderStatus: (id: string, status: string) => request<ApiOrder>(`/api/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  createMenuItem: (restaurantId: string, item: Omit<ApiMenuItem, 'id' | 'restaurantId'>) => request<ApiMenuItem>(`/api/restaurants/${restaurantId}/menu`, { method: 'POST', body: JSON.stringify(item) }),
  updateMenuItem: (id: string, item: Partial<ApiMenuItem>) => request<ApiMenuItem>(`/api/menu/${id}`, { method: 'PATCH', body: JSON.stringify(item) }),
  deleteMenuItem: (id: string) => request<void>(`/api/menu/${id}`, { method: 'DELETE' }),
}
