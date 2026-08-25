'use client';

import React from 'react';
import Link from 'next/link';
import { Compass, MapPin, Heart, Sparkles, BookOpen, Layers } from 'lucide-react';
import { Trip } from '@/types';

interface NavbarProps {
  trips: Trip[];
  activeTrip: Trip;
  onSelectTrip: (trip: Trip) => void;
  onOpenWishlist: () => void;
  onOpenPhotoUploader: () => void;
  visitedCount: number;
  wishlistCount: number;
}

export function Navbar({
  trips,
  activeTrip,
  onSelectTrip,
  onOpenWishlist,
  onOpenPhotoUploader,
  visitedCount,
  wishlistCount,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#013b40] bg-[#025259] text-white shadow-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ff947a] text-[#025259] shadow-md transition-transform group-hover:scale-105">
              <Compass className="h-6 w-6 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-serif text-xl font-bold tracking-tight text-white">
                Fork<span className="text-[#ff947a]">Trail</span>
              </span>
              <span className="block text-[10px] uppercase tracking-widest text-[#E3A857] font-sans font-semibold">
                Culinary Travel Diary
              </span>
            </div>
          </Link>

          {/* Active Trip Selector Dropdown */}
          <div className="hidden md:flex items-center ml-4 pl-4 border-l border-[#03717b]">
            <label htmlFor="trip-selector" className="sr-only">Select Trip</label>
            <select
              id="trip-selector"
              value={activeTrip.id}
              onChange={(e) => {
                const found = trips.find((t) => t.id === e.target.value);
                if (found) onSelectTrip(found);
              }}
              className="rounded-lg border border-[#03717b] bg-[#013b40] px-3 py-1.5 text-xs font-medium text-white focus:border-[#ff947a] focus:outline-none focus:ring-1 focus:ring-[#ff947a] transition"
            >
              {trips.map((t) => (
                <option key={t.id} value={t.id}>
                  ✈️ {t.title} ({t.destination})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Center Navigation Links */}
        <div className="hidden lg:flex items-center gap-2 bg-[#013b40]/70 py-1.5 px-3 rounded-full border border-[#03717b]">
          <Link
            href="/map"
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-white hover:text-[#ff947a] transition"
          >
            <Layers className="h-3.5 w-3.5 text-[#ff947a]" />
            <span>3D Map</span>
          </Link>
          <span className="h-3 w-[1px] bg-[#03717b]" />
          <Link
            href={`/reel/${activeTrip.slug}`}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-white hover:text-[#E3A857] transition"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#E3A857]" />
            <span>AI Reel</span>
          </Link>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Wishlist Drawer Button */}
          <button
            onClick={onOpenWishlist}
            className="relative flex items-center gap-2 rounded-lg border border-[#03717b] bg-[#013b40] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#03717b] transition shadow-sm"
          >
            <Heart className="h-4 w-4 text-[#ff947a] fill-[#ff947a]/20" />
            <span className="hidden sm:inline">Want to Visit</span>
            {wishlistCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#ff947a] text-[10px] font-bold text-[#025259] shadow">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* AI Photo Uploader Button */}
          <button
            onClick={onOpenPhotoUploader}
            className="flex items-center gap-2 rounded-lg bg-[#ff947a] px-3.5 py-1.5 text-xs font-bold text-[#025259] hover:bg-[#f08368] shadow-md transition-all hover:scale-102"
          >
            <Sparkles className="h-4 w-4 text-[#025259]" />
            <span className="hidden sm:inline">AI Import Photos</span>
          </button>

          {/* Public Blog Preview Link */}
          <Link
            href={`/blog/alex_gourmet/${activeTrip.slug}`}
            className="flex items-center gap-1.5 rounded-lg border border-[#E3A857] bg-[#E3A857]/20 px-3 py-1.5 text-xs font-semibold text-[#FDF8F0] hover:bg-[#E3A857] hover:text-[#025259] transition"
          >
            <BookOpen className="h-4 w-4" />
            <span className="hidden md:inline">Public Blog</span>
          </Link>

        </div>
      </div>
    </header>
  );
}
