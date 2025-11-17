import { Inter , Cairo } from "next/font/google"
import { Toaster } from "@/components/ui/toaster"
import { ConditionalLayout } from "@/components/layout/conditional-layout"
import { ThemeProvider } from "@/lib/theme-provider"
import { LanguageProvider } from "@/lib/language-provider"
import Image from "next/image";

import "./globals.css"
import Script from "next/script"

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
    default: "SWIBBA",
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

export default function RootLayout({ children }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning className={cairo.variable}>
      <body className={cairo.className}>
        <ThemeProvider>
          <LanguageProvider>
            <ConditionalLayout>
              {children}
            </ConditionalLayout>
            <Toaster position="top-right" />
          </LanguageProvider>
        </ThemeProvider>

        {/* Add custom animations */}
        <Script id="custom-animations" strategy="beforeInteractive">
          {`
            if (typeof document !== 'undefined') {
              const style = document.createElement('style');
              style.textContent = \`
                @keyframes blob {
                  0%, 100% { transform: translate(0, 0) scale(1); }
                  25% { transform: translate(20px, -50px) scale(1.1); }
                  50% { transform: translate(-20px, 20px) scale(0.9); }
                  75% { transform: translate(50px, 50px) scale(1.05); }
                }
                .animate-blob { animation: blob 20s infinite ease-in-out; }
                .animation-delay-2000 { animation-delay: 2s; }
                .animation-delay-4000 { animation-delay: 4s; }
                .animation-delay-6000 { animation-delay: 6s; }
                .bg-noise {
                  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
                }
              \`;
              document.head.appendChild(style);
            }
          `}
        </Script>
     
      </body>
    </html>
  )
}
