declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

export class RecaptchaV3Service {
  private siteKey: string;
  private isLoaded = false;

  constructor() {
    this.siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY || '';
  }

  loadRecaptchaScript(): Promise<void> {
    if (this.isLoaded) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        reject(new Error('Window is not defined'));
        return;
      }

      if (window.grecaptcha) {
        this.isLoaded = true;
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://www.google.com/recaptcha/api.js?render=${this.siteKey}`;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        this.isLoaded = true;
        resolve();
      };

      script.onerror = () => {
        reject(new Error('Failed to load reCAPTCHA script'));
      };

      document.head.appendChild(script);
    });
  }

  async executeRecaptcha(action: string): Promise<string> {
    if (!this.siteKey) {
      console.warn('reCAPTCHA v3 site key not configured');
      return '';
    }

    try {
      await this.loadRecaptchaScript();

      return new Promise((resolve, reject) => {
        window.grecaptcha.ready(async () => {
          try {
            const token = await window.grecaptcha.execute(this.siteKey, { action });
            resolve(token);
          } catch (error) {
            console.error('reCAPTCHA execution error:', error);
            reject(error);
          }
        });
      });
    } catch (error) {
      console.error('reCAPTCHA error:', error);
      return '';
    }
  }

  async verifyToken(token: string): Promise<boolean> {
    if (!token) return false;

    try {
      const response = await fetch('/api/verify-recaptcha', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();
      return data.success && data.score >= 0.5;
    } catch (error) {
      console.error('Token verification error:', error);
      return false;
    }
  }
}

export const recaptchaV3 = new RecaptchaV3Service();
