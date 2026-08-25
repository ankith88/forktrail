'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trip, VisitedPlace, WishlistItem, TimelineChapter } from '@/types';
import { Map3DView } from '@/components/Map/Map3DView';
import { Compass, ArrowLeft, Sparkles, Plus, MapPin } from 'lucide-react';
import { MobileNavigation } from '@/components/MobileNavigation';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { subscribeToAuthChanges } from '@/lib/firebase/auth';
import { fetchUserDataFromFirestore, deleteWishlistItemFromFirestore } from '@/lib/firebase/firestoreData';
import { User as FirebaseUser } from 'firebase/auth';
import {
  getStoredTrips,
  saveStoredTrips,
  getStoredVisitedPlaces,
  saveStoredVisitedPlaces,
  getStoredWishlist,
  saveStoredWishlist,
  getStoredChapters,
  saveStoredChapters,
} from '@/lib/storage';

export default function Map3DPage() {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);

  const [visitedPlacesMap, setVisitedPlacesMap] = useState<Record<string, VisitedPlace[]>>({});
  const [chaptersMap, setChaptersMap] = useState<Record<string, TimelineChapter[]>>({});
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);

  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);

  // Subscribe to auth & fetch data from local storage and Firestore
  useEffect(() => {
    let isMounted = true;

    const unsubscribe = subscribeToAuthChanges(async (user) => {
      setCurrentUser(user);

      const userId = user?.uid || null;

      // 1. Load from local storage immediately for fast render
      const localTrips = getStoredTrips(userId);
      const localVisited = getStoredVisitedPlaces(userId);
      const localWishlist = getStoredWishlist(userId);
      const localChapters = getStoredChapters(userId);

      if (isMounted) {
        setTrips(localTrips);
        setVisitedPlacesMap(localVisited);
        setWishlistItems(localWishlist);
        setChaptersMap(localChapters);
        setIsLoading(false);
      }

      // 2. Fetch fresh cloud data if user is logged in
      if (userId) {
        const cloudData = await fetchUserDataFromFirestore(userId);
        if (isMounted) {
          if (cloudData.trips.length > 0) {
            setTrips(cloudData.trips);
            saveStoredTrips(cloudData.trips, userId);
          }
          setVisitedPlacesMap(cloudData.visitedPlacesMap);
          saveStoredVisitedPlaces(cloudData.visitedPlacesMap, userId);

          setWishlistItems(cloudData.wishlistItems);
          saveStoredWishlist(cloudData.wishlistItems, userId);

          setChaptersMap(cloudData.chaptersMap);
          saveStoredChapters(cloudData.chaptersMap, userId);
        }
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // Compute active visited places and active chapters based on selected trip
  const activeVisitedPlaces = activeTrip
    ? visitedPlacesMap[activeTrip.id] || []
    : Object.values(visitedPlacesMap).flat();

  const activeChapters = activeTrip
    ? chaptersMap[activeTrip.id] || []
    : Object.values(chaptersMap).flat();

  const handleConvertToVisited = (item: WishlistItem) => {
    const updatedWishlist = wishlistItems.filter((w) => w.id !== item.id);
    setWishlistItems(updatedWishlist);
    saveStoredWishlist(updatedWishlist, currentUser?.uid);

    if (currentUser?.uid) {
      deleteWishlistItemFromFirestore(item.id);
    }
  };

  if (isLoading) {
    return (
      <LoadingScreen
        fullScreen
        size="lg"
        text="Loading 3D Map Engine..."
        subtext="Initializing interactive culinary map"
      />
    );
  }

  const allVisitedCount = Object.values(visitedPlacesMap).flat().length;

  return (
    <div className="h-screen w-screen bg-[#FDF8F0] text-[#025259] flex flex-col font-sans overflow-hidden pb-14 md:pb-0">
      
      {/* Top Floating Map Header */}
      <header className="sticky top-0 z-40 w-full border-b border-[#013b40] bg-[#025259] text-white px-4 sm:px-6 py-3 shadow-md flex items-center justify-between flex-wrap gap-2">
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

        {/* Trip Selection Dropdown */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#03717b] px-3 py-1.5 rounded-xl border border-white/20">
            <MapPin className="w-3.5 h-3.5 text-[#ff947a]" />
            <select
              value={activeTrip?.id || 'all'}
              onChange={(e) => {
                const val = e.target.value;
                if (val === 'all') {
                  setActiveTrip(null);
                } else {
                  const selected = trips.find((t) => t.id === val) || null;
                  setActiveTrip(selected);
                }
              }}
              className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-[#025259] text-white">
                All Trips & Hometown ({allVisitedCount} visits)
              </option>
              {trips.map((t) => (
                <option key={t.id} value={t.id} className="bg-[#025259] text-white">
                  ✈️ {t.title} ({(visitedPlacesMap[t.id] || []).length} visits)
                </option>
              ))}
            </select>
          </div>

          {activeTrip ? (
            <Link
              href={`/reel/${activeTrip.slug}`}
              className="flex items-center gap-1.5 rounded-lg bg-[#ff947a] px-3 py-1.5 text-xs font-bold text-[#025259] hover:bg-[#f08368] transition shadow"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Launch AI Story Reel
            </Link>
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
          visitedPlaces={activeVisitedPlaces}
          wishlistItems={wishlistItems}
          chapters={activeChapters}
          selectedPlaceId={selectedPlaceId}
          onSelectPlace={(place) => place && setSelectedPlaceId(place.id)}
          onConvertToVisited={handleConvertToVisited}
        />
      </div>

      <MobileNavigation wishlistCount={wishlistItems.length} />
    </div>
  );
}

