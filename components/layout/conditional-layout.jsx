"use client"

import { usePathname } from "next/navigation"
import { Header } from "@/components/general/header"
import { Footer } from "@/components/general/footer"
import { MobileHeader } from "@/components/general/mobile-header"
import { MobileFooter } from "@/components/general/mobile-footer"

export function ConditionalLayout({ children }) {
  const pathname = usePathname()
  const isAuthPage = pathname?.startsWith("/auth")

  return (
    <div className="flex min-h-screen flex-col" dir="ltr">
      {/* Desktop Header - Hidden on mobile and auth pages */}
      {!isAuthPage && (
        <div className="hidden md:block">
          <Header />
        </div>
      )}
      
      {/* Mobile Header - Hidden on auth pages */}
      {!isAuthPage && (
        <div className="block md:hidden">
          <MobileHeader />
        </div>
      )}
      
      <div className={isAuthPage ? "flex-1" : "flex-1 pb-16 md:pb-0"}>
        {children}
      </div>
      
      {/* Desktop Footer - Hidden on mobile, auth pages, and chat */}
      {!isAuthPage && pathname !== "/chat" && (
        <div className="hidden md:block">
          <Footer />
        </div>
      )}
      
      {/* Mobile Footer - Hidden on auth pages */}
      {!isAuthPage && (
        <div className="block md:hidden">
          <MobileFooter />
        </div>
      )}
    </div>
  )
}
