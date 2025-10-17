"use client"

import Link from "next/link"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useTranslations } from "@/lib/use-translations"

export default function Error({ error, reset }) {
  const { t } = useTranslations()

  useEffect(() => {
    // Optionally log the error to your error reporting service
    // console.error(error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="mx-auto w-full max-w-lg text-center">
        <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-secondary/50 text-secondary-foreground">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-8 w-8"
            aria-hidden="true"
          >
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
            <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        </div>

        <h1 className="mb-2 text-2xl font-semibold tracking-tight md:text-3xl">
             {t("somethingWentWrong")||"Something went wrong"}
          
        </h1>
        <p className="mb-6 text-muted-foreground">
          {error?.message || "An unexpected error occurred. Please try again."}
        </p>

        <div className="flex items-center justify-center gap-3">
          <Button onClick={() => reset()}>
             {t("tryAgain")||"Try again"}
          </Button>
          <Button asChild variant="secondary">
            <Link href="/">{t("returnToHome")||"Go to Home"}</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}


