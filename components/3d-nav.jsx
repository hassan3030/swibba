"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Menu, X } from "lucide-react"

// Navigation items
const navItems = [
  { name: "Home", path: "/" },
  { name: "Marketplace", path: "/marketplace" },
  { name: "Categories", path: "/categories" },
  { name: "How It Works", path: "/#how-it-works" },
  { name: "List Item", path: "/items/new" },
]

export function ThreeDNav() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [hoveredIndex, setHoveredIndex] = useState(null)
  const containerRef = useRef(null)

  // Google-inspired colors
  const colors = {
    blue: "#4285f4",
    red: "#ea4335",
    yellow: "#fbbc05",
    green: "#34a853",
    purple: "#673ab7",
  }

  // Set active index based on current path
  useEffect(() => {
    const index = navItems.findIndex((item) => item.path === pathname)
    setActiveIndex(index >= 0 ? index : 0)
  }, [pathname])

  // Handle window resize for mobile menu
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsOpen(false)
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Get color for each nav item
  const getItemColor = (index) => {
    const colorKeys = Object.keys(colors)
    return colors[colorKeys[index % colorKeys.length]]
  }

  return (
    <nav className="relative z-50 w-full">
      {/* Desktop Navigation */}
      <div className="container mx-auto hidden items-center justify-between py-4 md:flex">
        <Link href="/" className="flex items-center gap-2">
          <div className="relative h-10 w-10 overflow-hidden rounded-full">
            <div className="absolute inset-0 bg-gradient-to-r from-[#4285f4] via-[#ea4335] to-[#fbbc05] opacity-80"></div>
            <div className="absolute inset-0 flex items-center justify-center text-xl font-bold text-white">D</div>
          </div>
          <span className="text-xl font-bold">DeelDeal</span>
        </Link>

        <div className="relative" ref={containerRef}>
          <div className="flex items-center space-x-1">
            {navItems.map((item, index) => (
              <motion.div
                key={item.name}
                className="relative"
                onHoverStart={() => setHoveredIndex(index)}
                onHoverEnd={() => setHoveredIndex(null)}
              >
                <Link
                  href={item.path}
                  className={`relative z-10 block rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                    index === activeIndex ? "text-white" : "text-gray-700 hover:text-white"
                  }`}
                >
                  {item.name}
                </Link>

                {/* 3D Background Effect */}
                {(index === activeIndex || index === hoveredIndex) && (
                  <motion.div
                    className="absolute inset-0 -z-10 rounded-md"
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{
                      scale: 1,
                      opacity: 1,
                      rotateX: [0, 5, 0],
                      rotateY: [0, 10, 0],
                    }}
                    transition={{
                      duration: 0.5,
                      rotateX: { repeat: Number.POSITIVE_INFINITY, duration: 2 },
                      rotateY: { repeat: Number.POSITIVE_INFINITY, duration: 3 },
                    }}
                    style={{
                      background: `linear-gradient(135deg, ${getItemColor(index)} 0%, ${getItemColor(index + 1 >= navItems.length ? 0 : index + 1)} 100%)`,
                      boxShadow: `0 10px 20px -10px ${getItemColor(index)}80`,
                      transformStyle: "preserve-3d",
                      transformOrigin: "center center",
                    }}
                  />
                )}
              </motion.div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/auth/login"
            className="rounded-md px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:text-[#4285f4]"
          >
            Sign In
          </Link>
          <Link
            href="/auth/register"
            className="rounded-md bg-gradient-to-r from-[#4285f4] to-[#673ab7] px-4 py-2 text-sm font-medium text-white shadow-md transition-transform hover:scale-105"
          >
            Sign Up
          </Link>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="container mx-auto flex items-center justify-between py-4 md:hidden">
        <Link href="/" className="flex items-center gap-2">
          <div className="relative h-8 w-8 overflow-hidden rounded-full">
            <div className="absolute inset-0 bg-gradient-to-r from-[#4285f4] via-[#ea4335] to-[#fbbc05] opacity-80"></div>
            <div className="absolute inset-0 flex items-center justify-center text-lg font-bold text-white">D</div>
          </div>
          <span className="text-lg font-bold">DeelDeal</span>
        </Link>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-md bg-gray-100"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="absolute left-0 top-full z-50 w-full bg-white shadow-lg"
        >
          <div className="container mx-auto py-4">
            <div className="flex flex-col space-y-2">
              {navItems.map((item, index) => (
                <Link
                  key={item.name}
                  href={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`rounded-md px-4 py-3 text-sm font-medium ${
                    index === activeIndex
                      ? "bg-gradient-to-r from-[#4285f4] to-[#673ab7] text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              <div className="my-2 h-px bg-gray-200"></div>
              <Link
                href="/auth/login"
                onClick={() => setIsOpen(false)}
                className="rounded-md px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                onClick={() => setIsOpen(false)}
                className="rounded-md bg-gradient-to-r from-[#4285f4] to-[#673ab7] px-4 py-3 text-center text-sm font-medium text-white"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </nav>
  )
}
