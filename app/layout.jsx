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
  metadataBase: new URL("https://swibba.com"),
  title: {
    default: "Swibba",
    template: "%s | Swibba",
  },
  description: "Swibba is a high-performance, SEO-optimized marketplace platform where users can swap items across various categories. Discover, trade, and connect with a vibrant community.",
  keywords: [
    "Swibba",
    "marketplace",
    "swap",
    "trade",
    "barter",
    "exchange",
    "buy",
    "sell",
    "community",
    "classifieds",
    "second hand",
    "local deals",
    "online marketplace"
  ],
  authors: [
    { name: "Swibba Team", url: "https://swibba.com/about" }
  ],
  creator: "Swibba",
  publisher: "Swibba",
  openGraph: {
    title: "Swibba - Swap, Trade, and Discover",
    description: "Join Swibba to swap and trade items across categories. Safe, fast, and community-driven.",
    url: "https://swibba.com",
    siteName: "Swibba",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Swibba Marketplace",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Swibba - Swap, Trade, and Discover",
    description: "A high-performance, SEO-optimized marketplace for swapping and trading items.",
    site: "@swibba",
    creator: "@swibba",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
    other: [
      { rel: "manifest", url: "/site.webmanifest" }
    ]
  },
  manifest: "/site.webmanifest",
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: "https://swibba.com",
    languages: {
      "en": "https://swibba.com/en",
      "ar": "https://swibba.com/ar",
    },
  },
};

export const viewport = {
  themeColor: "#f5b014",
  colorScheme: "light dark",
};

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
