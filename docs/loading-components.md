# Loading Components and Utilities

This document provides an overview of the loading components and utilities available in the DeelDeal application.

## Components

### LoadingSpinner

A versatile loading spinner component that can be used in different contexts.

```jsx
import LoadingSpinner from "@/components/loading-spinner"

// Basic inline spinner
<LoadingSpinner />

// Full page overlay spinner
<LoadingSpinner fullPage text="Loading data..." />

// Different sizes
<LoadingSpinner size="sm" />
<LoadingSpinner size="md" /> // default
<LoadingSpinner size="lg" />

// With custom text
<LoadingSpinner text="Processing..." />

// With custom styling
<LoadingSpinner className="my-custom-class" />
```

### LoadingButton

A button component that shows a spinner when in loading state.

```jsx
import { LoadingButton } from "@/components/ui/loading-button"

// Basic usage
<LoadingButton isLoading={isLoading} onClick={handleSubmit}>
  Submit
</LoadingButton>

// With loading text
<LoadingButton 
  isLoading={isLoading} 
  loadingText="Saving..."
  variant="outline"
>
  Save
</LoadingButton>

// Different variants
<LoadingButton isLoading={isLoading} variant="destructive">Delete</LoadingButton>
<LoadingButton isLoading={isLoading} variant="secondary">Secondary</LoadingButton>
```

## Utilities

### useLoading Hook

A custom hook to manage loading states with automatic timeout functionality.

```jsx
import useLoading from "@/hooks/use-loading"

// Basic usage
const [isLoading, startLoading, stopLoading] = useLoading()

// With automatic timeout (stops loading after 3 seconds)
const [isLoading, startLoading, stopLoading] = useLoading({ timeout: 3000 })

// With custom initial state
const [isLoading, startLoading, stopLoading] = useLoading({ initialState: true })

// Usage example
function MyComponent() {
  const [isLoading, startLoading, stopLoading] = useLoading()
  
  const handleSubmit = async () => {
    startLoading()
    try {
      await submitData()
    } finally {
      stopLoading()
    }
  }
  
  return (
    <div>
      {isLoading ? <LoadingSpinner /> : <Button onClick={handleSubmit}>Submit</Button>}
    </div>
  )
}
```

### withLoading HOC

A Higher Order Component (HOC) that adds loading state to any component.

```jsx
import withLoading from "@/components/with-loading"
import { Card } from "@/components/ui/card"

// Create a component with loading state
const LoadingCard = withLoading(Card, { 
  loadingText: "Loading card content...",
  size: "md"
})

// Use it in your component
function MyComponent() {
  const [isLoading, setIsLoading] = useState(false)
  
  return (
    <LoadingCard isLoading={isLoading}>
      {/* Card content */}
    </LoadingCard>
  )
}
```

## Demo

A demo page is available at `/spinner-demo` that showcases all the loading components and utilities.

## Best Practices

1. **Choose the right component for the context**:
   - Use `LoadingSpinner` for general loading indicators
   - Use `LoadingButton` for form submissions and actions
   - Use `withLoading` HOC for adding loading states to complex components

2. **Manage loading states with useLoading hook**:
   - Provides a clean API for managing loading states
   - Supports automatic timeouts
   - Includes toggle functionality

3. **Provide feedback to users**:
   - Always show loading indicators for operations that take more than 300ms
   - Use appropriate text to indicate what's happening
   - Consider using timeouts for operations that might take too long