"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X, User, LogOut } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, logout, isAuthenticated } = useAuth()

  const getDashboardLink = () => {
    if (!user) return "/login"

    switch (user.type) {
      case "donor":
        return "/donor/dashboard"
      case "ngo":
        return "/ngo/dashboard"
      case "admin":
        return "/admin/dashboard"
      default:
        return "/login"
    }
  }

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-emerald-600">
              Needy Connect
            </Link>
          </div>

          {/* Desktop Navigation */}
          {/* <div className="hidden md:flex items-center space-x-4">
            <Link href="/donations" className="text-gray-700 hover:text-emerald-600">
              Donations
            </Link>
            <Link href="/ngos" className="text-gray-700 hover:text-emerald-600">
              NGOs
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-emerald-600">
              About
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-emerald-600">
              Contact
            </Link>
          </div> */}

          <div className="hidden md:flex items-center space-x-2">
            {isAuthenticated() ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <User size={16} />
                    {user?.name}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={getDashboardLink()}>Dashboard</Link>
                  </DropdownMenuItem>
                  {/* <DropdownMenuItem asChild>
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem> */}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-red-500">
                    <LogOut size={16} className="mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button asChild variant="outline">
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Register</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Navigation Toggle */}
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-700 hover:text-emerald-600">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-3">
              <Link
                href="/donations"
                className="text-gray-700 hover:text-emerald-600 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Donations
              </Link>
              <Link
                href="/ngos"
                className="text-gray-700 hover:text-emerald-600 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                NGOs
              </Link>
              <Link
                href="/about"
                className="text-gray-700 hover:text-emerald-600 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link
                href="/contact"
                className="text-gray-700 hover:text-emerald-600 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>

              {isAuthenticated() ? (
                <>
                  <Link
                    href={getDashboardLink()}
                    className="text-gray-700 hover:text-emerald-600 py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/profile"
                    className="text-gray-700 hover:text-emerald-600 py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      logout()
                      setIsMenuOpen(false)
                    }}
                    className="text-red-500 hover:text-red-700 py-2 text-left flex items-center"
                  >
                    <LogOut size={16} className="mr-2" />
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex flex-col space-y-2 pt-2">
                  <Button asChild variant="outline">
                    <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                      Login
                    </Link>
                  </Button>
                  <Button asChild>
                    <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                      Register
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

