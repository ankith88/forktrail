'use client';

import React, { useState, useEffect } from 'react';
import { Trip, TimelineChapter, VisitedPlace, WishlistItem, AIProcessedPhotoGroup, ReelData } from '@/types';
import { Navbar } from '@/components/Navbar';
import { MapView } from '@/components/Dashboard/MapView';
import { TimelineView } from '@/components/Dashboard/TimelineView';
import { PhotoUploader } from '@/components/Dashboard/PhotoUploader';
import { WishlistDrawer } from '@/components/Dashboard/WishlistDrawer';
import { AddVisitModal } from '@/components/Dashboard/AddVisitModal';
import { CreateTripModal } from '@/components/Dashboard/CreateTripModal';
import { AuthModal } from '@/components/Auth/AuthModal';
import { OccasionPromptModal } from '@/components/Reel/OccasionPromptModal';
import { ReelViewer } from '@/components/Reel/ReelViewer';
import { subscribeToAuthChanges, logoutUser } from '@/lib/firebase/auth';
import { User as FirebaseUser } from 'firebase/auth';
import { Compass, MapPin, Calendar, Heart, Plus, Sparkles, Utensils, BookOpen, Share2, Layers, LogIn, UserPlus, Film } from 'lucide-react';
import { calculateHaversineDistance } from '@/lib/utils';

export default function DashboardPage() {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);

  // Trips & State initialized clean
  const [trips, setTrips] = useState<Trip[]>([]);
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);

  const [chaptersMap, setChaptersMap] = useState<Record<string, TimelineChapter[]>>({});
  const [visitedPlacesMap, setVisitedPlacesMap] = useState<Record<string, VisitedPlace[]>>({});
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);

  const activeChapters = activeTrip ? chaptersMap[activeTrip.id] || [] : [];
  const activeVisitedPlaces = activeTrip ? visitedPlacesMap[activeTrip.id] || [] : [];

  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [activeDayFilter, setActiveDayFilter] = useState<number | 'all'>('all');

  // Modals & Drawers state
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isPhotoUploaderOpen, setIsPhotoUploaderOpen] = useState(false);
  const [isAddVisitModalOpen, setIsAddVisitModalOpen] = useState(false);
  const [isCreateTripModalOpen, setIsCreateTripModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isOccasionModalOpen, setIsOccasionModalOpen] = useState(false);
  const [isGeneratingReel, setIsGeneratingReel] = useState(false);
  const [activeReelData, setActiveReelData] = useState<ReelData | null>(null);
  const [targetChapterId, setTargetChapterId] = useState<string | undefined>(undefined);
  const [pendingAction, setPendingAction] = useState<'create_trip' | 'import_photos' | null>(null);

  const handleStartTripClick = () => {
    if (!currentUser) {
      setPendingAction('create_trip');
      setIsAuthModalOpen(true);
    } else {
      setIsCreateTripModalOpen(true);
    }
  };

  const handleImportPhotosClick = () => {
    if (!currentUser) {
      setPendingAction('import_photos');
      setIsAuthModalOpen(true);
    } else {
      setIsPhotoUploaderOpen(true);
    }
  };

  // Generate Occasion-Based AI Story Reel
  const handleGenerateOccasionReel = async (occasionPrompt: string) => {
    setIsGeneratingReel(true);
    try {
      const res = await fetch('/api/generate-reel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tripSlug: activeTrip?.slug || 'tokyo-culinary-odyssey',
          occasionPrompt,
          customPlaces: activeVisitedPlaces,
        }),
      });

      const data = await res.json();
      if (data.success && data.reel) {
        setActiveReelData(data.reel);
        setIsOccasionModalOpen(false);
      }
    } catch (err) {
      console.error('Error generating AI occasion reel:', err);
    } finally {
      setIsGeneratingReel(false);
    }
  };


  // Subscribe to auth changes
  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Handle creating a new trip
  const handleCreateTrip = (newTrip: Trip) => {
    const defaultChapter: TimelineChapter = {
      id: `chap_${newTrip.id}_d1`,
      tripId: newTrip.id,
      dayNumber: 1,
      date: newTrip.startDate,
      title: 'Day 1: Culinary Discoveries',
      notes: 'First day exploring local tasting spots and flavors.',
    };

    setTrips((prev) => [newTrip, ...prev]);
    setActiveTrip(newTrip);
    setChaptersMap((prev) => ({
      ...prev,
      [newTrip.id]: [defaultChapter],
    }));
    setVisitedPlacesMap((prev) => ({
      ...prev,
      [newTrip.id]: [],
    }));
  };

  // Select active trip
  const handleSelectTrip = (trip: Trip) => {
    setActiveTrip(trip);
    setSelectedPlaceId(null);
    setActiveDayFilter('all');
  };

  // Convert Wishlist item into a Visited Place
  const handleConvertToVisited = (item: WishlistItem) => {
    if (!activeTrip) return;

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

    setVisitedPlacesMap((prev) => ({
      ...prev,
      [activeTrip.id]: [...(prev[activeTrip.id] || []), newVisitedPlace],
    }));

    setWishlistItems((prev) => prev.filter((w) => w.id !== item.id));
    setSelectedPlaceId(newVisitedPlace.id);
  };

  // Add Wishlist item
  const handleAddWishlistItem = (item: Partial<WishlistItem>) => {
    const newItem: WishlistItem = {
      id: `wish_${Date.now()}`,
      userId: currentUser?.uid || 'user_active',
      tripId: activeTrip?.id,
      placeId: item.placeId || `p_${Date.now()}`,
      name: item.name || 'Unnamed Spot',
      address: item.address || 'Dining Destination',
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

  // Save manually added Visit
  const handleSaveVisit = (visit: Partial<VisitedPlace>) => {
    if (!activeTrip) return;

    const newPlace: VisitedPlace = {
      id: `vp_${Date.now()}`,
      tripId: activeTrip.id,
      chapterId: visit.chapterId || activeChapters[0]?.id || 'chap_d1',
      placeId: visit.placeId || `p_${Date.now()}`,
      name: visit.name || 'Culinary Spot',
      address: visit.address || 'Dining Destination',
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
    if (!activeTrip) return;
    setVisitedPlacesMap((prev) => ({
      ...prev,
      [activeTrip.id]: (prev[activeTrip.id] || []).filter((p) => p.id !== placeId),
    }));
  };

  // Import AI Processed Chapters
  const handleImportAIChapters = (aiChapters: AIProcessedPhotoGroup[]) => {
    if (!activeTrip) {
      // Auto create a trip for imported photos
      const autoTrip: Trip = {
        id: `trip_${Date.now()}`,
        userId: currentUser?.uid || 'user_active',
        title: aiChapters[0]?.suggestedChapterTitle || 'New Food Journey',
        slug: `food-journey-${Date.now()}`,
        destination: 'Culinary Destination',
        startDate: aiChapters[0]?.date || new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        coverUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
        summary: 'AI Generated culinary travel log from photo import.',
        visibility: 'public',
        createdAt: new Date().toISOString(),
      };
      setTrips([autoTrip]);
      setActiveTrip(autoTrip);
      
      const newChapters: TimelineChapter[] = [];
      const newPlaces: VisitedPlace[] = [];

      aiChapters.forEach((ac, idx) => {
        const chapId = `chap_ai_${Date.now()}_${idx}`;
        newChapters.push({
          id: chapId,
          tripId: autoTrip.id,
          dayNumber: idx + 1,
          date: ac.date,
          title: ac.suggestedChapterTitle,
        });

        ac.places.forEach((p, pIdx) => {
          newPlaces.push({
            id: `vp_ai_${Date.now()}_${idx}_${pIdx}`,
            tripId: autoTrip.id,
            chapterId: chapId,
            placeId: `place_ai_${Date.now()}_${pIdx}`,
            name: p.suggestedVenueName,
            address: 'Dining Spot',
            lat: p.lat || 35.6875 + pIdx * 0.005,
            lng: p.lng || 139.6972 + pIdx * 0.005,
            visitTime: p.visitTime,
            photoUrls: p.photoUrls,
            dishTags: p.detectedDishes,
            rating: p.suggestedRating,
            tastingNotes: p.suggestedTastingNotes,
            category: p.suggestedCategory,
          });
        });
      });

      setChaptersMap({ [autoTrip.id]: newChapters });
      setVisitedPlacesMap({ [autoTrip.id]: newPlaces });
      return;
    }

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
          address: 'Dining Spot',
          lat: p.lat || 35.6875 + pIdx * 0.005,
          lng: p.lng || 139.6972 + pIdx * 0.005,
          visitTime: p.visitTime,
          photoUrls: p.photoUrls,
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
        onOpenCreateTrip={handleStartTripClick}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenPhotoUploader={handleImportPhotosClick}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        currentUser={currentUser}
        onSignOut={() => logoutUser()}
        visitedCount={activeVisitedPlaces.length}
        wishlistCount={wishlistItems.length}
      />

      {/* Main Content Dashboard */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Onboarding View if no trip exists */}
        {!activeTrip ? (
          <div className="rounded-3xl border border-[#025259]/20 bg-[#FFFFFF] p-8 sm:p-12 shadow-xl text-center space-y-6 max-w-3xl mx-auto my-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#ff947a] text-[#025259] shadow-md">
              <Compass className="h-9 w-9 stroke-[2.5]" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#025259]">
                {currentUser ? `Welcome, ${currentUser.displayName || 'Food Explorer'}!` : 'Welcome to ForkTrail'}
              </h1>
              <p className="text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
                {currentUser
                  ? 'Your clean culinary travel diary. Start a new trip, import EXIF food photos, bookmark wishlist spots, and explore in 3D.'
                  : 'Your clean culinary travel diary. Please sign in or create an account to start logging food trips, importing EXIF photos, and exploring in 3D.'}
              </p>
            </div>

            {!currentUser ? (
              <div className="flex justify-center pt-2">
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="flex items-center gap-2.5 rounded-xl bg-[#ff947a] px-8 py-3.5 text-sm font-bold text-[#025259] hover:bg-[#f08368] transition shadow-md hover:scale-102"
                >
                  <LogIn className="h-5 w-5" />
                  Sign In / Create Account
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setIsCreateTripModalOpen(true)}
                  className="flex items-center gap-2 rounded-xl bg-[#ff947a] px-6 py-3 text-sm font-bold text-[#025259] hover:bg-[#f08368] transition shadow-md"
                >
                  <Plus className="h-5 w-5" />
                  Start Your First Food Trip
                </button>

                <button
                  onClick={() => setIsPhotoUploaderOpen(true)}
                  className="flex items-center gap-2 rounded-xl border border-[#025259]/20 bg-[#FAF3E7] px-5 py-3 text-sm font-bold text-[#025259] hover:bg-[#FDF8F0] transition shadow-sm"
                >
                  <Sparkles className="h-4 w-4 text-[#ff947a]" />
                  Batch Import EXIF Photos
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Active Trip Hero Header Bar */
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
        )}

        {/* Dashboard Split View: Interactive Map (Left) + Daily Timeline (Right) */}
        {activeTrip && (
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
                    onClick={() => setIsOccasionModalOpen(true)}
                    className="flex items-center gap-1.5 rounded-lg border border-[#025259]/20 bg-[#FAF3E7] px-3 py-1.5 text-xs font-bold text-[#025259] hover:bg-[#FDF8F0] transition shadow-sm"
                  >
                    <Sparkles className="h-4 w-4 text-[#ff947a]" />
                    AI Occasion Story
                  </button>

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
        )}

      </main>

      {/* Modals & Drawers */}
      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlistItems={wishlistItems}
        onAddWishlistItem={handleAddWishlistItem}
        onConvertToVisited={handleConvertToVisited}
        onRemoveWishlistItem={(id) => setWishlistItems((prev) => prev.filter((item) => item.id !== id))}
      />

      <PhotoUploader
        isOpen={isPhotoUploaderOpen}
        onClose={() => setIsPhotoUploaderOpen(false)}
        onImportChapters={handleImportAIChapters}
      />

      <OccasionPromptModal
        isOpen={isOccasionModalOpen}
        onClose={() => setIsOccasionModalOpen(false)}
        onGenerate={handleGenerateOccasionReel}
        isGenerating={isGeneratingReel}
      />

      {activeReelData && (
        <ReelViewer
          tripTitle={activeTrip?.title || 'Culinary Experience'}
          reelData={activeReelData}
          onClose={() => setActiveReelData(null)}
          onOpenOccasionModal={() => setIsOccasionModalOpen(true)}
        />
      )}

      <AddVisitModal
        isOpen={isAddVisitModalOpen}
        onClose={() => setIsAddVisitModalOpen(false)}
        chapters={activeChapters}
        defaultChapterId={targetChapterId}
        onSaveVisit={handleSaveVisit}
      />

      <CreateTripModal
        isOpen={isCreateTripModalOpen}
        onClose={() => setIsCreateTripModalOpen(false)}
        onCreateTrip={handleCreateTrip}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
          setPendingAction(null);
        }}
        onSuccess={(user) => {
          setCurrentUser(user);
          if (pendingAction === 'create_trip') {
            setIsCreateTripModalOpen(true);
          } else if (pendingAction === 'import_photos') {
            setIsPhotoUploaderOpen(true);
          }
          setPendingAction(null);
        }}
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
