"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

export function AuthGuard({ children }) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Skip during initial load to avoid flashes
    if (isLoading) return

    // If not authenticated and not on an auth page, redirect to login
    if (!isAuthenticated && !pathname.startsWith("/auth/")) {
      router.push(`/auth/login?returnUrl=${encodeURIComponent(pathname)}`)
    }
  }, [isAuthenticated, isLoading, pathname, router])

  // Show nothing while checking authentication
  if (isLoading) {
    // return null
  }

  // If on an auth page or authenticated, show the children
  if (pathname.startsWith("/auth/") || isAuthenticated) {
    return <>{children}</>
  }

  // Otherwise show nothing (will redirect)
  // return null
}
