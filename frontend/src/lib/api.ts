const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

interface ApiOptions extends RequestInit {
  headers?: Record<string, string>
}

interface ApiResponse<T> {
  data: T | null
  error: string | null
}

export async function apiCall<T>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<ApiResponse<T>> {
  const token = localStorage.getItem('token')
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        data: null,
        error: data.error || `HTTP ${response.status}`,
      }
    }

    return data
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export function setToken(token: string) {
  localStorage.setItem('token', token)
}

export function getToken(): string | null {
  return localStorage.getItem('token')
}

export function clearToken() {
  localStorage.removeItem('token')
}

export async function getCustomers(): Promise<ApiResponse<Customer[]>> {
  return apiCall('/api/customers')
}

export async function createCustomer(
  payload: Omit<Customer, 'id'>
): Promise<ApiResponse<Customer>> {
  return apiCall('/api/customers', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function updateCustomer(
  id: string,
  payload: Omit<Customer, 'id'>
): Promise<ApiResponse<Customer>> {
  return apiCall(`/api/customers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export async function deleteCustomer(
  id: string
): Promise<ApiResponse<{ success: boolean }>> {
  return apiCall(`/api/customers/${id}`, {
    method: 'DELETE',
  })
}

interface Customer {
  id: string
  name: string
  email?: string | null
  phone?: string | null
  address?: string | null
}
