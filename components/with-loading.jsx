"use client"

import React from 'react'
import LoadingSpinner from './loading-spinner'

/**
 * Higher Order Component (HOC) that adds loading state to any component
 * 
 * @param {React.ComponentType} Component - The component to wrap
 * @param {Object} options - Configuration options
 * @param {string} options.size - Size of the spinner: 'sm', 'md', 'lg'
 * @param {string} options.loadingText - Text to display during loading
 * @param {string} options.spinnerClassName - Additional CSS classes for the spinner
 * @returns {React.FC} - The wrapped component with loading functionality
 * 
 * @example
 * // Basic usage
 * const LoadingCard = withLoading(Card);
 * <LoadingCard isLoading={isLoading} {...cardProps} />
 * 
 * // With custom options
 * const LoadingTable = withLoading(Table, { 
 *   size: 'lg',
 *   loadingText: 'Loading data...',
 *   spinnerClassName: 'my-custom-spinner'
 * });
 */
const withLoading = (Component, options = {}) => {
  const {
    size = 'md',
    loadingText = '',
    spinnerClassName = ''
  } = options
  
  const WithLoading = ({ isLoading, ...props }) => {
    if (isLoading) {
      return (
        <div className="relative w-full h-full min-h-[100px] flex items-center justify-center">
          <LoadingSpinner 
            size={size} 
            text={loadingText} 
            className={spinnerClassName} 
          />
        </div>
      )
    }
    
    return <Component {...props} />
  }
  
  // Set display name for better debugging
  const componentName = Component.displayName || Component.name || 'Component'
  WithLoading.displayName = `WithLoading(${componentName})`
  
  return WithLoading
}

export default withLoading