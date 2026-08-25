'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Compass, MapPin, Heart, Sparkles, BookOpen, Layers, Plus, User, LogOut, LogIn } from 'lucide-react';
import { Trip } from '@/types';
import { User as FirebaseUser } from 'firebase/auth';

interface NavbarProps {
  trips: Trip[];
  activeTrip: Trip | null;
  onSelectTrip: (trip: Trip) => void;
  onOpenCreateTrip: () => void;
  onOpenWishlist: () => void;
  onOpenPhotoUploader: () => void;
  onOpenAuth: () => void;
  currentUser: FirebaseUser | null;
  onSignOut: () => void;
  visitedCount: number;
  wishlistCount: number;
}

export function Navbar({
  trips,
  activeTrip,
  onSelectTrip,
  onOpenCreateTrip,
  onOpenWishlist,
  onOpenPhotoUploader,
  onOpenAuth,
  currentUser,
  onSignOut,
  visitedCount,
  wishlistCount,
}: NavbarProps) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#013b40] bg-[#025259] text-white shadow-md font-sans">
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
          <div className="hidden md:flex items-center gap-2 ml-4 pl-4 border-l border-[#03717b]">
            {trips.length > 0 && activeTrip ? (
              <select
                id="trip-selector"
                value={activeTrip.id}
                onChange={(e) => {
                  const found = trips.find((t) => t.id === e.target.value);
                  if (found) onSelectTrip(found);
                }}
                className="rounded-lg border border-[#03717b] bg-[#013b40] px-3 py-1.5 text-xs font-medium text-white focus:border-[#ff947a] focus:outline-none transition"
              >
                {trips.map((t) => (
                  <option key={t.id} value={t.id}>
                    ✈️ {t.title} ({t.destination})
                  </option>
                ))}
              </select>
            ) : null}

            <button
              onClick={onOpenCreateTrip}
              className="flex items-center gap-1 rounded-lg border border-[#ff947a]/40 bg-[#ff947a]/20 px-2.5 py-1.5 text-xs font-bold text-[#FAF3E7] hover:bg-[#ff947a] hover:text-[#025259] transition"
              title="Create New Trip"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>New Trip</span>
            </button>
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
          {activeTrip && (
            <>
              <span className="h-3 w-[1px] bg-[#03717b]" />
              <Link
                href={`/reel/${activeTrip.slug}`}
                className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-white hover:text-[#E3A857] transition"
              >
                <Sparkles className="h-3.5 w-3.5 text-[#E3A857]" />
                <span>AI Reel</span>
              </Link>
            </>
          )}
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Wishlist Drawer Button */}
          <button
            onClick={onOpenWishlist}
            className="relative flex items-center gap-2 rounded-lg border border-[#03717b] bg-[#013b40] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#03717b] transition shadow-sm"
          >
            <Heart className="h-4 w-4 text-[#ff947a] fill-[#ff947a]/20" />
            <span className="hidden sm:inline">Wishlist</span>
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
            <span className="hidden sm:inline">AI Import</span>
          </button>

          {/* Auth Button / Profile Menu */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 rounded-xl border border-[#03717b] bg-[#013b40] p-1.5 hover:border-[#ff947a] transition"
              >
                {currentUser.photoURL ? (
                  <img src={currentUser.photoURL} alt={currentUser.displayName || 'User'} className="h-7 w-7 rounded-lg object-cover" />
                ) : (
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#ff947a] text-[#025259] font-bold text-xs">
                    {currentUser.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl border border-[#03717b] bg-[#013b40] p-2 shadow-2xl space-y-1 text-xs">
                  <div className="p-2 border-b border-[#03717b]">
                    <p className="font-bold text-white truncate">{currentUser.displayName || 'Food Explorer'}</p>
                    <p className="text-[10px] text-stone-300 truncate">{currentUser.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onSignOut();
                    }}
                    className="flex items-center gap-2 w-full p-2 text-left text-rose-300 hover:bg-[#03717b] rounded-lg transition"
                  >
                    <LogOut className="h-3.5 w-3.5" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 rounded-lg border border-[#ff947a] bg-[#ff947a]/10 px-3 py-1.5 text-xs font-bold text-[#ff947a] hover:bg-[#ff947a] hover:text-[#025259] transition"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>Sign In</span>
            </button>
          )}

        </div>
      </div>
    </header>
  );
}
