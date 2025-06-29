"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"

interface User {
  id: string
  name: string
  email: string
  type: "donor" | "ngo" | "admin"
  status: string
  [key: string]: any
}

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  login: (email: string, password: string, type: string) => Promise<{ success: boolean; message: string }>
  register: (userData: any) => Promise<{ success: boolean; message: string }>
  logout: () => void
  isAuthenticated: () => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in on initial load
    const storedUser = localStorage.getItem("user")
    const storedToken = localStorage.getItem("token")

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser))
      setToken(storedToken)
    }

    setLoading(false)
  }, [])

  const login = async (email: string, password: string, type: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, type }),
      })

      const data = await response.json()

      if (data.success) {
        setUser(data.user)
        setToken(data.token)

        // Store in localStorage
        localStorage.setItem("user", JSON.stringify(data.user))
        localStorage.setItem("token", data.token)

        return { success: true, message: data.message }
      } else {
        return { success: false, message: data.message }
      }
    } catch (error) {
      console.error("Login error:", error)
      return { success: false, message: "An error occurred during login" }
    }
  }

  const register = async (userData: any) => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })

      const data = await response.json()
      return { success: data.success, message: data.message }
    } catch (error) {
      console.error("Registration error:", error)
      return { success: false, message: "An error occurred during registration" }
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem("user")
    localStorage.removeItem("token")
    router.push("/login")
  }

  const isAuthenticated = () => {
    return !!user && !!token
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

