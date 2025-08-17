"use client"

import { forwardRef } from "react"
import { Button } from "@/components/ui/button"
import LoadingSpinner from "@/components/loading-spinner"
import { cn } from "@/lib/utils"

/**
 * LoadingButton component that shows a spinner when in loading state
 * 
 * @example
 * // Basic usage
 * <LoadingButton isLoading={isLoading} onClick={handleClick}>
 *   Submit
 * </LoadingButton>
 * 
 * // With different variants
 * <LoadingButton isLoading={isLoading} variant="outline">
 *   Save
 * </LoadingButton>
 */
const LoadingButton = forwardRef(({ 
  children, 
  isLoading = false,
  loadingText,
  spinnerSize = "sm",
  className,
  disabled,
  ...props 
}, ref) => {
  return (
    <Button
      ref={ref}
      className={cn(className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center justify-center gap-2">
          <LoadingSpinner size={spinnerSize} />
          {loadingText || children}
        </div>
      ) : (
        children
      )}
    </Button>
  )
})

LoadingButton.displayName = "LoadingButton"

export { LoadingButton }