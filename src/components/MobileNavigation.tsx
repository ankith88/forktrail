'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, MapPin, Sparkles, Heart, BookOpen, PlusCircle } from 'lucide-react';

interface MobileNavigationProps {
  onOpenPhotoUploader?: () => void;
  onOpenWishlist?: () => void;
  wishlistCount?: number;
}

export function MobileNavigation({
  onOpenPhotoUploader,
  onOpenWishlist,
  wishlistCount = 0,
}: MobileNavigationProps) {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Feed', icon: Compass },
    { href: '/map', label: 'Map', icon: MapPin },
    { href: '/reel', label: 'Reels', icon: Sparkles },
    { href: '/blog', label: 'Blog', icon: BookOpen },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-[#03717b] bg-[#012d32]/95 backdrop-blur-md px-3 py-2 text-white shadow-2xl">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.slice(0, 2).map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
                isActive ? 'text-[#ff947a]' : 'text-stone-300 hover:text-white'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}

        {/* Center Quick AI Import Action Button */}
        {onOpenPhotoUploader && (
          <button
            onClick={onOpenPhotoUploader}
            className="-mt-5 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-[#ff947a] to-[#E3A857] text-[#025259] shadow-lg hover:scale-105 active:scale-95 transition-transform"
            aria-label="Import AI Food Photo"
          >
            <PlusCircle className="h-7 w-7 stroke-[2.5]" />
          </button>
        )}

        {navItems.slice(2).map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
                isActive ? 'text-[#ff947a]' : 'text-stone-300 hover:text-white'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
