'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Compass,
  MapPin,
  Sparkles,
  Heart,
  Menu,
  PlusCircle,
  Camera,
  Route,
  Plus,
  X,
} from 'lucide-react';

interface MobileNavigationProps {
  onOpenPhotoUploader?: () => void;
  onOpenWishlist?: () => void;
  wishlistCount?: number;
  onOpenSideDrawer?: () => void;
  onOpenMenuScanner?: () => void;
  onOpenItineraryPlanner?: () => void;
  onOpenAddVisit?: () => void;
}

export function MobileNavigation({
  onOpenPhotoUploader,
  onOpenWishlist,
  wishlistCount = 0,
  onOpenSideDrawer,
  onOpenMenuScanner,
  onOpenItineraryPlanner,
  onOpenAddVisit,
}: MobileNavigationProps) {
  const pathname = usePathname();
  const [isQuickSheetOpen, setIsQuickSheetOpen] = useState(false);

  return (
    <>
      {/* Fixed Bottom Touch Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-[#03717b] bg-[#012d32]/95 backdrop-blur-md px-3 py-2 text-white shadow-2xl">
        <div className="flex items-center justify-around max-w-md mx-auto relative">
          
          {/* Feed Tab */}
          <Link
            href="/"
            className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
              pathname === '/' ? 'text-[#ff947a]' : 'text-stone-300 hover:text-white'
            }`}
          >
            <Compass className={`h-5 w-5 ${pathname === '/' ? 'stroke-[2.5]' : 'stroke-2'}`} />
            <span>Feed</span>
          </Link>

          {/* Map Tab */}
          <Link
            href="/map"
            className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
              pathname === '/map' ? 'text-[#ff947a]' : 'text-stone-300 hover:text-white'
            }`}
          >
            <MapPin className={`h-5 w-5 ${pathname === '/map' ? 'stroke-[2.5]' : 'stroke-2'}`} />
            <span>Map</span>
          </Link>

          {/* Center Elevated Floating AI Action Button (FAB) */}
          <button
            type="button"
            onClick={() => setIsQuickSheetOpen(true)}
            className="-mt-6 flex h-13 w-13 items-center justify-center rounded-full bg-gradient-to-tr from-[#ff947a] to-[#E3A857] text-[#025259] shadow-xl hover:scale-105 active:scale-95 transition-transform border-2 border-[#012d32]"
            aria-label="Open AI Tools & Actions Sheet"
          >
            <PlusCircle className="h-8 w-8 stroke-[2.5]" />
          </button>

          {/* Wishlist Tab */}
          <button
            type="button"
            onClick={() => {
              if (onOpenWishlist) onOpenWishlist();
            }}
            className="relative flex flex-col items-center gap-1 text-[11px] font-medium text-stone-300 hover:text-white transition-colors"
          >
            <div className="relative">
              <Heart className="h-5 w-5 stroke-2 text-[#ff947a] fill-[#ff947a]/20" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1.5 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#ff947a] text-[9px] font-bold text-[#025259]">
                  {wishlistCount}
                </span>
              )}
            </div>
            <span>Wishlist</span>
          </button>

          {/* AI Menu Decoder Tab (Replaces redundant Menu icon) */}
          <button
            type="button"
            onClick={() => {
              if (onOpenMenuScanner) onOpenMenuScanner();
            }}
            className="flex flex-col items-center gap-1 text-[11px] font-medium text-stone-300 hover:text-white transition-colors"
            title="Scan & Decode Restaurant Menu"
          >
            <Camera className="h-5 w-5 stroke-2 text-[#ff947a]" />
            <span>Decoder</span>
          </button>

        </div>
      </nav>

      {/* Mobile Bottom Quick Action Sheet */}
      {isQuickSheetOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center font-sans md:hidden">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-[#011c1f]/75 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
            onClick={() => setIsQuickSheetOpen(false)}
          />

          {/* Action Sheet Panel */}
          <div className="relative w-full max-w-lg rounded-t-3xl border-t border-[#03717b] bg-[#012d32] p-5 text-white shadow-2xl z-10 space-y-4 animate-in slide-in-from-bottom duration-250">
            <div className="flex items-center justify-between border-b border-[#03717b] pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-[#ff947a]" />
                <span className="font-serif font-bold text-base text-white">AI Culinary Assistant</span>
              </div>
              <button
                type="button"
                onClick={() => setIsQuickSheetOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#013b40] text-stone-300 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              {onOpenPhotoUploader && (
                <button
                  type="button"
                  onClick={() => {
                    setIsQuickSheetOpen(false);
                    onOpenPhotoUploader();
                  }}
                  className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-[#ff947a]/40 bg-[#ff947a]/15 p-4 text-center text-[#FAF3E7] hover:bg-[#ff947a] hover:text-[#025259] transition shadow-sm font-bold"
                >
                  <Sparkles className="h-6 w-6 text-[#ff947a]" />
                  <span>Batch Import EXIF Photos</span>
                </button>
              )}

              {onOpenMenuScanner && (
                <button
                  type="button"
                  onClick={() => {
                    setIsQuickSheetOpen(false);
                    onOpenMenuScanner();
                  }}
                  className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-[#03717b] bg-[#013b40] p-4 text-center text-stone-200 hover:border-[#ff947a] transition shadow-sm font-bold"
                >
                  <Camera className="h-6 w-6 text-[#ff947a]" />
                  <span>AI Menu Decoder</span>
                </button>
              )}

              {onOpenItineraryPlanner && (
                <button
                  type="button"
                  onClick={() => {
                    setIsQuickSheetOpen(false);
                    onOpenItineraryPlanner();
                  }}
                  className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-[#03717b] bg-[#013b40] p-4 text-center text-stone-200 hover:border-[#ff947a] transition shadow-sm font-bold"
                >
                  <Route className="h-6 w-6 text-[#ff947a]" />
                  <span>AI Itinerary Route</span>
                </button>
              )}

              {onOpenAddVisit && (
                <button
                  type="button"
                  onClick={() => {
                    setIsQuickSheetOpen(false);
                    onOpenAddVisit();
                  }}
                  className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-[#03717b] bg-[#013b40] p-4 text-center text-stone-200 hover:border-[#ff947a] transition shadow-sm font-bold"
                >
                  <Plus className="h-6 w-6 text-[#E3A857]" />
                  <span>Log Visit Manually</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

