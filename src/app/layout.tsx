import type { Metadata, Viewport } from 'next';
import './globals.css';
import { SWRegister } from '@/components/SWRegister';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://forktrail.app'),
  title: 'ForkTrail — Culinary Travel Diary & Food Blogging Platform',
  description: 'Map your culinary journeys, AI cluster food photos, manage wishlists, and share magazine-style travel food logs.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'ForkTrail',
  },
  icons: {
    icon: [
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon.ico' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    title: 'ForkTrail — Your Culinary Journey',
    description: 'Map your culinary journeys, AI cluster food photos, manage wishlists, and share magazine-style travel food logs.',
    siteName: 'ForkTrail',
    images: [
      {
        url: '/logo.png',
        width: 568,
        height: 560,
        alt: 'ForkTrail - Your Culinary Journey',
      },
    ],
    type: 'website',
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

