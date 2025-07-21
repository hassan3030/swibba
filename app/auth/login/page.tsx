"use client"
import { LoginForm } from "@/components/auth/login-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Bentham } from "next/font/google"
import { useTranslations } from "@/lib/use-translations";



export default function LoginPage() {
  const { t } = useTranslations();
  return (
    <div className="container flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center py-10">

  
      <Link href="/" className="mb-8 flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="mr-2 h-4 w-4" />
       {t("Backtomarketplace")||"Back to marketplace"}

      </Link>

      <Card className="mx-auto w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">{t("Signinto")||"Sign in to"} DeelDeal</CardTitle>
     
          <CardDescription>
       {t("Enteryourcredentialstoaccessyouraccount")||"Enter your credentials to access your account"}
            
             </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  )
}
