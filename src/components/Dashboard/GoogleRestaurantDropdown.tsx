'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Star, Utensils, Loader2, Sparkles, Check, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface GooglePlaceResult {
  placeId: string;
  name: string;
  address: string;
  lat: number | null;
  lng: number | null;
  rating: number;
  rawRating?: number;
  priceLevel: number;
  category: string;
  cuisine: string;
  userRatingsTotal?: number;
  photoUrl: string;
  website?: string;
  phone?: string;
}

interface GoogleRestaurantDropdownProps {
  value: string;
  onChange: (val: string) => void;
  onSelectPlace: (place: GooglePlaceResult) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  required?: boolean;
  onClearAutopopulated?: () => void;
  isAutopopulated?: boolean;
}

export function GoogleRestaurantDropdown({
  value,
  onChange,
  onSelectPlace,
  placeholder = 'Search restaurant name or venue...',
  className,
  id = 'google-restaurant-search',
  required = false,
  onClearAutopopulated,
  isAutopopulated = false,
}: GoogleRestaurantDropdownProps) {
  const [query, setQuery] = useState(value);
  const [predictions, setPredictions] = useState<GooglePlaceResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync internal state with external value changes
  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Debounced search fetch
  useEffect(() => {
    if (!query.trim() || isAutopopulated) {
      setPredictions([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/places/search?query=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.places)) {
          setPredictions(data.places);
          setIsOpen(data.places.length > 0);
          setSelectedIndex(-1);
        } else {
          setPredictions([]);
          setIsOpen(false);
        }
      } catch (err) {
        console.warn('Google Places search error:', err);
        setPredictions([]);
        setIsOpen(false);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, isAutopopulated]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setQuery(newValue);
    onChange(newValue);
    if (isAutopopulated && onClearAutopopulated) {
      onClearAutopopulated();
    }
  };

  const handleSelectPrediction = async (place: GooglePlaceResult) => {
    setQuery(place.name);
    onChange(place.name);
    setIsOpen(false);
    setPredictions([]);

    // Fetch full place details if placeId exists
    if (place.placeId) {
      try {
        const res = await fetch(`/api/places/details?placeId=${encodeURIComponent(place.placeId)}`);
        const data = await res.json();
        if (data.success && data.place) {
          onSelectPlace(data.place);
          return;
        }
      } catch (err) {
        console.warn('Failed to fetch rich place details:', err);
      }
    }

    onSelectPlace(place);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || predictions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < predictions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : predictions.length - 1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleSelectPrediction(predictions[selectedIndex]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          id={id}
          type="text"
          required={required}
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            if (predictions.length > 0 && !isAutopopulated) {
              setIsOpen(true);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            "w-full rounded-xl border border-[#025259]/20 bg-[#FDF8F0] p-2.5 pr-9 text-xs text-[#025259] placeholder-stone-400 focus:border-[#ff947a] focus:outline-none transition shadow-sm",
            isAutopopulated && "border-emerald-500/50 bg-emerald-50/30"
          )}
        />

        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-[#ff947a]" />
          ) : isAutopopulated ? (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white text-[10px] font-bold shadow-sm" title="Autopopulated from Google">
              ✓
            </span>
          ) : (
            <Search className="h-4 w-4 text-[#025259]/40" />
          )}
        </div>
      </div>

      {/* Google Autocomplete Dropdown */}
      {isOpen && predictions.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-72 overflow-y-auto rounded-2xl border border-[#025259]/20 bg-[#FFFFFF] p-2 shadow-2xl space-y-1 divide-y divide-[#025259]/10">
          <div className="px-2 py-1 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#025259]/60">
            <span className="flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-[#ff947a]" /> Google Places Suggestions
            </span>
            <span className="text-stone-400">Select to Auto-Fill</span>
          </div>

          <div className="pt-1 space-y-1">
            {predictions.map((place, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={place.placeId || index}
                  onClick={() => handleSelectPrediction(place)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={cn(
                    "group flex items-start gap-3 p-2.5 rounded-xl cursor-pointer transition text-xs",
                    isSelected
                      ? "bg-[#FAF3E7] border border-[#ff947a]/50 text-[#025259]"
                      : "hover:bg-[#FDF8F0] text-stone-700"
                  )}
                >
                  {/* Photo Thumbnail */}
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-[#025259]/10 bg-stone-100">
                    <img
                      src={place.photoUrl}
                      alt={place.name}
                      className="h-full w-full object-cover transition group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=200&q=80';
                      }}
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-[#025259] truncate group-hover:text-[#ff947a] transition">
                        {place.name}
                      </span>
                      {place.category && (
                        <span className="shrink-0 rounded-full bg-[#025259]/10 px-2 py-0.5 text-[10px] font-bold text-[#025259]">
                          {place.category}
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-stone-500 truncate flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3 w-3 shrink-0 text-[#ff947a]" />
                      <span className="truncate">{place.address}</span>
                    </p>

                    <div className="flex items-center gap-3 text-[10px] text-stone-500 mt-1 font-medium">
                      <span className="flex items-center gap-0.5 text-amber-600 font-bold">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        {place.rawRating ? place.rawRating.toFixed(1) : place.rating}
                      </span>
                      <span className="text-[#025259] font-bold">
                        {'$'.repeat(Math.max(1, place.priceLevel || 1))}
                      </span>
                      {place.userRatingsTotal ? (
                        <span>({place.userRatingsTotal} Google reviews)</span>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
