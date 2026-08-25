'use client';

import React, { useState } from 'react';
import { MOCK_USER, MOCK_TRIPS, MOCK_CHAPTERS, MOCK_VISITED_PLACES, MOCK_WISHLIST } from '@/lib/mockData';
import { Trip, TimelineChapter, VisitedPlace, WishlistItem, AIProcessedPhotoGroup } from '@/types';
import { Navbar } from '@/components/Navbar';
import { MapView } from '@/components/Dashboard/MapView';
import { TimelineView } from '@/components/Dashboard/TimelineView';
import { PhotoUploader } from '@/components/Dashboard/PhotoUploader';
import { WishlistDrawer } from '@/components/Dashboard/WishlistDrawer';
import { AddVisitModal } from '@/components/Dashboard/AddVisitModal';
import { Compass, MapPin, Calendar, Heart, Plus, Sparkles, Utensils, BookOpen, Share2, Layers } from 'lucide-react';
import { calculateHaversineDistance } from '@/lib/utils';

export default function DashboardPage() {
  const [trips] = useState<Trip[]>(MOCK_TRIPS);
  const [activeTrip, setActiveTrip] = useState<Trip>(MOCK_TRIPS[0]);

  // Chapters & Visited places for active trip
  const [chaptersMap, setChaptersMap] = useState<Record<string, TimelineChapter[]>>(MOCK_CHAPTERS);
  const [visitedPlacesMap, setVisitedPlacesMap] = useState<Record<string, VisitedPlace[]>>(MOCK_VISITED_PLACES);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>(MOCK_WISHLIST);

  const activeChapters = chaptersMap[activeTrip.id] || [];
  const activeVisitedPlaces = visitedPlacesMap[activeTrip.id] || [];

  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [activeDayFilter, setActiveDayFilter] = useState<number | 'all'>('all');

  // Modals & Drawers state
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isPhotoUploaderOpen, setIsPhotoUploaderOpen] = useState(false);
  const [isAddVisitModalOpen, setIsAddVisitModalOpen] = useState(false);
  const [targetChapterId, setTargetChapterId] = useState<string | undefined>(undefined);

  // Handle Trip switching
  const handleSelectTrip = (trip: Trip) => {
    setActiveTrip(trip);
    setSelectedPlaceId(null);
    setActiveDayFilter('all');
  };

  // Convert Wishlist item into a Visited Place with 1 click
  const handleConvertToVisited = (item: WishlistItem) => {
    const targetChapter = activeChapters[0] || {
      id: `chap_${activeTrip.id}_d1`,
      tripId: activeTrip.id,
      dayNumber: 1,
      date: activeTrip.startDate,
      title: 'Day 1: Culinary Exploration',
    };

    const newVisitedPlace: VisitedPlace = {
      id: `vp_${Date.now()}`,
      tripId: activeTrip.id,
      chapterId: targetChapter.id,
      placeId: item.placeId,
      name: item.name,
      address: item.address,
      lat: item.lat,
      lng: item.lng,
      visitTime: new Date().toISOString(),
      photoUrls: item.photoUrl
        ? [item.photoUrl]
        : ['https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80'],
      dishTags: [item.category, 'Must Try Spot'],
      rating: 5,
      tastingNotes: item.notes || `Converted from Wishlist bookmark!`,
      category: item.category,
      priceLevel: 2,
    };

    // Add to visited places
    setVisitedPlacesMap((prev) => ({
      ...prev,
      [activeTrip.id]: [...(prev[activeTrip.id] || []), newVisitedPlace],
    }));

    // Remove from wishlist
    setWishlistItems((prev) => prev.filter((w) => w.id !== item.id));
    setSelectedPlaceId(newVisitedPlace.id);
  };

  // Add Wishlist item
  const handleAddWishlistItem = (item: Partial<WishlistItem>) => {
    const newItem: WishlistItem = {
      id: `wish_${Date.now()}`,
      userId: MOCK_USER.id,
      tripId: activeTrip.id,
      placeId: item.placeId || `p_${Date.now()}`,
      name: item.name || 'Unnamed Spot',
      address: item.address || 'Tokyo, Japan',
      lat: item.lat || 35.6875,
      lng: item.lng || 139.6972,
      notes: item.notes || '',
      category: item.category || 'Restaurant',
      priority: item.priority || 'must-try',
      createdAt: new Date().toISOString(),
      photoUrl: item.photoUrl,
    };
    setWishlistItems((prev) => [newItem, ...prev]);
  };

  // Remove Wishlist item
  const handleRemoveWishlistItem = (id: string) => {
    setWishlistItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Save manually added Visit
  const handleSaveVisit = (visit: Partial<VisitedPlace>) => {
    const newPlace: VisitedPlace = {
      id: `vp_${Date.now()}`,
      tripId: activeTrip.id,
      chapterId: visit.chapterId || activeChapters[0]?.id || 'chap_d1',
      placeId: visit.placeId || `p_${Date.now()}`,
      name: visit.name || 'Culinary Spot',
      address: visit.address || 'Tokyo, Japan',
      lat: visit.lat || 35.6875,
      lng: visit.lng || 139.6972,
      visitTime: visit.visitTime || new Date().toISOString(),
      photoUrls: visit.photoUrls || [],
      dishTags: visit.dishTags || ['Tasty'],
      rating: visit.rating || 5,
      tastingNotes: visit.tastingNotes || '',
      priceLevel: visit.priceLevel || 2,
      category: visit.category || 'Ramen',
      recommendedDish: visit.recommendedDish,
    };

    setVisitedPlacesMap((prev) => ({
      ...prev,
      [activeTrip.id]: [...(prev[activeTrip.id] || []), newPlace],
    }));

    setSelectedPlaceId(newPlace.id);
  };

  // Delete Visit
  const handleDeletePlace = (placeId: string) => {
    setVisitedPlacesMap((prev) => ({
      ...prev,
      [activeTrip.id]: (prev[activeTrip.id] || []).filter((p) => p.id !== placeId),
    }));
  };

  // Import AI Processed Chapters
  const handleImportAIChapters = (aiChapters: AIProcessedPhotoGroup[]) => {
    const newChapters: TimelineChapter[] = [];
    const newPlaces: VisitedPlace[] = [];

    aiChapters.forEach((ac, idx) => {
      const chapId = `chap_ai_${Date.now()}_${idx}`;
      const dayNum = activeChapters.length + idx + 1;

      newChapters.push({
        id: chapId,
        tripId: activeTrip.id,
        dayNumber: dayNum,
        date: ac.date,
        title: ac.suggestedChapterTitle,
        notes: `AI Generated timeline from photo batch import`,
      });

      ac.places.forEach((p, pIdx) => {
        newPlaces.push({
          id: `vp_ai_${Date.now()}_${idx}_${pIdx}`,
          tripId: activeTrip.id,
          chapterId: chapId,
          placeId: `place_ai_${Date.now()}_${pIdx}`,
          name: p.suggestedVenueName,
          address: 'Tokyo, Japan',
          lat: p.lat || 35.6875 + pIdx * 0.005,
          lng: p.lng || 139.6972 + pIdx * 0.005,
          visitTime: p.visitTime,
          photoUrls: p.photoUrls.length ? p.photoUrls : ['https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80'],
          dishTags: p.detectedDishes,
          rating: p.suggestedRating,
          tastingNotes: p.suggestedTastingNotes,
          category: p.suggestedCategory,
          priceLevel: 2,
        });
      });
    });

    setChaptersMap((prev) => ({
      ...prev,
      [activeTrip.id]: [...(prev[activeTrip.id] || []), ...newChapters],
    }));

    setVisitedPlacesMap((prev) => ({
      ...prev,
      [activeTrip.id]: [...(prev[activeTrip.id] || []), ...newPlaces],
    }));
  };

  // Calculate total food trip distance
  const totalKmTraveled = activeVisitedPlaces.reduce((acc, curr, idx, arr) => {
    if (idx === 0) return 0;
    const prev = arr[idx - 1];
    return acc + calculateHaversineDistance(prev.lat, prev.lng, curr.lat, curr.lng);
  }, 0);

  return (
    <div className="min-h-screen bg-[#FDF8F0] text-[#025259] flex flex-col font-sans selection:bg-[#ff947a] selection:text-[#025259]">
      
      {/* Top Navbar Header */}
      <Navbar
        trips={trips}
        activeTrip={activeTrip}
        onSelectTrip={handleSelectTrip}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenPhotoUploader={() => setIsPhotoUploaderOpen(true)}
        visitedCount={activeVisitedPlaces.length}
        wishlistCount={wishlistItems.length}
      />

      {/* Main Content Dashboard */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Trip Hero Header Bar (Pine #025259 with Cream & Salmon accents) */}
        <div className="relative rounded-3xl overflow-hidden border border-[#025259]/20 bg-[#025259] text-white shadow-xl p-6 sm:p-8">
          <div className="absolute inset-0 opacity-20">
            <img
              src={activeTrip.coverUrl}
              alt={activeTrip.title}
              className="h-full w-full object-cover filter blur-sm scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#025259] via-[#025259]/90 to-transparent" />
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-full bg-[#ff947a] px-3 py-1 font-bold text-[#025259] shadow-sm">
                  📍 {activeTrip.destination}
                </span>
                <span className="flex items-center gap-1.5 text-[#FDF8F0] bg-[#013b40]/80 px-3 py-1 rounded-full border border-[#03717b]">
                  <Calendar className="h-3.5 w-3.5 text-[#E3A857]" />
                  {activeTrip.startDate} — {activeTrip.endDate}
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-serif font-bold text-white tracking-tight">
                {activeTrip.title}
              </h1>

              <p className="text-xs sm:text-sm text-[#FAF3E7] leading-relaxed">
                {activeTrip.summary}
              </p>
            </div>

            {/* Quick Metrics Bar */}
            <div className="flex items-center gap-4 bg-[#013b40]/90 backdrop-blur border border-[#03717b] p-4 rounded-2xl shrink-0 text-center shadow-md">
              <div>
                <span className="block text-xl font-bold text-[#ff947a]">{activeVisitedPlaces.length}</span>
                <span className="text-[10px] text-[#FAF3E7] uppercase tracking-wider font-semibold">Spots Logged</span>
              </div>
              <div className="h-8 w-[1px] bg-[#03717b]" />
              <div>
                <span className="block text-xl font-bold text-[#E3A857]">{wishlistItems.length}</span>
                <span className="text-[10px] text-[#FAF3E7] uppercase tracking-wider font-semibold">Wishlist</span>
              </div>
              <div className="h-8 w-[1px] bg-[#03717b]" />
              <div>
                <span className="block text-xl font-bold text-white">{totalKmTraveled} km</span>
                <span className="text-[10px] text-[#FAF3E7] uppercase tracking-wider font-semibold">Trail Route</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Split View: Interactive Map (Left) + Daily Timeline (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Interactive Map Component */}
          <div className="lg:col-span-6 h-[550px] lg:h-[750px] lg:sticky lg:top-20">
            <MapView
              visitedPlaces={activeVisitedPlaces}
              wishlistItems={wishlistItems}
              chapters={activeChapters}
              selectedPlaceId={selectedPlaceId}
              onSelectPlace={(place) => place && setSelectedPlaceId(place.id)}
              onConvertToVisited={handleConvertToVisited}
              activeDayFilter={activeDayFilter}
              onSelectDayFilter={(day) => setActiveDayFilter(day)}
            />
          </div>

          {/* Right Column: Timeline Chapters & Food Log */}
          <div className="lg:col-span-6 space-y-6">
            
            <div className="flex items-center justify-between bg-[#FFFFFF] p-4 rounded-2xl border border-[#025259]/15 shadow-sm">
              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-[#ff947a]" />
                <h2 className="font-serif font-bold text-lg text-[#025259]">Daily Food Diary</h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setTargetChapterId(undefined);
                    setIsAddVisitModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 rounded-lg bg-[#ff947a] border border-[#ff947a] px-3 py-1.5 text-xs font-bold text-[#025259] hover:bg-[#f08368] transition shadow-sm"
                >
                  <Plus className="h-4 w-4" />
                  Log Dining Visit
                </button>
              </div>
            </div>

            {/* Timeline View Component */}
            <TimelineView
              chapters={activeChapters}
              visitedPlaces={activeVisitedPlaces}
              selectedPlaceId={selectedPlaceId}
              onSelectPlace={(place) => setSelectedPlaceId(place.id)}
              onOpenAddModal={(chapId) => {
                setTargetChapterId(chapId);
                setIsAddVisitModalOpen(true);
              }}
              onDeletePlace={handleDeletePlace}
            />

          </div>

        </div>

      </main>

      {/* Modals & Drawers */}
      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlistItems={wishlistItems}
        onAddWishlistItem={handleAddWishlistItem}
        onConvertToVisited={handleConvertToVisited}
        onRemoveWishlistItem={handleRemoveWishlistItem}
      />

      <PhotoUploader
        isOpen={isPhotoUploaderOpen}
        onClose={() => setIsPhotoUploaderOpen(false)}
        onImportChapters={handleImportAIChapters}
      />

      <AddVisitModal
        isOpen={isAddVisitModalOpen}
        onClose={() => setIsAddVisitModalOpen(false)}
        chapters={activeChapters}
        defaultChapterId={targetChapterId}
        onSaveVisit={handleSaveVisit}
      />

      {/* Footer */}
      <footer className="mt-12 border-t border-[#013b40] bg-[#025259] py-8 text-center text-xs text-[#FAF3E7]">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Compass className="h-4 w-4 text-[#ff947a]" />
            <span className="font-serif font-bold text-white">ForkTrail</span>
            <span>— Culinary Travel & Food Blogging Platform</span>
          </div>
          <p>© {new Date().getFullYear()} ForkTrail. Built for foodies, travelers & culinary storytellers.</p>
        </div>
      </footer>

    </div>
  );
}
