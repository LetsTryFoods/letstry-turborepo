'use client';

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <style jsx global>{`
        @media (max-width: 768px) {
          nav {
            display: none !important;
          }
        }
      `}</style>
      {children}
    </>
  );
}
