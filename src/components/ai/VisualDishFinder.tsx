'use client';

import React, { useState, useEffect } from 'react';
import { VisualSearchResult, WishlistItem } from '@/types';
import { X, Search, Sparkles, MapPin, Star, Heart, Plus, Check, Loader2, ChevronRight, Utensils } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VisualDishFinderProps {
  isOpen: boolean;
  onClose: () => void;
  photoUrl: string;
  userLat?: number;
  userLng?: number;
  onAddWishlistItem: (item: Partial<WishlistItem>) => void;
}

export function VisualDishFinder({
  isOpen,
  onClose,
  photoUrl,
  userLat = 35.6875,
  userLng = 139.6972,
  onAddWishlistItem,
}: VisualDishFinderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<VisualSearchResult | null>(null);
  const [savedPlaces, setSavedPlaces] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!isOpen || !photoUrl) return;

    let isMounted = true;
    const runVisualSearch = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/ai/visual-search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            photoUrl,
            userLat,
            userLng,
          }),
        });

        const data = await res.json();
        if (data.success && data.result && isMounted) {
          setSearchResult(data.result);
        }
      } catch (err) {
        console.error('Failed to run visual dish search:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    runVisualSearch();

    return () => {
      isMounted = false;
    };
  }, [isOpen, photoUrl]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-md">
      <div className="relative w-full max-w-3xl max-h-[85vh] bg-[#FDF8F0] rounded-t-3xl sm:rounded-3xl border border-[#025259]/20 shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-200">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#025259] text-white flex items-center justify-between border-b border-[#013b40]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ff947a] text-[#025259] shadow">
              <Search className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                "Find Dishes Like This" Visual Search
                <span className="rounded-full bg-[#ff947a]/20 px-2.5 py-0.5 text-[10px] font-bold text-[#ff947a] border border-[#ff947a]/40 uppercase tracking-wider">
                  Gemini Vision
                </span>
              </h2>
              <p className="text-xs text-[#FAF3E7]">Discover top-rated local spots serving similar culinary specialties</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-white/80 hover:bg-[#03717b] hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          
          {/* Target Photo & Gemini Extracted Attributes */}
          <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-white border border-[#025259]/15 shadow-sm">
            <img
              src={photoUrl}
              alt="Target Food"
              className="h-24 w-32 object-cover rounded-xl border border-[#025259]/20 shadow-md shrink-0"
            />
            {isLoading ? (
              <div className="flex items-center gap-2 text-xs text-[#025259] font-bold">
                <Loader2 className="h-4 w-4 animate-spin text-[#ff947a]" />
                <span>Extracting dish attributes with Gemini Vision...</span>
              </div>
            ) : searchResult ? (
              <div className="space-y-1 text-xs">
                <span className="font-bold text-[#025259] text-sm block">
                  Detected: {searchResult.dishAttributes.dishType}
                </span>
                <p className="text-stone-600 font-medium">
                  Style: <span className="text-stone-800">{searchResult.dishAttributes.style}</span>
                </p>
                <div className="flex flex-wrap gap-1 pt-1">
                  {searchResult.dishAttributes.toppings.map((top, tIdx) => (
                    <span key={tIdx} className="rounded-md bg-[#FAF3E7] text-[#025259] px-2 py-0.5 text-[10px] font-bold border border-[#025259]/10">
                      {top}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          {/* Loading state for spots */}
          {isLoading && (
            <div className="rounded-2xl border border-[#025259]/20 bg-[#FFFFFF] p-10 text-center space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-[#ff947a] mx-auto" />
              <h4 className="text-sm font-bold text-[#025259]">Searching Nearby Google Places...</h4>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Cross-referencing food photo attributes with top-rated local dining spots in your vicinity.
              </p>
            </div>
          )}

          {/* Swipeable Nearby Matches Carousel */}
          {!isLoading && searchResult && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-[#025259] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-[#ff947a]" /> Top Local Spots Offering Similar Dish ({searchResult.nearbyMatches.length}):
                </h3>
                <span className="text-[11px] text-stone-500 italic">Swipe horizontally →</span>
              </div>

              {/* Horizontal Scroll Carousel */}
              <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-thin">
                {searchResult.nearbyMatches.map((place, idx) => (
                  <div
                    key={idx}
                    className="w-72 shrink-0 snap-start rounded-2xl border border-[#025259]/15 bg-white p-4 shadow-md space-y-3 flex flex-col justify-between hover:shadow-lg transition"
                  >
                    <div className="space-y-2">
                      <div className="relative h-32 w-full rounded-xl overflow-hidden">
                        <img
                          src={place.photoUrl}
                          alt={place.name}
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-black/70 backdrop-blur-md px-2 py-0.5 text-[10px] font-bold text-amber-400">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          <span>{place.rating}</span>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-[#025259] truncate">{place.name}</h4>
                        <p className="text-[10px] text-stone-500 truncate flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3 text-[#ff947a]" />
                          <span>{place.address} ({place.distanceKm} km away)</span>
                        </p>
                      </div>

                      <p className="text-[11px] text-stone-700 bg-[#FDF8F0] p-2 rounded-lg border border-[#025259]/10 font-medium">
                        {place.matchingSpecialty}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onAddWishlistItem({
                          placeId: place.placeId,
                          name: place.name,
                          address: place.address,
                          lat: place.lat,
                          lng: place.lng,
                          category: 'Restaurant',
                          notes: `Discovered via Visual Dish Search matching ${searchResult.dishAttributes.dishType}`,
                          priority: 'must-try',
                          photoUrl: place.photoUrl,
                        });
                        setSavedPlaces((prev) => ({ ...prev, [idx]: true }));
                      }}
                      className={cn(
                        'w-full flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition shadow-sm',
                        savedPlaces[idx]
                          ? 'bg-rose-100 text-rose-700 border border-rose-300'
                          : 'bg-[#ff947a] text-[#025259] hover:bg-[#f08368]'
                      )}
                    >
                      <Heart className={cn('h-3.5 w-3.5', savedPlaces[idx] ? 'fill-rose-600 text-rose-600' : 'text-[#025259]')} />
                      <span>{savedPlaces[idx] ? 'Saved to Wishlist' : 'Add to Wishlist'}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
