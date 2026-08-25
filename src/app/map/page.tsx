'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MOCK_TRIPS, MOCK_CHAPTERS, MOCK_VISITED_PLACES, MOCK_WISHLIST } from '@/lib/mockData';
import { Trip, VisitedPlace, WishlistItem } from '@/types';
import { Map3DView } from '@/components/Map/Map3DView';
import { Compass, ArrowLeft, Layers, MapPin, Heart, Sparkles, Share2 } from 'lucide-react';

export default function Map3DPage() {
  const [activeTrip] = useState<Trip>(MOCK_TRIPS[0]);
  const [visitedPlaces] = useState<VisitedPlace[]>(MOCK_VISITED_PLACES['trip_tokyo_2025'] || []);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>(MOCK_WISHLIST);
  const [chapters] = useState(MOCK_CHAPTERS['trip_tokyo_2025'] || []);

  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);

  const handleConvertToVisited = (item: WishlistItem) => {
    setWishlistItems((prev) => prev.filter((w) => w.id !== item.id));
  };

  return (
    <div className="h-screen w-screen bg-[#FDF8F0] text-[#025259] flex flex-col font-sans overflow-hidden">
      
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

    </div>
  );
}
