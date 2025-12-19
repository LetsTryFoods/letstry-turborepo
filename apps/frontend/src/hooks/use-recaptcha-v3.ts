"use client";

import { useEffect, useState } from 'react';
import { recaptchaV3 } from '@/lib/recaptcha-v3';

export function useRecaptchaV3() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    recaptchaV3.loadRecaptchaScript()
      .then(() => setIsLoaded(true))
      .catch((error) => console.error('Failed to load reCAPTCHA:', error));
  }, []);

  const executeRecaptcha = async (action: string): Promise<string> => {
    if (!isLoaded) {
      console.warn('reCAPTCHA not loaded yet');
      return '';
    }
    return recaptchaV3.executeRecaptcha(action);
  };

  return {
    isLoaded,
    executeRecaptcha,
  };
}
