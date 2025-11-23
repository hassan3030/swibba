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
      <div className="fixed inset-0 z-[999999999] flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950">
        <style>{`
          @keyframes auroraShift {
            0% { transform: translate3d(-10%, -10%, 0) scale(1); opacity: .65; }
            50% { transform: translate3d(10%, 5%, 0) scale(1.15); opacity: .9; }
            100% { transform: translate3d(-10%, -10%, 0) scale(1); opacity: .65; }
          }
          .aurora-layer {
            background: radial-gradient(circle at 30% 30%, rgba(16,185,129,0.55), transparent 60%),
                        radial-gradient(circle at 70% 40%, rgba(59,130,246,0.55), transparent 60%),
                        radial-gradient(circle at 50% 70%, rgba(99,102,241,0.45), transparent 65%);
            filter: blur(40px) saturate(140%);
            animation: auroraShift 8s ease-in-out infinite;
          }
          @keyframes blobMorph {
            0%,100% { border-radius: 46% 54% 55% 45% / 55% 52% 48% 45%; }
            25% { border-radius: 60% 40% 50% 50% / 45% 55% 55% 45%; }
            50% { border-radius: 50% 50% 42% 58% / 58% 42% 60% 40%; }
            75% { border-radius: 54% 46% 60% 40% / 40% 60% 45% 55%; }
          }
          .blob {
            animation: blobMorph 9s cubic-bezier(.55,.15,.35,.85) infinite;
            background: linear-gradient(135deg, rgba(16,185,129,0.75), rgba(59,130,246,0.65));
            box-shadow: 0 0 0 1px rgba(255,255,255,0.15), 0 8px 30px -6px rgba(59,130,246,0.35), 0 12px 55px -10px rgba(16,185,129,0.35);
          }
          @keyframes floatPulse {
            0% { transform: translateY(0) scale(1); }
            50% { transform: translateY(-6px) scale(1.02); }
            100% { transform: translateY(0) scale(1); }
          }
          .logo-float { animation: floatPulse 3.6s ease-in-out infinite; }
          @keyframes flipVertical {
            0% { transform: perspective(1000px) rotateY(0deg); }
            50% { transform: perspective(1000px) rotateY(180deg); }
            100% { transform: perspective(1000px) rotateY(360deg); }
          }
          .logo-flip { animation: flipVertical 4s ease-in-out infinite; }

        `}</style>
        <div className="relative flex items-center justify-center">
          {/* Aurora backdrop */}
          <div className="aurora-layer absolute inset-0 -z-10" />
          {/* Blob background only */}
          <div className="relative w-40 h-40 flex items-center justify-center">
            <div className="blob absolute inset-0" />
            <div className="relative w-24 h-24 flex items-center justify-center backdrop-blur-sm rounded-full border border-white/20 shadow-inner shadow-blue-200/20 dark:shadow-blue-900/30">
              <div className="logo-flip">
                <Image 
                  src="/loding.png"
                  alt="SWIBBA"
                  width={80}
                  height={80}
                  className="object-contain drop-shadow-md"
                  priority
                  loading="eager"
                  unoptimized
                />
              </div>
            </div>
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
      <div className="fixed inset-0 z-50 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center backdrop-blur-sm">
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