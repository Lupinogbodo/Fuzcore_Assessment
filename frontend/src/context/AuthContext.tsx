import {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from 'react'
import { apiCall, setToken as setStoredToken, getToken, clearToken } from '../lib/api'

interface User {
  id: string
  name: string
  email: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  error: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Rehydrate user on app load
  useEffect(() => {
    async function rehydrate() {
      const token = getToken()
      if (token) {
        const response = await apiCall<User>('/api/auth/me')
        if (response.data) {
          setUser(response.data)
        } else {
          // Token is invalid, clear it
          clearToken()
        }
      }
      setIsLoading(false)
    }

    rehydrate()
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    setError(null)

    const response = await apiCall<{ token: string; user: User }>(
      '/api/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }
    )

    if (response.error) {
      setError(response.error)
      setIsLoading(false)
      throw new Error(response.error)
    }

    if (response.data) {
      setStoredToken(response.data.token)
      setUser(response.data.user)
    }

    setIsLoading(false)
  }

  const signup = async (name: string, email: string, password: string) => {
    setIsLoading(true)
    setError(null)

    const response = await apiCall<{ token: string; user: User }>(
      '/api/auth/signup',
      {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      }
    )

    if (response.error) {
      setError(response.error)
      setIsLoading(false)
      throw new Error(response.error)
    }

    if (response.data) {
      setStoredToken(response.data.token)
      setUser(response.data.user)
    }

    setIsLoading(false)
  }

  const logout = async () => {
    setIsLoading(true)
    await apiCall('/api/auth/logout', { method: 'POST' })
    clearToken()
    setUser(null)
    setIsLoading(false)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
