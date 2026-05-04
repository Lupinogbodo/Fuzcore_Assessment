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

export async function getCategories(type?: 'income' | 'expense') {
  const query = type ? `?type=${type}` : ''
  return apiCall<Category[]>(`/api/categories${query}`)
}

export async function getTransactions(filters?: {
  type?: 'income' | 'expense'
  category_id?: string
  from?: string
  to?: string
}) {
  const params = new URLSearchParams()

  if (filters?.type) params.set('type', filters.type)
  if (filters?.category_id) params.set('category_id', filters.category_id)
  if (filters?.from) params.set('from', filters.from)
  if (filters?.to) params.set('to', filters.to)

  const query = params.toString() ? `?${params.toString()}` : ''
  return apiCall<Transaction[]>(`/api/transactions${query}`)
}

export async function createTransaction(
  payload: Omit<Transaction, 'id' | 'category_name'>
) {
  return apiCall<Transaction>('/api/transactions', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function deleteTransaction(id: string) {
  return apiCall<{ success: boolean }>(`/api/transactions/${id}`, {
    method: 'DELETE',
  })
}

interface Transaction {
  id: string
  amount: number
  type: 'income' | 'expense'
  description?: string | null
  date: string
  category_id?: string | null
  category_name?: string | null
}

interface Category {
  id: string
  name: string
  type: 'income' | 'expense'
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
