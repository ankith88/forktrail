import type { Metadata, Viewport } from 'next';
import './globals.css';
import { SWRegister } from '@/components/SWRegister';

export const metadata: Metadata = {
  title: 'ForkTrail — Culinary Travel Diary & Food Blogging Platform',
  description: 'Map your culinary journeys, AI cluster food photos, manage wishlists, and share magazine-style travel food logs.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'ForkTrail',
  },
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/icon-192.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#025259',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#FDF8F0] text-[#025259] selection:bg-[#ff947a] selection:text-white pb-16 md:pb-0">
        <SWRegister />
        {children}
      </body>
    </html>
  );
}

