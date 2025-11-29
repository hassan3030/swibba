"use client"

import Image from "next/image"


const LoadingSpinner = ({ 
  fullPage = false, 
  size = "md", 
  text, 
  className = "",
  branded = false
}) => {
  
  // Determine spinner size based on prop
  const sizeClasses = {
    sm: "w-6 h-6 border-2",
    md: "w-10 h-10 border-3",
    lg: "w-16 h-16 border-4"
  }
  
  // If branded spinner for home page, return SWIBBA branded version
  if (branded && fullPage) {
    return (
      <div className="fixed inset-0 z-[999999999] flex items-center justify-center bg-white dark:bg-gray-950" dir="ltr">
        <style>{`
          @keyframes blob-move {
            0%, 100% { transform: translate(0, 0) scale(1); }
            25% { transform: translate(10px, -10px) scale(1.1); }
            50% { transform: translate(-5px, 5px) scale(0.95); }
            75% { transform: translate(-10px, -5px) scale(1.05); }
          }
          .blob-animate {
            animation: blob-move 8s ease-in-out infinite;
          }
          
          /* Dash loader animation */
          .dash-container {
            display: flex;
          }
          .dash {
            margin: 0 15px;
            width: 35px;
            height: 15px;
            border-radius: 8px;
            background: linear-gradient(135deg, #00B4DB, #0083B0);
            box-shadow: 0 0 15px 0 rgba(16, 185, 129, 0.6);
          }
          .dark .dash {
            background: linear-gradient(135deg, #0083B0, #00B4DB);
            box-shadow: 0 0 15px 0 rgba(52, 211, 153, 0.5);
          }
          .dash-first {
            margin-right: -18px;
            transform-origin: center left;
            animation: spin-first 3s linear infinite;
          }
          .dash-second {
            transform-origin: center right;
            animation: spin-second 3s linear infinite;
            animation-delay: .2s;
          }
          .dash-third {
            transform-origin: center right;
            animation: spin-third 3s linear infinite;
            animation-delay: .3s;
          }
          .dash-fourth {
            transform-origin: center right;
            animation: spin-fourth 3s linear infinite;
            animation-delay: .4s;
          }
          
          @keyframes spin-first {
            0% { transform: rotate(0deg); }
            25% { transform: rotate(360deg); }
            30% { transform: rotate(370deg); }
            35% { transform: rotate(360deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes spin-second {
            0% { transform: rotate(0deg); }
            20% { transform: rotate(0deg); }
            30% { transform: rotate(-180deg); }
            35% { transform: rotate(-190deg); }
            40% { transform: rotate(-180deg); }
            78% { transform: rotate(-180deg); }
            95% { transform: rotate(-360deg); }
            98% { transform: rotate(-370deg); }
            100% { transform: rotate(-360deg); }
          }
          @keyframes spin-third {
            0% { transform: rotate(0deg); }
            27% { transform: rotate(0deg); }
            40% { transform: rotate(180deg); }
            45% { transform: rotate(190deg); }
            50% { transform: rotate(180deg); }
            62% { transform: rotate(180deg); }
            75% { transform: rotate(360deg); }
            80% { transform: rotate(370deg); }
            85% { transform: rotate(360deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes spin-fourth {
            0% { transform: rotate(0deg); }
            38% { transform: rotate(0deg); }
            60% { transform: rotate(-360deg); }
            65% { transform: rotate(-370deg); }
            75% { transform: rotate(-360deg); }
            100% { transform: rotate(-360deg); }
          }
        `}</style>
        
        {/* Animated gradient blobs - matching landing page style */}
        {/* <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="blob-animate absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-emerald-400/20 to-green-400/15 dark:from-emerald-600/15 dark:to-green-600/10 rounded-full blur-3xl" />
          <div className="blob-animate absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-teal-400/20 to-cyan-400/15 dark:from-teal-600/15 dark:to-cyan-600/10 rounded-full blur-3xl" style={{ animationDelay: '-2s' }} />
          <div className="blob-animate absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-green-300/15 to-emerald-300/10 dark:from-green-700/10 dark:to-emerald-700/8 rounded-full blur-3xl" style={{ animationDelay: '-4s' }} />
        </div> */}
        
        <div className="relative flex flex-col items-center justify-center gap-8">
          {/* Logo - static, larger to match dash width */}
          <div className="relative z-10">
            <Image 
              src="/logo.png"
              alt="SWIBBA"
              width={200}
              height={200}
              className="object-contain"
              priority
              loading="eager"
              unoptimized
            />
          </div>
          
          {/* Dash loader animation */}
          <div className="dash-container">
            <div className="dash dash-first"></div>
            <div className="dash dash-second"></div>
            <div className="dash dash-third"></div>
            <div className="dash dash-fourth"></div>
          </div>
        </div>
      </div>
    )
  }
  
  const spinnerContent = (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className={`${sizeClasses[size]} rounded-full relative`}>
        {/* Modern gradient spinner */}
        <div
          className="absolute inset-0 rounded-full animate-spin"
          style={{
            background: `conic-gradient(from 0deg, transparent 0%, #10b981 50%, #3b82f6 100%)`,
            padding: size === 'sm' ? '2px' : size === 'md' ? '3px' : '4px',
            animationDuration: '1s'
          }}
        >
          <div className="w-full h-full rounded-full bg-white dark:bg-slate-900" />
        </div>
      </div>
      {text && (
        <p className="mt-3 text-sm font-medium text-slate-600 dark:text-slate-400 animate-pulse">
          {text}
        </p>
      )}
    </div>
  )
  
  // Full page overlay with modern styling
  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center backdrop-blur-sm" dir="ltr">
        <style>{`
          @keyframes glow-pulse {
            0% { transform: scale(1); opacity: 0.5; }
            50% { transform: scale(2); opacity: 0.8; }
            100% { transform: scale(1); opacity: 0.5; }
          }
          .animate-glow-pulse {
            animation: glow-pulse 2.5s ease-in-out infinite;
          }
        `}</style>
        <div className="flex flex-col items-center justify-center relative">
          {/* Animated background glow - spreading shadow effect */}
          <div
            className="absolute w-20 h-20 rounded-full blur-3xl animate-glow-pulse"
            style={{
              background: "radial-gradient(circle, rgba(34, 197, 94, 0.5) 0%, rgba(59, 130, 246, 0.4) 50%, transparent 70%)",
            }}
          />
          
          {/* Main rotating spinner with gradient */}
          <div
            className="w-20 h-20 rounded-full relative z-10 animate-spin"
            style={{
              background: "conic-gradient(from 0deg, transparent 0%, #10b981 30%, #3b82f6 70%, transparent 100%)",
              padding: "3px",
              animationDuration: "1.2s"
            }}
          >
            <div className="w-full h-full rounded-full bg-white dark:bg-slate-900" />
          </div>
        </div>
      </div>
    )
  }
  
  return spinnerContent
}

export default LoadingSpinner