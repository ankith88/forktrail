'use client';

import React, { useState } from 'react';
import { WishlistItem, ItineraryDay, VisitedPlace } from '@/types';
import { X, Calendar, Clock, MapPin, Navigation, Sparkles, CheckSquare, Square, Loader2, Route, Utensils } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ItineraryPlannerProps {
  isOpen: boolean;
  onClose: () => void;
  wishlistItems: WishlistItem[];
  visitedPlaces?: VisitedPlace[];
  destination?: string;
  onApplyItineraryToTrip?: (itinerary: ItineraryDay[]) => void;
}

export function ItineraryPlanner({
  isOpen,
  onClose,
  wishlistItems,
  visitedPlaces = [],
  destination = 'Tokyo',
  onApplyItineraryToTrip,
}: ItineraryPlannerProps) {
  const [selectedVenues, setSelectedVenues] = useState<any[]>(
    wishlistItems.length > 0
      ? wishlistItems
      : [
          { name: 'Ichiran Ramen Shinjuku', category: 'Ramen', address: 'Shibuya, Tokyo', lat: 35.6895, lng: 139.7004 },
          { name: 'Sushiko Tsukiji Market', category: 'Sushi', address: 'Chuo City, Tokyo', lat: 35.6654, lng: 139.7707 },
          { name: 'Fuglen Specialty Roastery', category: 'Café & Bakery', address: 'Shibuya, Tokyo', lat: 35.6634, lng: 139.6953 },
          { name: 'Bar High Five Cocktails', category: 'Speakeasy Bar', address: 'Ginza, Tokyo', lat: 35.6712, lng: 139.7651 },
        ]
  );

  const [tripLengthDays, setTripLengthDays] = useState<number>(2);
  const [targetCity, setTargetCity] = useState<string>(destination || 'Tokyo');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizedItinerary, setOptimizedItinerary] = useState<ItineraryDay[] | null>(null);

  if (!isOpen) return null;

  const toggleVenueSelection = (venue: any) => {
    const exists = selectedVenues.some((v) => v.name === venue.name);
    if (exists) {
      setSelectedVenues(selectedVenues.filter((v) => v.name !== venue.name));
    } else {
      setSelectedVenues([...selectedVenues, venue]);
    }
  };

  const handleRunOptimizer = async () => {
    if (!selectedVenues.length) return;

    setIsOptimizing(true);
    try {
      const res = await fetch('/api/ai/optimize-itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: targetCity,
          tripLengthDays,
          venues: selectedVenues,
        }),
      });

      const data = await res.json();
      if (data.success && data.itinerary) {
        setOptimizedItinerary(data.itinerary);
      }
    } catch (err) {
      console.error('Failed to optimize itinerary:', err);
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#FDF8F0] rounded-3xl border border-[#025259]/20 shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-5 bg-[#025259] text-white flex items-center justify-between border-b border-[#013b40]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ff947a] text-[#025259] shadow">
              <Route className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Autonomous Culinary Itinerary Optimizer
                <span className="rounded-full bg-[#ff947a]/20 px-2.5 py-0.5 text-[10px] font-bold text-[#ff947a] border border-[#ff947a]/40 uppercase tracking-wider">
                  Gemini Logistics AI
                </span>
              </h2>
              <p className="text-xs text-[#FAF3E7]">Sequence wishlists into timing-optimized daily culinary walking schedules</p>
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
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Controls Bar: City & Trip Length */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-[#FFFFFF] border border-[#025259]/15 shadow-sm">
            <div>
              <label htmlFor="target-destination" className="block text-xs font-bold text-[#025259] mb-1">Destination City</label>
              <input
                id="target-destination"
                type="text"
                value={targetCity}
                onChange={(e) => setTargetCity(e.target.value)}
                className="w-full rounded-xl border border-[#025259]/20 bg-[#FDF8F0] px-3 py-2 text-xs font-bold text-[#025259] focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="trip-length-days" className="block text-xs font-bold text-[#025259] mb-1">Trip Duration</label>
              <select
                id="trip-length-days"
                value={tripLengthDays}
                onChange={(e) => setTripLengthDays(Number(e.target.value))}
                className="w-full rounded-xl border border-[#025259]/20 bg-[#FDF8F0] px-3 py-2 text-xs font-bold text-[#025259] focus:outline-none"
              >
                <option value={1}>1-Day Food Tour</option>
                <option value={2}>2-Day Weekend Journey</option>
                <option value={3}>3-Day Culinary Escape</option>
                <option value={4}>4-Day Deep Gourmet Exploration</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleRunOptimizer}
                disabled={isOptimizing || !selectedVenues.length}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#ff947a] px-4 py-2.5 text-xs font-bold text-[#025259] hover:bg-[#f08368] transition shadow-md disabled:opacity-50"
              >
                {isOptimizing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-[#025259]" /> Optimizing Route...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 text-[#025259]" /> Optimize Itinerary
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Venue Selection checklist */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-[#025259] uppercase tracking-wider">
              Select Spots to Include ({selectedVenues.length} selected):
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto p-1">
              {[...wishlistItems, ...visitedPlaces].map((item: any, idx: number) => {
                const isSelected = selectedVenues.some((v) => v.name === item.name);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => toggleVenueSelection(item)}
                    className={cn(
                      'flex items-center justify-between p-3 rounded-xl border text-left transition shadow-sm',
                      isSelected
                        ? 'bg-[#025259] border-[#025259] text-white'
                        : 'bg-white border-[#025259]/15 text-[#025259] hover:bg-[#FAF3E7]'
                    )}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      {isSelected ? (
                        <CheckSquare className="h-4 w-4 text-[#ff947a] shrink-0" />
                      ) : (
                        <Square className="h-4 w-4 text-stone-400 shrink-0" />
                      )}
                      <div className="truncate">
                        <span className="text-xs font-bold block truncate">{item.name}</span>
                        <span className="text-[10px] opacity-80 block truncate">{item.category || item.address}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Loading Indicator */}
          {isOptimizing && (
            <div className="rounded-2xl border border-[#025259]/20 bg-[#FFFFFF] p-10 text-center space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-[#ff947a] mx-auto" />
              <h4 className="text-sm font-bold text-[#025259]">Sequencing Dining Spots...</h4>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Analyzing opening hours, optimal meal timings (morning coffee, lunch ramen, aperitivo, dinner, late cocktails) and geographic walkability.
              </p>
            </div>
          )}

          {/* Rendered Optimized Itinerary Schedule */}
          {!isOptimizing && optimizedItinerary && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#025259] flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#ff947a]" /> Optimized Multi-Day Visual Itinerary
                </h3>
                {onApplyItineraryToTrip && (
                  <button
                    onClick={() => {
                      onApplyItineraryToTrip(optimizedItinerary);
                      onClose();
                    }}
                    className="flex items-center gap-1.5 rounded-xl bg-[#025259] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#013b40] transition shadow"
                  >
                    <Calendar className="h-4 w-4 text-[#ff947a]" /> Save to Trip Chapters
                  </button>
                )}
              </div>

              <div className="space-y-6">
                {optimizedItinerary.map((day) => (
                  <div key={day.dayNumber} className="rounded-2xl border border-[#025259]/20 bg-[#FFFFFF] p-5 shadow-md space-y-4">
                    <div className="flex items-center justify-between border-b border-[#025259]/10 pb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#025259] text-white font-bold text-xs">
                          {day.dayNumber}
                        </span>
                        <h4 className="text-sm font-bold text-[#025259]">{day.title}</h4>
                      </div>
                      <span className="text-xs text-stone-500 font-medium">{day.schedule.length} Dining Stops</span>
                    </div>

                    <div className="relative pl-6 space-y-4 border-l-2 border-[#ff947a]/50">
                      {day.schedule.map((slot, sIdx) => (
                        <div key={sIdx} className="relative space-y-1">
                          <div className="absolute -left-[31px] top-1 h-3 w-3 rounded-full bg-[#ff947a] border-2 border-white" />
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-[#025259] bg-[#FAF3E7] px-2 py-0.5 rounded border border-[#025259]/10">
                                <Clock className="inline h-3 w-3 text-[#ff947a] mr-1" />
                                {slot.timeSlot}
                              </span>
                              <h5 className="text-xs font-bold text-[#025259]">{slot.venueName}</h5>
                              <span className="rounded-full bg-stone-100 text-stone-600 px-2 py-0.5 text-[10px] font-semibold">
                                {slot.activityType}
                              </span>
                            </div>
                            <span className="text-[11px] text-stone-500 italic">{slot.estimatedDuration}</span>
                          </div>
                          <p className="text-xs text-stone-600 pl-1">{slot.notes}</p>
                          <div className="flex items-center gap-1 text-[11px] text-stone-400 pl-1">
                            <MapPin className="h-3 w-3 text-stone-400" />
                            <span>{slot.address}</span>
                          </div>
                        </div>
                      ))}
                    </div>
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
