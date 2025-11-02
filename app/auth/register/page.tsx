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
      <Link href="/" className="mb-8 flex items-center text-sm text-primary/90 hover:text-primary hover:scale-105 transition-all duration-200">
        <ArrowLeft className="mr-2 h-4 w-4 mx-1 " />
              {t("back")||"Back to home"}
      </Link>

      <Card className="mx-auto w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">
       {t("Createanaccount")||"Create an account"}


          </CardTitle>
          <CardDescription>
        {t("Enteryourinformationtocreate")||"Enter your information to create a Swibba account"}
            
           </CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm />
        </CardContent>
      </Card>
    </div>
  )
}
