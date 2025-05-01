"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from "@/context/auth-context"
import { Search, Menu, PenSquare, Home, LogOut, User, Users } from "lucide-react"

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState("")
  const pathname = usePathname()
  const { isAuthenticated, user, logout } = useAuth()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    // Redirect to home with search query
    window.location.href = `/?${
        searchQuery.includes("@") ? `username=${searchQuery.replace("@", "")}` : `country=${searchQuery}`
    }`
  }

  return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pl-8">
        <div className="container flex h-16 items-center">
          {/* Left Section: Logo and Navigation Links */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <span className="font-bold text-lg">TravelTales</span>
            </Link>

            <nav className="hidden md:flex gap-6">
              <Link
                  href="/"
                  className={`text-sm font-medium ${
                      pathname === "/" ? "text-foreground" : "text-muted-foreground"
                  } transition-colors hover:text-foreground`}
              >
                Home
              </Link>
              {isAuthenticated && (
                  <Link
                      href="/feed"
                      className={`text-sm font-medium ${
                          pathname === "/feed" ? "text-foreground" : "text-muted-foreground"
                      } transition-colors hover:text-foreground`}
                  >
                    My Feed
                  </Link>
              )}
            </nav>
          </div>

          {/* Right Section: Search, New Post, and Profile */}
          <div className="flex items-center gap-4 ml-auto al">
            <form onSubmit={handleSearch} className="flex relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                  type="search"
                  placeholder="Search by country or @username"
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>

            {isAuthenticated ? (
                <>
                  <Link href="/posts/new">
                    <Button size="sm">
                      <PenSquare className="h-4 w-4 mr-2" />
                      New Post
                    </Button>
                  </Link>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-full">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{user?.username?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/users/${user?.id}`}>Profile</Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
            ) : (
                <div className="flex items-center gap-2">
                  <Link href="/login">
                    <Button variant="ghost" size="sm">
                      Login
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button size="sm">Register</Button>
                  </Link>
                </div>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="absolute left-4 top-4 md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <nav className="grid gap-6 text-lg font-medium">
              <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
                <span className="font-bold">TravelTales</span>
              </Link>
              <Link
                  href="/"
                  className={`flex items-center gap-2 ${
                      pathname === "/" ? "text-foreground" : "text-muted-foreground"
                  }`}
              >
                <Home className="h-5 w-5" />
                Home
              </Link>
              {isAuthenticated && (
                  <>
                    <Link
                        href="/feed"
                        className={`flex items-center gap-2 ${
                            pathname === "/feed" ? "text-foreground" : "text-muted-foreground"
                        }`}
                    >
                      <Users className="h-5 w-5" />
                      My Feed
                    </Link>
                    <Link
                        href={`/users/${user?.id}`}
                        className={`flex items-center gap-2 ${
                            pathname === `/users/${user?.id}` ? "text-foreground" : "text-muted-foreground"
                        }`}
                    >
                      <User className="h-5 w-5" />
                      Profile
                    </Link>
                    <Link
                        href="/posts/new"
                        className={`flex items-center gap-2 ${
                            pathname === "/posts/new" ? "text-foreground" : "text-muted-foreground"
                        }`}
                    >
                      <PenSquare className="h-5 w-5" />
                      New Post
                    </Link>
                    <button onClick={logout} className="flex items-center gap-2 text-muted-foreground">
                      <LogOut className="h-5 w-5" />
                      Logout
                    </button>
                  </>
              )}
              {!isAuthenticated && (
                  <>
                    <Link
                        href="/login"
                        className={`flex items-center gap-2 ${
                            pathname === "/login" ? "text-foreground" : "text-muted-foreground"
                        }`}
                    >
                      Login
                    </Link>
                    <Link
                        href="/register"
                        className={`flex items-center gap-2 ${
                            pathname === "/register" ? "text-foreground" : "text-muted-foreground"
                        }`}
                    >
                      Register
                    </Link>
                  </>
              )}
            </nav>
          </SheetContent>
        </Sheet>
      </header>
  )
}