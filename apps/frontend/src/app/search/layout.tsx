import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search",
  robots: {
    index: false,
    follow: true,
  },
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <style>{`
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
