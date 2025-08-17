"use client"

import { useState } from "react"
import LoadingSpinner from "@/components/loading-spinner"
import useLoading from "@/hooks/use-loading"
import withLoading from "@/components/with-loading"
import { Button } from "@/components/ui/button"
import { LoadingButton } from "@/components/ui/loading-button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

// Create a component with loading state using the HOC
const LoadingCard = withLoading(Card, { loadingText: "Loading card content..." })

export default function SpinnerDemo() {
  // Using the useLoading hook with a 3 second timeout
  const [isLoading, startLoading, stopLoading] = useLoading({ timeout: 3000 })
  
  // Using the useLoading hook without a timeout
  const [isInlineLoading, startInlineLoading, stopInlineLoading] = useLoading()
  
  // Manual loading state for comparison
  const [isManualLoading, setIsManualLoading] = useState(false)
  
  const simulateManualLoading = () => {
    setIsManualLoading(true)
    setTimeout(() => setIsManualLoading(false), 3000)
  }
  
  const simulateInlineLoading = () => {
    startInlineLoading()
    setTimeout(stopInlineLoading, 3000)
  }
  
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8">Loading Spinner Demo</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <Card>
          <CardHeader>
            <CardTitle>Full Page Spinner</CardTitle>
            <CardDescription>
              With useLoading hook (auto-timeout)
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-6">
            <Button onClick={startLoading}>
              Show Full Page Spinner
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Inline Spinner</CardTitle>
            <CardDescription>
              With useLoading hook (manual control)
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center py-6 min-h-[150px]">
            {isInlineLoading ? (
              <LoadingSpinner size="md" text="Loading data..." />
            ) : (
              <Button onClick={simulateInlineLoading}>
                Show Inline Spinner
              </Button>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Manual Loading State</CardTitle>
            <CardDescription>
              Traditional useState approach
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center py-6 min-h-[150px]">
            {isManualLoading ? (
              <LoadingSpinner size="md" text="Loading data..." />
            ) : (
              <Button onClick={simulateManualLoading}>
                Show Manual Spinner
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
      
      <h2 className="text-2xl font-bold mb-6 mt-10">Spinner Sizes</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <Card>
          <CardHeader>
            <CardTitle>Small Spinner</CardTitle>
            <CardDescription>size="sm"</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-6">
            <LoadingSpinner size="sm" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Medium Spinner</CardTitle>
            <CardDescription>size="md" (default)</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-6">
            <LoadingSpinner size="md" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Large Spinner</CardTitle>
            <CardDescription>size="lg"</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-6">
            <LoadingSpinner size="lg" />
          </CardContent>
        </Card>
      </div>
      
      <h2 className="text-2xl font-bold mb-6">Spinner with Text</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>With Text</CardTitle>
            <CardDescription>text="Custom loading message"</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-6">
            <LoadingSpinner size="md" text="Custom loading message" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Custom Styling</CardTitle>
            <CardDescription>Using className prop</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-6 bg-primary/5 rounded-md">
            <LoadingSpinner 
              size="md" 
              text="Loading with custom styles" 
              className="p-4 bg-background rounded-lg shadow-sm" 
            />
          </CardContent>
        </Card>
      </div>
      
      {/* Full page spinner with auto-timeout */}
      {isLoading && <LoadingSpinner fullPage text="Processing your request..." />}
      
      {/* Loading Button Example */}
      <h2 className="text-2xl font-bold mb-6 mt-10">Loading Button</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <Card>
          <CardHeader>
            <CardTitle>Loading Button</CardTitle>
            <CardDescription>Button with built-in loading state</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 py-6">
            <div className="flex gap-4">
              <LoadingButton 
                isLoading={isManualLoading} 
                onClick={simulateManualLoading}
              >
                Submit
              </LoadingButton>
              
              <LoadingButton 
                isLoading={isManualLoading} 
                loadingText="Saving..."
                onClick={simulateManualLoading}
                variant="outline"
              >
                Save
              </LoadingButton>
            </div>
            
            <div className="flex gap-4">
              <LoadingButton 
                isLoading={isManualLoading} 
                onClick={simulateManualLoading}
                variant="destructive"
              >
                Delete
              </LoadingButton>
              
              <LoadingButton 
                isLoading={isManualLoading} 
                loadingText="Processing Payment..."
                onClick={simulateManualLoading}
                variant="secondary"
              >
                Pay Now
              </LoadingButton>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Usage Example</CardTitle>
            <CardDescription>How to use the LoadingButton component</CardDescription>
          </CardHeader>
          <CardContent className="py-6">
            <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
              {`// Import the component
import { LoadingButton } from "@/components/ui/loading-button"

// Use with a loading state
const [isLoading, setIsLoading] = useState(false)

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
</LoadingButton>`}
            </pre>
          </CardContent>
        </Card>
      </div>
      
      {/* HOC Example */}
      <h2 className="text-2xl font-bold mb-6 mt-10">Higher Order Component</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <Card>
          <CardHeader>
            <CardTitle>withLoading HOC</CardTitle>
            <CardDescription>Add loading state to any component</CardDescription>
          </CardHeader>
          <CardContent className="py-6">
            <Button 
              onClick={simulateManualLoading} 
              className="mb-6"
            >
              Toggle Loading State
            </Button>
            
            <LoadingCard 
              isLoading={isManualLoading}
            >
              <CardContent>
                <p className="text-muted-foreground">This content is wrapped with the withLoading HOC</p>
                <p className="mt-2">It shows a spinner when isLoading is true</p>
              </CardContent>
            </LoadingCard>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>HOC Usage Example</CardTitle>
            <CardDescription>How to use the withLoading HOC</CardDescription>
          </CardHeader>
          <CardContent className="py-6">
            <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
              {`// Import the HOC
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
}`}
            </pre>
          </CardContent>
        </Card>
      </div>
      
      {/* Usage instructions */}
      <div className="mt-16 p-6 border rounded-lg bg-muted/20">
        <h2 className="text-xl font-semibold mb-4">How to Use</h2>
        <div className="space-y-2">
          <p><strong>Basic usage:</strong> <code className="bg-muted px-1 py-0.5 rounded">{`<LoadingSpinner />`}</code></p>
          <p><strong>Full page overlay:</strong> <code className="bg-muted px-1 py-0.5 rounded">{`<LoadingSpinner fullPage text="Loading..." />`}</code></p>
          <p><strong>With useLoading hook:</strong> <code className="bg-muted px-1 py-0.5 rounded">{`const [isLoading, startLoading, stopLoading] = useLoading()`}</code></p>
          <p><strong>With auto-timeout:</strong> <code className="bg-muted px-1 py-0.5 rounded">{`const [isLoading, startLoading] = useLoading({ timeout: 3000 })`}</code></p>
          <p><strong>Loading Button:</strong> <code className="bg-muted px-1 py-0.5 rounded">{`<LoadingButton isLoading={isLoading}>Submit</LoadingButton>`}</code></p>
          <p><strong>HOC Pattern:</strong> <code className="bg-muted px-1 py-0.5 rounded">{`const LoadingCard = withLoading(Card); <LoadingCard isLoading={isLoading} />`}</code></p>
        </div>
      </div>
    </div>
  )
}