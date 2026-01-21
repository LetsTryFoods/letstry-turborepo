"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

export function Footer() {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <footer className="bg-[#1A2332] text-white">
      <div className="container mx-auto px-6 md:px-10 lg:px-[70px] py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="flex flex-col items-start">
            <div className="mb-6">
              <Image
                src="/logo.webp"
                alt="Let's Try"
                width={120}
                height={120}
                className="w-20 h-20 object-contain"
                priority
              />
            </div>
          </div>

          <div>
            <h3 className="text-white font-bold text-lg mb-4">QUICK LINKS</h3>
            <nav className="flex flex-col gap-3">
              <Link href="/search" className="text-gray-300 hover:text-white transition-colors">
                Search
              </Link>
              <Link href="/refund-cancellations" className="text-gray-300 hover:text-white transition-colors">
                Refund & Cancellations
              </Link>
              <Link href="/shipping-policy" className="text-gray-300 hover:text-white transition-colors">
                Shipping Policy
              </Link>
              <Link href="/terms-of-service" className="text-gray-300 hover:text-white transition-colors">
                Terms of Service
              </Link>
            </nav>
          </div>

          <div>
            <h3 className="text-white font-bold text-lg mb-4">CONTACT US</h3>
            <address className="not-italic text-gray-300 flex flex-col gap-2">
              <p className="font-semibold text-white">Earth Crust Pvt Ltd</p>
              <p>CIN: U15549DL2020PTC365385</p>
              <p>329, 1st Floor, Indra Vihar, Delhi-110009</p>
              <Link href="mailto:ecom@earthcrust.co.in" className="hover:text-white transition-colors">
                ecom@earthcrust.co.in
              </Link>
              <Link href="tel:+919654932262" className="hover:text-white transition-colors">
                +91-9654-932-262
              </Link>
              <p className="mt-2">
                For export queries mail us at{' '}
                <Link href="mailto:export@earthcrust.co.in" className="hover:text-white transition-colors underline">
                  export@earthcrust.co.in
                </Link>
              </p>
            </address>
          </div>
        </div>

        <div className="border-t border-gray-600 pt-8 pb-6">
          <div className="mb-6">
            <h3 className="text-white font-semibold text-base mb-4">Subscribe to our emails</h3>
            <form onSubmit={handleSubscribe} className="flex gap-3 max-w-md">
              <Input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-transparent border border-gray-600 text-white placeholder:text-gray-400 focus:border-white"
                required
              />
              <Button 
                type="submit" 
                className="bg-white text-[#1A2332] font-semibold hover:bg-gray-100 px-8"
              >
                SUBSCRIBE
              </Button>
            </form>
          </div>

          <div>
            <h3 className="text-white font-semibold text-base mb-3">Follow us</h3>
            <div className="flex gap-3">
              <Link 
                href="https://facebook.com" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-[#1877F2] rounded flex items-center justify-center hover:opacity-80 transition-opacity"
                aria-label="Facebook"
              >
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </Link>
              <Link 
                href="https://instagram.com" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737] rounded flex items-center justify-center hover:opacity-80 transition-opacity"
                aria-label="Instagram"
              >
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
