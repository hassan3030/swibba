"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

const Checkbox = React.forwardRef(({ className, ...props }, ref) => {
  // Handle the case where props.onChange is provided instead of onCheckedChange
  const handleCheckedChange = (checked) => {
    if (props.onCheckedChange) {
      props.onCheckedChange(checked)
    }
    if (props.onChange) {
      // For react-hook-form compatibility
      props.onChange({
        target: {
          name: props.name,
          checked,
        },
      })
    }
  }

  // Remove onChange from props to avoid passing it twice
  const { onChange, onCheckedChange, ...restProps } = props

  return (
    <CheckboxPrimitive.Root
      ref={ref}
      className={cn(
        "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
        className,
      )}
      onCheckedChange={handleCheckedChange}
      {...restProps}
    >
      <CheckboxPrimitive.Indicator className={cn("flex items-center justify-center text-current")}>
        <Check className="h-4 w-4" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
})
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
