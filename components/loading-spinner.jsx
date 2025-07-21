"use client"


const LoadingSpinner = () => {
  
  return (
    <div className="fixed top-0 right-0  z-50  min-h-[100%] min-w-[100%] bg-[#fafafa] dark:bg-[#121212]">
  <div className="flex  items-center justify-center min-h-screen min-w-screen ">
<div>
      <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-gray-700">Loading...</p>
    </div>

  </div>

    </div>
  )
}

export default LoadingSpinner