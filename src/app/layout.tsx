import type { Metadata, Viewport } from 'next';
import './globals.css';
import { SWRegister } from '@/components/SWRegister';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://palatero.app'),
  title: {
    default: 'Palatero - Taste the story.',
    template: '%s | Palatero',
  },
  description: 'Taste the story. Map your culinary journeys, AI cluster food photos, manage wishlists, and share magazine-style travel food logs.',
  manifest: '/manifest.json',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  other: {
    'ai-searchable': 'true',
    'llms-txt': 'https://palatero.app/llms.txt',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Palatero',
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
    title: 'Palatero - Taste the story.',
    description: 'Taste the story. Map your culinary journeys, AI cluster food photos, manage wishlists, and share magazine-style travel food logs.',
    siteName: 'Palatero',
    images: [
      {
        url: '/logo.png',
        width: 1080,
        height: 520,
        alt: 'Palatero - Taste the story.',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Palatero - Taste the story.',
    description: 'Taste the story. Map your culinary journeys, AI cluster food photos, manage wishlists, and share magazine-style travel food logs.',
    images: ['/logo.png'],
  },
};

export const viewport: Viewport = {
  themeColor: '#025259',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      '@id': 'https://palatero.app/#webapp',
      url: 'https://palatero.app',
      name: 'Palatero',
      applicationCategory: 'Travel & Dining Application',
      operatingSystem: 'All (Web, iOS, Android)',
      description: 'Taste the story. Map your culinary journeys, AI cluster food photos, manage wishlists, scan menus, and share magazine-style travel food logs.',
      browserRequirements: 'Requires JavaScript. Requires HTML5.',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      featureList: [
        'Culinary Journey Mapping',
        'AI Food Photo Clustering & Vision Processing',
        'Digital Passport Stamp Generator',
        'Multilingual AI Menu Scanner',
        'Foodie Travel Itinerary Planner',
        'Magazine-Style Food Story Reels',
        'Culinary Wishlist & Bucket Lists',
      ],
    },
    {
      '@type': 'Organization',
      '@id': 'https://palatero.app/#organization',
      name: 'Palatero',
      url: 'https://palatero.app',
      logo: 'https://palatero.app/logo-mark.png',
    },
    {
      '@type': 'WebSite',
      '@id': 'https://palatero.app/#website',
      url: 'https://palatero.app',
      name: 'Palatero - Taste the story',
      publisher: {
        '@id': 'https://palatero.app/#organization',
      },
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="alternate" type="text/markdown" href="/llms.txt" title="LLM documentation" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#FDF8F0] text-[#025259] selection:bg-[#ff947a] selection:text-white pb-16 md:pb-0">
        <SWRegister />
        {children}
      </body>
    </html>
  );
}


