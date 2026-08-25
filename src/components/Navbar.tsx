'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Menu,
  X,
  Compass,
  MapPin,
  Heart,
  Sparkles,
  Layers,
  Plus,
  LogOut,
  LogIn,
  Camera,
  Route,
  ChevronRight,
  User,
  BookOpen,
} from 'lucide-react';
import { Trip } from '@/types';
import { User as FirebaseUser } from 'firebase/auth';

interface NavbarProps {
  trips: Trip[];
  activeTrip: Trip | null;
  onSelectTrip: (trip: Trip) => void;
  onOpenCreateTrip: () => void;
  onOpenWishlist: () => void;
  onOpenPhotoUploader: () => void;
  onOpenMenuScanner?: () => void;
  onOpenItineraryPlanner?: () => void;
  onOpenAuth: () => void;
  currentUser: FirebaseUser | null;
  onSignOut: () => void;
  visitedCount: number;
  wishlistCount: number;
  isDrawerOpen?: boolean;
  onToggleDrawer?: (open?: boolean) => void;
}

export function Navbar({
  trips,
  activeTrip,
  onSelectTrip,
  onOpenCreateTrip,
  onOpenWishlist,
  onOpenPhotoUploader,
  onOpenMenuScanner,
  onOpenItineraryPlanner,
  onOpenAuth,
  currentUser,
  onSignOut,
  visitedCount,
  wishlistCount,
  isDrawerOpen: externalDrawerOpen,
  onToggleDrawer: externalToggleDrawer,
}: NavbarProps) {
  const [internalDrawerOpen, setInternalDrawerOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const isDrawerOpen = externalDrawerOpen !== undefined ? externalDrawerOpen : internalDrawerOpen;
  const toggleDrawer = (open?: boolean) => {
    const nextState = open !== undefined ? open : !isDrawerOpen;
    if (externalToggleDrawer) {
      externalToggleDrawer(nextState);
    } else {
      setInternalDrawerOpen(nextState);
    }
  };

  const hometownLogs = trips.filter((t) => t.categoryType === 'hometown_log' || t.isHometown);
  const travelTrips = trips.filter((t) => t.categoryType !== 'hometown_log' && !t.isHometown);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-[#013b40] bg-[#025259] text-white shadow-md font-sans">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8">
          
          {/* Left: Drawer Toggle Button, Brand Logo & Active Log Switcher */}
          <div className="flex items-center gap-2 sm:gap-3 overflow-hidden">
            {/* Side Drawer Toggle Hamburger Button */}
            <button
              type="button"
              onClick={() => toggleDrawer(true)}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#013b40] text-[#FAF3E7] hover:bg-[#03717b] hover:text-white transition shadow-sm border border-[#03717b] shrink-0"
              aria-label="Open Side Menu Drawer"
            >
              <Menu className="h-5 w-5 stroke-[2.5]" />
            </button>

            {/* Brand Logo */}
            <Link href="/" className="flex items-center gap-2 group shrink-0">
              <div className="relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-[#FAF3E7] p-1 shadow-md transition-transform group-hover:scale-105">
                <Image
                  src="/logo-mark.png"
                  alt="ForkTrail Mark"
                  width={36}
                  height={36}
                  className="h-full w-full object-contain"
                  priority
                />
              </div>
              <div className="hidden min-[400px]:block">
                <span className="font-serif text-lg sm:text-xl font-bold tracking-tight text-white block leading-tight">
                  Fork<span className="text-[#ff947a]">Trail</span>
                </span>
                <span className="block text-[9px] sm:text-[10px] uppercase tracking-widest text-[#E3A857] font-sans font-semibold">
                  Culinary Log
                </span>
              </div>
            </Link>

            {/* Active Journal Switcher Pill (Compact) */}
            {currentUser && trips.length > 0 && activeTrip && (
              <div className="flex items-center ml-1 sm:ml-2 border-l border-[#03717b] pl-2 max-w-[140px] min-[480px]:max-w-[200px] sm:max-w-xs">
                <select
                  id="header-trip-selector"
                  value={activeTrip.id}
                  onChange={(e) => {
                    const found = trips.find((t) => t.id === e.target.value);
                    if (found) onSelectTrip(found);
                  }}
                  className="w-full truncate rounded-lg border border-[#03717b] bg-[#013b40] px-2 py-1.5 text-xs font-medium text-[#FAF3E7] focus:border-[#ff947a] focus:outline-none transition cursor-pointer"
                  aria-label="Select Food Log"
                >
                  {hometownLogs.length > 0 && (
                    <optgroup label="🏠 Hometown Journals">
                      {hometownLogs.map((t) => (
                        <option key={t.id} value={t.id}>
                          🏠 {t.title}
                        </option>
                      ))}
                    </optgroup>
                  )}
                  {travelTrips.length > 0 && (
                    <optgroup label="✈️ Travel Trips">
                      {travelTrips.map((t) => (
                        <option key={t.id} value={t.id}>
                          ✈️ {t.title}
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>
            )}
          </div>

          {/* Right Action Controls */}
          {!currentUser ? (
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={onOpenAuth}
                className="flex items-center gap-2 rounded-xl bg-[#ff947a] px-3.5 py-2 text-xs font-bold text-[#025259] hover:bg-[#f08368] transition shadow-md"
              >
                <LogIn className="h-4 w-4" />
                <span>Sign In</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Wishlist Drawer Button */}
              <button
                type="button"
                onClick={onOpenWishlist}
                className="relative flex items-center gap-1.5 rounded-xl border border-[#03717b] bg-[#013b40] px-2.5 sm:px-3 py-1.5 text-xs font-medium text-white hover:bg-[#03717b] transition shadow-sm"
                title="View Wishlist Bookmarks"
              >
                <Heart className="h-4 w-4 text-[#ff947a] fill-[#ff947a]/20" />
                <span className="hidden md:inline font-semibold">Wishlist</span>
                {wishlistCount > 0 && (
                  <span className="flex h-4 sm:h-5 w-4 sm:w-5 items-center justify-center rounded-full bg-[#ff947a] text-[10px] font-bold text-[#025259] shadow">
                    {wishlistCount}
                  </span>
                )}
              </button>

              {/* AI Import Action Button */}
              <button
                type="button"
                onClick={onOpenPhotoUploader}
                className="flex items-center gap-1.5 rounded-xl bg-[#ff947a] px-2.5 sm:px-3.5 py-1.5 text-xs font-bold text-[#025259] hover:bg-[#f08368] shadow-md transition-all hover:scale-102"
              >
                <Sparkles className="h-4 w-4 text-[#025259]" />
                <span className="hidden sm:inline">AI Import</span>
              </button>

              {/* Profile Avatar / Auth Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 rounded-xl border border-[#03717b] bg-[#013b40] p-1 hover:border-[#ff947a] transition shadow-sm"
                >
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || 'User'}
                      className="h-7 w-7 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#ff947a] text-[#025259] font-bold text-xs">
                      {currentUser.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl border border-[#03717b] bg-[#013b40] p-2 shadow-2xl space-y-1 text-xs z-50">
                    <div className="p-2 border-b border-[#03717b]">
                      <p className="font-bold text-white truncate">{currentUser.displayName || 'Food Explorer'}</p>
                      <p className="text-[10px] text-stone-300 truncate">{currentUser.email}</p>
                    </div>
                    <button
                      type="button"
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
            </div>
          )}
        </div>
      </header>

      {/* Slide-over Side Drawer Menu (Mobile & Desktop App Shell) */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex font-sans">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-[#011c1f]/75 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
            onClick={() => toggleDrawer(false)}
          />

          {/* Side Drawer Panel */}
          <aside className="relative flex w-80 max-w-[85vw] flex-col justify-between border-r border-[#03717b] bg-[#012d32] p-5 text-white shadow-2xl z-10 transition-transform duration-300 ease-out animate-in slide-in-from-left">
            <div className="space-y-6 overflow-y-auto">
              
              {/* Drawer Top Header: Logo + Close Button */}
              <div className="flex items-center justify-between border-b border-[#03717b] pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-[#FAF3E7] p-1 shadow-md">
                    <Image
                      src="/logo-mark.png"
                      alt="ForkTrail Mark"
                      width={32}
                      height={32}
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div>
                    <span className="font-serif text-lg font-bold tracking-tight text-white block leading-tight">
                      Fork<span className="text-[#ff947a]">Trail</span>
                    </span>
                    <span className="block text-[9px] uppercase tracking-widest text-[#E3A857] font-sans font-semibold">
                      Mobile Command Center
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => toggleDrawer(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#013b40] text-stone-300 hover:bg-[#03717b] hover:text-white transition"
                  aria-label="Close Side Drawer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Active User Card */}
              {currentUser ? (
                <div className="rounded-2xl border border-[#03717b] bg-[#025259]/60 p-3 flex items-center gap-3">
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || 'User'}
                      className="h-10 w-10 rounded-xl object-cover border border-[#ff947a]"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ff947a] text-[#025259] font-bold text-sm">
                      {currentUser.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                  <div className="overflow-hidden text-xs">
                    <p className="font-bold text-white truncate">{currentUser.displayName || 'Food Explorer'}</p>
                    <p className="text-[11px] text-stone-300 truncate">{currentUser.email}</p>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    toggleDrawer(false);
                    onOpenAuth();
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#ff947a] p-3 text-xs font-bold text-[#025259] hover:bg-[#f08368] transition shadow-md"
                >
                  <LogIn className="h-4 w-4" /> Sign In / Register Account
                </button>
              )}

              {/* Section 1: Food Journals & Logs */}
              {currentUser && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-[#E3A857]">
                    <span>Food Journals & Trips</span>
                    <button
                      type="button"
                      onClick={() => {
                        toggleDrawer(false);
                        onOpenCreateTrip();
                      }}
                      className="flex items-center gap-1 rounded bg-[#ff947a]/20 px-2 py-0.5 text-[10px] font-bold text-[#ff947a] hover:bg-[#ff947a] hover:text-[#025259] transition"
                    >
                      <Plus className="h-3 w-3" /> New Log
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    {trips.map((t) => {
                      const isActive = activeTrip?.id === t.id;
                      const isHometown = t.categoryType === 'hometown_log' || t.isHometown;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => {
                            onSelectTrip(t);
                            toggleDrawer(false);
                          }}
                          className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs transition text-left ${
                            isActive
                              ? 'bg-[#ff947a] text-[#025259] font-bold shadow-sm'
                              : 'bg-[#013b40]/80 text-stone-200 hover:bg-[#03717b] hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span>{isHometown ? '🏠' : '✈️'}</span>
                            <span className="truncate">{t.title}</span>
                          </div>
                          <span className="text-[10px] opacity-80 shrink-0">{t.destination}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Section 2: AI Culinary Suite Navigation */}
              <div className="space-y-2 pt-2 border-t border-[#03717b]">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-[#E3A857]">
                  AI Culinary Suite
                </span>

                <div className="space-y-1 text-xs">
                  <Link
                    href="/map"
                    onClick={() => toggleDrawer(false)}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-[#013b40]/60 text-stone-200 hover:bg-[#03717b] hover:text-white transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <Layers className="h-4 w-4 text-[#ff947a]" />
                      <span className="font-semibold">3D Culinary Map</span>
                    </div>
                    <ChevronRight className="h-4 w-4 opacity-50" />
                  </Link>

                  {onOpenMenuScanner && (
                    <button
                      type="button"
                      onClick={() => {
                        toggleDrawer(false);
                        onOpenMenuScanner();
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#013b40]/60 text-stone-200 hover:bg-[#03717b] hover:text-white transition text-left"
                    >
                      <div className="flex items-center gap-2.5">
                        <Camera className="h-4 w-4 text-[#ff947a]" />
                        <span className="font-semibold">AI Menu Decoder</span>
                      </div>
                      <span className="text-[10px] bg-[#ff947a]/20 text-[#ff947a] px-2 py-0.5 rounded-full font-bold">
                        Scan Photo
                      </span>
                    </button>
                  )}

                  {onOpenItineraryPlanner && (
                    <button
                      type="button"
                      onClick={() => {
                        toggleDrawer(false);
                        onOpenItineraryPlanner();
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#013b40]/60 text-stone-200 hover:bg-[#03717b] hover:text-white transition text-left"
                    >
                      <div className="flex items-center gap-2.5">
                        <Route className="h-4 w-4 text-[#ff947a]" />
                        <span className="font-semibold">AI Itinerary Planner</span>
                      </div>
                      <span className="text-[10px] bg-[#ff947a]/20 text-[#ff947a] px-2 py-0.5 rounded-full font-bold">
                        Smart Route
                      </span>
                    </button>
                  )}

                  {activeTrip && (
                    <Link
                      href={`/reel/${activeTrip.slug}`}
                      onClick={() => toggleDrawer(false)}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-[#013b40]/60 text-stone-200 hover:bg-[#03717b] hover:text-white transition"
                    >
                      <div className="flex items-center gap-2.5">
                        <Sparkles className="h-4 w-4 text-[#E3A857]" />
                        <span className="font-semibold">AI Story Reel</span>
                      </div>
                      <ChevronRight className="h-4 w-4 opacity-50" />
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      toggleDrawer(false);
                      onOpenPhotoUploader();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#ff947a]/20 border border-[#ff947a]/40 text-[#FAF3E7] hover:bg-[#ff947a] hover:text-[#025259] transition text-left font-bold"
                  >
                    <div className="flex items-center gap-2.5">
                      <Sparkles className="h-4 w-4" />
                      <span>Batch Import EXIF Photos</span>
                    </div>
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Section 3: Bookmarks & Saved */}
              <div className="space-y-2 pt-2 border-t border-[#03717b]">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-[#E3A857]">
                  Bookmarks & Saved
                </span>

                <button
                  type="button"
                  onClick={() => {
                    toggleDrawer(false);
                    onOpenWishlist();
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#013b40]/60 text-stone-200 hover:bg-[#03717b] hover:text-white transition text-left text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <Heart className="h-4 w-4 text-[#ff947a] fill-[#ff947a]/20" />
                    <span className="font-semibold">Wishlist Bookmarks</span>
                  </div>
                  {wishlistCount > 0 && (
                    <span className="rounded-full bg-[#ff947a] px-2 py-0.5 text-[10px] font-bold text-[#025259]">
                      {wishlistCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Drawer Footer: Auth / Sign Out */}
            {currentUser && (
              <div className="pt-4 border-t border-[#03717b]">
                <button
                  type="button"
                  onClick={() => {
                    toggleDrawer(false);
                    onSignOut();
                  }}
                  className="flex items-center gap-2.5 w-full p-2.5 text-left text-xs font-bold text-rose-300 hover:bg-[#03717b] rounded-xl transition"
                >
                  <LogOut className="h-4 w-4" /> Sign Out
                </button>
              </div>
            )}
          </aside>
        </div>
      )}
    </>
  );
}

