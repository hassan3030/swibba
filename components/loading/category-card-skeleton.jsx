"use client"

/**
 * Modern skeleton loader matching the CategoryCard design
 */
export function CategoryCardSkeleton() {
  return (
    <div className="relative h-full bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-md border border-gray-200 dark:border-gray-700">
      {/* Animated shimmer effect */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      
      <div className="relative z-10 flex flex-col items-center justify-between h-full p-5">
        {/* Image skeleton */}
        <div className="relative w-full aspect-square max-w-[120px] mb-4">
          <div className="relative bg-gray-50 dark:bg-gray-900 rounded-2xl p-4 flex items-center justify-center h-full">
            <div className="w-full h-full bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
          </div>
        </div>
        
        {/* Text skeleton */}
        <div className="w-full text-center space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-3/4 mx-auto animate-pulse" />
          <div className="h-0.5 w-12 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto animate-pulse" />
        </div>
      </div>
    </div>
  )
}
