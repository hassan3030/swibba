"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useTranslations } from "@/lib/use-translations";

export default function NotFound() {
  const { t } = useTranslations();
  return (
    <div className="container flex h-[70vh] flex-col items-center justify-center">
      <h1 className="text-4xl font-bold">{t("pageNotFound")||"Page Not Found"}</h1>
      <p className="mb-6 mt-2 text-muted-foreground">
       {t("hintNotFoundPage") ||"The page you're looking for doesn't exist or has been removed please try again"}
      </p>
      <Button asChild>
        <Link href="/">{t("returnToHome")||"Return to Home"}</Link>
      </Button>
    </div>
  )
}
