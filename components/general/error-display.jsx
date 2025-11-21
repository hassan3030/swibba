"use client"

import { Frown } from "lucide-react";
import { Button } from "@/components/ui/button";

const ErrorDisplay = ({ message, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
      <Frown className="w-16 h-16 mb-4 text-red-500" />
      <h2 className="text-2xl font-semibold mb-2 text-red-500">Something went wrong</h2>
      <p className="mb-4">{message}</p>
      {onRetry && (
        <Button onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
};

export default ErrorDisplay;
