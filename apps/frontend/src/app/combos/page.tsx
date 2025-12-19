import type { Metadata } from 'next';
// import { ComboList } from './combo-list';

export const metadata: Metadata = {
  title: 'Combo Deals - Best Value Healthy Snacks | Letstry',
  description: 'Save more with Letstry combo deals! Get the best value on healthy snack combinations. Premium quality snacks bundled at amazing prices with free delivery.',
  openGraph: {
    title: 'Combo Deals | Letstry - Save More on Healthy Snacks',
    description: 'Discover amazing combo deals on healthy snacks. Save money while enjoying premium quality snacks delivered to your doorstep.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Combo Deals | Letstry - Save More on Healthy Snacks',
    description: 'Discover amazing combo deals on healthy snacks. Save money while enjoying premium quality snacks delivered to your doorstep.',
  },
};

export default function ComboPage() {
  return (
    <main>
      {/* <ComboList /> */}
    </main>
  );
}
