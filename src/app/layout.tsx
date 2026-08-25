import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ForkTrail — Culinary Travel Diary & Food Blogging Platform',
  description: 'Map your culinary journeys, AI cluster food photos, manage wishlists, and share magazine-style travel food logs.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#FDF8F0] text-[#025259] selection:bg-[#ff947a] selection:text-white">
        {children}
      </body>
    </html>
  );
}
