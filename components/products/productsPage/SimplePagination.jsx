"use client"

import { useTranslations } from "@/lib/use-translations"

export function SimplePagination({ currentPage, totalPages, onPageChange }) {
  const { t } = useTranslations()

  return (
    <div className="flex justify-center mt-8 gap-2 py-4">
      <button
        className="px-4 py-2 rounded-lg border dark:text-white bg-card hover:bg-muted disabled:opacity-50 transition-colors shadow-sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        {t("prev") || "Prev"}
      </button>

      {[...Array(totalPages)].map((_, idx) => (
        <button
          key={idx + 1}
          className={`px-4 py-2 border rounded-lg transition-colors shadow-sm ${
            currentPage === idx + 1 
              ? "bg-primary text-primary-foreground shadow-md font-semibold" 
              : "bg-card dark:text-white hover:bg-muted"
          }`}
          onClick={() => onPageChange(idx + 1)}
        >
          {idx + 1}
        </button>
      ))}

      <button
        className="px-4 py-2 rounded-lg border bg-card dark:text-white hover:bg-muted disabled:opacity-50 transition-colors shadow-sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        {t("next") || "Next"}
      </button>
    </div>
  )
}
