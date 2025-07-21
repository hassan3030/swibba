'use client'
// pages/auth/callback.tsx
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function GoogleCallback() {
  const router = useRouter();

  useEffect(() => {
    const url = new URL(window.location.href);
    const access_token = url.hash.split('access_token=')[1]?.split('&')[0];

    if (access_token) {
      localStorage.setItem('access_token', access_token);
      router.push('/dashboard'); // or wherever you want to go
    } else {
      // Handle error or redirect
      router.push('/login');
    }
  }, []);

  return <p>Logging in...</p>;
}
