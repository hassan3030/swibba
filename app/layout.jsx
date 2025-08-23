import { Inter , Cairo } from "next/font/google"
import { Toaster } from "@/components/ui/toaster"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ThemeProvider } from "@/lib/theme-provider"
import { LanguageProvider } from "@/lib/language-provider"
import { headers } from "next/headers";
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

// Configure Cairo font for both Arabic and Latin text
const cairo = Cairo({ 
  subsets: ["latin", "arabic"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-cairo",
  display: "swap"
})

export const metadata = {
  title: "Swibba",
  description: "A marketplace platform where users can swap items across categories",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
}

export default async function  RootLayout({ children }) {
  const pathname = headers().get("/chat");

  return (
    <html lang="en" dir="ltr" suppressHydrationWarning className={cairo.variable}>
      <body className={cairo.className}>
   <ThemeProvider>
          <LanguageProvider>
                <div className="flex min-h-screen flex-col">
                  <Header />
                  <div className="flex-1">{children}</div>
                  {/* handle it  */}
                  {pathname==null ?(<Footer />):null}
                </div>
                <Toaster />
          </LanguageProvider>
        </ThemeProvider>

     
      </body>
    </html>
  )
}
