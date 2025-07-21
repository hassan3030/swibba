
import { Inter } from "next/font/google"
// import { AuthProvider } from "@/lib/auth-context"
// import { AuthGuard } from "@/components/auth/auth-guard"
import { Toaster } from "@/components/ui/toaster"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ThemeProvider } from "@/lib/theme-provider"
import { LanguageProvider } from "@/lib/language-provider"
import "./globals.css"
const inter = Inter({ subsets: ["latin"] })
export const metadata = {
  title: "DeelDeal",
  description: "A marketplace platform where users can swap items across categories",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
}

export default async function  RootLayout({ children }) {
  //   const session = await getServerSession(authOptions);

  // if (!session) {
  //   return <p>⛔ Access Denied: You must be logged in.</p>;
  // }
  return (
    <html lang="en">
    
      <body className={inter.className} >

   <ThemeProvider>
          <LanguageProvider>
            {/* <AuthProvider> */}
              {/* <AuthGuard> */}
                <div className="flex min-h-screen flex-col">
                  {/* <Header /> */}
           
                  <div className="flex-1">{children}</div>
                  {/* <Footer /> */}
                </div>
                <Toaster />
              {/* </AuthGuard> */}
            {/* </AuthProvider> */}
          </LanguageProvider>
        </ThemeProvider>

     
      </body>
    </html>
  )
}
