"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { apiClient } from "@/lib/api-client"
import type { User } from "@/types"

interface AuthContextType {
  isAuthenticated: boolean
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  login: async () => {},
  logout: () => {},
  isLoading: true,
})

export const useAuth = () => useContext(AuthContext)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in on mount
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)

        // Set the token in the API client
        apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`
      } catch (error) {
        console.error("Failed to parse user data", error)
        localStorage.removeItem("token")
        localStorage.removeItem("user")
      }
    }

    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.post("/login", { email, password })
      const { token, user } = response.data

      // Store token and user data
      localStorage.setItem("token", token)
      localStorage.setItem("user", JSON.stringify(user))

      // Set the token in the API client
      apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`

      setUser(user)
    } catch (error: any) {
      console.error("Login failed", error)
      throw new Error(error.response?.data?.error || "Invalid credentials")
    }
  }

  const logout = () => {
    // Clear token and user data
    localStorage.removeItem("token")
    localStorage.removeItem("user")

    // Remove the token from the API client
    delete apiClient.defaults.headers.common["Authorization"]

    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        user,
        login,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
