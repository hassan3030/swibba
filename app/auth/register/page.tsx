"use client"
import { RegisterForm } from "@/components/auth/register-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { useTranslations } from "@/lib/use-translations";


export default function RegisterPage() {
  const { t } = useTranslations();
  return (
    <div className="container flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center py-10">
      <Link href="/" className="mb-8 flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="mr-2 h-4 w-4" />
              {t("Backtomarketplace")||"Back to marketplace"}
      </Link>

      <Card className="mx-auto w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">
       {t("Createanaccount")||"Create an account"}


          </CardTitle>
          <CardDescription>
       {t("Enteryourinformationtocreate")||"Enter your information to create a DeelDeal account"}
            
           </CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm />
        </CardContent>
      </Card>
    </div>
  )
}
