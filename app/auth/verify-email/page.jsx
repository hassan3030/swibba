'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useTranslations } from "@/lib/use-translations"

export default function VerifyEmailPage() {
  // make it verified to check
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');
  const [tokenURL, setTokenURL] = useState('');
  const hasVerifiedRef = useRef(false); // Track if verification was attempted using ref
  const router = useRouter();
  const { t } = useTranslations()

  const searchParams = useSearchParams();

  useEffect(() => {
    // Prevent duplicate verification attempts
    if (hasVerifiedRef.current) return;
    hasVerifiedRef.current = true;
    
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      
      // console.log('Verify page - token from URL:', {
      //   token: token ? token.substring(0, 50) + '...' : '[MISSING]',
      //   fullURL: window.location.href
      // });

      if (!token) {
        if (isMounted) {
          setStatus('error');
          setMessage(t('No verification token found in the URL. Please check your email for the correct verification link.'));
        }
        return;
      }

      try {
        setTokenURL(token);
        
        // change url --------------
        const response = await fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();
        
        console.log('Verification API response:', {
          status: response.status,
          data,
          success: response.ok
        });

        if (response.ok && data.success) {
          setStatus('success');
          setMessage(t(data.message) || 'Email verified successfully! You can now sign in to your account.');
          // Redirect to sign in page after 3 seconds
          setTimeout(() => {
            router.push(`/auth/login`);
          }, 3000);
        } else {
          setStatus('error');
          setMessage(t(data.error) || 'Email verification failed. Please try again later.');
        }
      } catch (error) {
        console.error('Verification request failed:', error);
        setStatus('error');
        setMessage(t("Failed to verify email. Please check your internet connection and try again."));
      }
    };

    verifyEmail();
  }, [searchParams, router, t]);

  const handleGoToSignIn = () => {
    // handle change --------------
    router.push(`/auth/login?token=${tokenURL}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            {t("Email Verification")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            {status === 'loading' && (
              <>
                <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
                <p className="text-gray-600 text-center">
                 {t("Verifying your email address...")}
                </p>
              </>
            )}

            {status === 'success' && (
              <>
                <CheckCircle className="h-12 w-12 text-green-500" />
                <div className="text-center space-y-2">
                  <p className="text-green-600 font-medium">
                 {t("Email Verified Successfully!")}
                  </p>
                  <p className="text-gray-600 text-sm">
                    {message}
                  </p>
                  <p className="text-gray-500 text-xs">
                 {t("Redirecting to sign in page in 3 seconds...")}

                    
                  </p>
                </div>
              </>
            )}

            {status === 'error' && (
              <>
                <XCircle className="h-12 w-12 text-red-500" />
                <div className="text-center space-y-2">
                  <p className="text-red-600 font-medium">
                   {t("Verification Failed")}
                  </p>
                  <p className="text-gray-600 text-sm">
                    {t(message)}
                  </p>
                </div>
              </>
            )}
          </div>

          <div className="space-y-3">
            {status === 'success' && (
              <Button
                onClick={handleGoToSignIn}
                className="w-full  hover:bg-primary/70"
              >
               {t("Go to Sign In")}
              </Button>
            )}

            {status === 'error' && (
              <div className="space-y-2">
                <Button
                  onClick={handleGoToSignIn}
                  className="w-full  hover:bg-primary/70"
                >
                                {t("Go to Sign In")}

                </Button>
                <div className="text-center">
                  <p className="text-xs text-gray-500">
                    {t("Having trouble? Contact support for assistance.")}
                  </p>
                </div>
              </div>
            )}

            {status === 'loading' && (
              <div className="text-center">
                <p className="text-xs text-gray-500">
                  
{t("Please wait while we verify your email address...")}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}