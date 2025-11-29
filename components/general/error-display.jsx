"use client"

import { AlertCircle, Home, ArrowLeft, ShieldAlert, WifiOff, ServerCrash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/lib/use-translations";
import { useLanguage } from "@/lib/language-provider";
import { useRouter } from "next/navigation";

const ErrorDisplay = ({ 
  message, 
  onRetry, 
  title,
  type = "error", // "error" | "auth" | "network" | "server" | "empty"
  showHomeButton = true,
  showBackButton = false
}) => {
  const { t } = useTranslations();
  const { isRTL } = useLanguage();
  const router = useRouter();

  // Icon selection based on error type
  const getIcon = () => {
    switch (type) {
      case "auth":
        return ShieldAlert;
      case "network":
        return WifiOff;
      case "server":
        return ServerCrash;
      default:
        return AlertCircle;
    }
  };

  const Icon = getIcon();

  // Get appropriate title based on type
  const getTitle = () => {
    if (title) return title;
    switch (type) {
      case "auth":
        return isRTL ? "مطلوب تسجيل الدخول" : "Authentication Required";
      case "network":
        return isRTL ? "خطأ في الاتصال" : "Connection Error";
      case "server":
        return isRTL ? "خطأ في الخادم" : "Server Error";
      default:
        return isRTL ? "حدث خطأ ما" : "Something went wrong";
    }
  };

  // Get appropriate message based on type (don't show raw API message, use translated message)
  const getMessage = () => {
    switch (type) {
      case "auth":
        return isRTL 
          ? "يرجى تسجيل الدخول للوصول إلى هذه الصفحة"
          : "Please sign in to access this page";
      case "network":
        return isRTL
          ? "تحقق من اتصالك بالإنترنت وحاول مرة أخرى"
          : "Check your internet connection and try again";
      case "server":
        return isRTL
          ? "نواجه مشكلات تقنية. يرجى المحاولة لاحقاً"
          : "We're experiencing technical issues. Please try again later";
      default:
        // Only show custom message for generic errors
        if (message) return message;
        return isRTL
          ? "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى"
          : "An unexpected error occurred. Please try again";
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[60vh] px-4 py-12 overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-red-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-72 h-72 bg-orange-500/5 rounded-full blur-3xl" />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-md">
        {/* Icon Container */}
        <div className="relative mb-8">
          {/* Icon background */}
          <div className="flex items-center justify-center w-28 h-28 rounded-full bg-red-50 dark:bg-red-950/30">
            <Icon className="w-14 h-14 text-red-500 dark:text-red-400" strokeWidth={1.5} />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
          {getTitle()}
        </h2>

        {/* Message */}
        <p className="text-base md:text-lg text-muted-foreground mb-8 leading-relaxed">
          {getMessage()}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {showBackButton && (
            <Button
              onClick={() => router.back()}
              size="lg"
              className="px-8 py-3 rounded-full font-semibold"
            >
              <ArrowLeft className={`w-4 h-4 ${isRTL ? "ml-2 rotate-180" : "mr-2"}`} />
              {isRTL ? "رجوع" : "Go Back"}
            </Button>
          )}

          {showHomeButton && (
            <Button
              onClick={() => router.push("/")}
              variant="outline"
              size="lg"
              className="px-6 py-3 rounded-full font-medium border-2"
            >
              <Home className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"}`} />
              {t("returnToHome") || (isRTL ? "الرجوع للصفحة الرئيسية" : "Go to Home")}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay;
