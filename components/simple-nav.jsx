"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

// Navigation items
const navItems = [
  { name: "Home", path: "/" },
  { name: "Marketplace", path: "/marketplace" },
  { name: "Categories", path: "/categories" },
  { name: "List Item", path: "/items/new" },
]

export function SimpleNav() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  // Google colors
  const googleColors = {
    blue: "#4285f4",
    red: "#ea4335",
    yellow: "#fbbc05",
    green: "#34a853",
    purple: "#673ab7",
  }

  return (
    <nav className="w-full border-b bg-white">
      <div className="container mx-auto flex items-center justify-between py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#4285f4] text-white">
            <span className="text-xl font-bold">D</span>
          </div>
          <span className="text-xl font-bold" style={{ color: googleColors.blue }}>
            Deel<span style={{ color: googleColors.red }}>Deal</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.path}
              className={`text-sm font-medium transition-colors hover:text-[#4285f4] ${
                pathname === item.path ? "text-[#4285f4]" : "text-gray-700"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Auth Buttons - Desktop */}
        <div className="hidden items-center gap-4 md:flex">
          <Button variant="outline" className="border-[#4285f4] text-[#4285f4] hover:bg-[#4285f4] hover:text-white">
            <Link href="/auth/login">Sign In</Link>
          </Button>
          <Button className="bg-[#4285f4] text-white hover:bg-[#3367d6]">
            <Link href="/auth/register">Sign Up</Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-md text-gray-700 md:hidden"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="border-t md:hidden">
          <div className="container mx-auto py-4">
            <div className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`rounded-md px-4 py-2 text-sm font-medium ${
                    pathname === item.path ? "bg-[#4285f4]/10 text-[#4285f4]" : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              <div className="my-2 h-px bg-gray-200"></div>
              <Link
                href="/auth/login"
                onClick={() => setIsOpen(false)}
                className="rounded-md px-4 py-2 text-sm font-medium text-[#4285f4]"
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                onClick={() => setIsOpen(false)}
                className="rounded-md bg-[#4285f4] px-4 py-2 text-center text-sm font-medium text-white"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
