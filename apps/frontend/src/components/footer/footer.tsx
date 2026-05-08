import Link from 'next/link';
import Image from 'next/image';

const SHOP_LINKS: Array<{ href: string; label: string }> = [
  { href: '/bhujia', label: 'Bhujia & Namkeen' },
  { href: '/makhana', label: 'Flavoured Makhana' },
  { href: '/cookies', label: 'Healthy Cookies' },
  { href: '/healthy-snacks', label: 'Healthy Snacks' },
  { href: '/fasting-special', label: 'Vrat / Fasting' },
  { href: '/rusk', label: 'Cake Rusks' },
  { href: '/purani-delhi', label: 'Purani Delhi' },
];

const EXPLORE_LINKS: Array<{ href: string; label: string }> = [
  // { href: '/category/no-palm-oil-snacks', label: 'No Palm Oil Snacks?' },
  { href: '/blog', label: 'Blog' },
  { href: '/about-us', label: 'About Us' },
  { href: '/bulk-corporate', label: 'Bulk & Corporate' },
];

const HELP_LINKS: Array<{ href: string; label: string }> = [
  { href: '/contact-us', label: 'Contact Us' },
  { href: '/track', label: 'Track Order' },
  { href: '/shipping-policy', label: 'Shipping Policy' },
  { href: '/refund-cancellations', label: 'Refund & Cancellations' },
  { href: '/terms-of-service', label: 'Terms of Service' },
];

export function Footer() {
  return (
    <footer className="bg-[#1A2332] text-white">
      <div className="container mx-auto px-6 md:px-10 lg:px-[70px] py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-8">
          <div className="col-span-2 md:col-span-1 flex flex-col items-start">
            <div className="mb-6">
              <Image
                src="/logo.webp"
                alt="Let's Try Foods"
                width={120}
                height={120}
                className="w-20 h-20 object-contain"
                priority
              />
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Healthy Indian snacks with no palm oil and no maida. Shipped across India from Delhi.
            </p>
          </div>

          <div>
            <h3 className="text-white font-bold text-base mb-4">SHOP</h3>
            <nav aria-label="Shop categories" className="flex flex-col gap-3">
              {SHOP_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <h3 className="text-white font-bold text-base mb-4">EXPLORE</h3>
            <nav aria-label="Explore" className="flex flex-col gap-3">
              {EXPLORE_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <h3 className="text-white font-bold text-base mb-4">HELP</h3>
            <nav aria-label="Help" className="flex flex-col gap-3">
              {HELP_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <h3 className="text-white font-bold text-base mb-4">CONTACT</h3>
            <address className="not-italic text-gray-300 flex flex-col gap-2 text-sm">
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
                Export queries:{' '}
                <Link href="mailto:export@earthcrust.co.in" className="hover:text-white transition-colors underline">
                  export@earthcrust.co.in
                </Link>
              </p>
            </address>
          </div>
        </div>

        <div className="border-t border-gray-600 pt-8 pb-6">
          <div>
            <h3 className="text-white font-semibold text-base mb-3">Follow us</h3>
            <div className="flex gap-3">
              <Link
                href="https://www.facebook.com/p/Lets-Try-100067844378739/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-[#1877F2] rounded flex items-center justify-center hover:opacity-80 transition-opacity"
                aria-label="Facebook"
              >
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </Link>
              <Link
                href="https://www.instagram.com/letstry_foods/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737] rounded flex items-center justify-center hover:opacity-80 transition-opacity"
                aria-label="Instagram"
              >
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
