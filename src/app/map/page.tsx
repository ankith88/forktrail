'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trip, VisitedPlace, WishlistItem, TimelineChapter } from '@/types';
import { Map3DView } from '@/components/Map/Map3DView';
import { Compass, ArrowLeft, Sparkles, Plus } from 'lucide-react';
import { MobileNavigation } from '@/components/MobileNavigation';
import {
  getStoredTrips,
  getStoredVisitedPlaces,
  getStoredWishlist,
  getStoredChapters,
  saveStoredWishlist,
} from '@/lib/storage';

export default function Map3DPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);
  const [visitedPlaces, setVisitedPlaces] = useState<VisitedPlace[]>([]);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [chapters, setChapters] = useState<TimelineChapter[]>([]);

  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);

  // Load user data on mount
  useEffect(() => {
    const loadedTrips = getStoredTrips();
    const loadedVisitedMap = getStoredVisitedPlaces();
    const loadedWishlist = getStoredWishlist();
    const loadedChaptersMap = getStoredChapters();

    setTrips(loadedTrips);
    setWishlistItems(loadedWishlist);

    if (loadedTrips.length > 0) {
      const firstTrip = loadedTrips[0];
      setActiveTrip(firstTrip);
      setVisitedPlaces(loadedVisitedMap[firstTrip.id] || []);
      setChapters(loadedChaptersMap[firstTrip.id] || []);
    } else {
      // Flatten all visited places across trips if no active trip selected
      const allVisited = Object.values(loadedVisitedMap).flat();
      setVisitedPlaces(allVisited);
      const allChapters = Object.values(loadedChaptersMap).flat();
      setChapters(allChapters);
    }
  }, []);

  const handleConvertToVisited = (item: WishlistItem) => {
    const updatedWishlist = wishlistItems.filter((w) => w.id !== item.id);
    setWishlistItems(updatedWishlist);
    saveStoredWishlist(updatedWishlist);
  };

  return (
    <div className="h-screen w-screen bg-[#FDF8F0] text-[#025259] flex flex-col font-sans overflow-hidden pb-14 md:pb-0">
      
      {/* Top Floating Map Header */}
      <header className="sticky top-0 z-40 w-full border-b border-[#013b40] bg-[#025259] text-white px-4 sm:px-6 py-3 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-1.5 text-xs font-semibold text-[#FAF3E7] hover:text-[#ff947a] transition">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
          <span className="h-4 w-[1px] bg-[#03717b]" />
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#ff947a] text-[#025259]">
              <Compass className="h-4 w-4 stroke-[2.5]" />
            </div>
            <span className="font-serif font-bold text-base text-white">
              Fork<span className="text-[#ff947a]">Trail 3D Engine</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {activeTrip ? (
            <>
              <span className="hidden md:inline-block text-xs text-[#FAF3E7] font-medium">
                ✈️ {activeTrip.title}
              </span>
              <Link
                href={`/reel/${activeTrip.slug}`}
                className="flex items-center gap-1.5 rounded-lg bg-[#ff947a] px-3 py-1.5 text-xs font-bold text-[#025259] hover:bg-[#f08368] transition shadow"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Launch AI Story Reel
              </Link>
            </>
          ) : (
            <Link
              href="/"
              className="flex items-center gap-1.5 rounded-lg bg-[#ff947a] px-3 py-1.5 text-xs font-bold text-[#025259] hover:bg-[#f08368] transition shadow"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Dining Spot
            </Link>
          )}
        </div>
      </header>

      {/* Full-Screen 3D Map View Container */}
      <div className="flex-1 w-full h-full p-4 relative">
        <Map3DView
          visitedPlaces={visitedPlaces}
          wishlistItems={wishlistItems}
          chapters={chapters}
          selectedPlaceId={selectedPlaceId}
          onSelectPlace={(place) => place && setSelectedPlaceId(place.id)}
          onConvertToVisited={handleConvertToVisited}
        />
      </div>

      <MobileNavigation wishlistCount={wishlistItems.length} />
    </div>
  );
}
