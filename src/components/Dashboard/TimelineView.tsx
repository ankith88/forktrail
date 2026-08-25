'use client';

import React, { useMemo } from 'react';
import { TimelineChapter, VisitedPlace } from '@/types';
import { Calendar, Clock, MapPin, Star, Utensils, Tag, Plus, Edit3, Trash2, ChevronRight, DollarSign, Share2, Search, Sparkles, BookOpen } from 'lucide-react';
import { cn, formatDate, getMealPeriodBadge } from '@/lib/utils';
import { PalateScoreBadge } from '@/components/ai/PalateScoreBadge';

interface TimelineViewProps {
  chapters: TimelineChapter[];
  visitedPlaces: VisitedPlace[];
  selectedPlaceId?: string | null;
  onSelectPlace: (place: VisitedPlace) => void;
  onOpenAddModal: (chapterId?: string) => void;
  onEditPlace?: (place: VisitedPlace) => void;
  onDeletePlace: (placeId: string) => void;
  onOpenVisualSearch?: (photoUrl: string) => void;
  onOpenSocialCaptions?: (place: VisitedPlace) => void;
  onGenerateVisitReel?: (visit: VisitedPlace) => void;
  onOpenVisitStory?: (visit: VisitedPlace) => void;
}

export function TimelineView({
  chapters,
  visitedPlaces,
  selectedPlaceId,
  onSelectPlace,
  onOpenAddModal,
  onEditPlace,
  onDeletePlace,
  onOpenVisualSearch,
  onOpenSocialCaptions,
  onGenerateVisitReel,
  onOpenVisitStory,
}: TimelineViewProps) {
  // Group visited places by actual visit date (YYYY-MM-DD)
  const visitsByDateGroup = useMemo(() => {
    const map: Record<string, VisitedPlace[]> = {};

    visitedPlaces.forEach((place) => {
      let dateKey = place.localDate;
      if (!dateKey && place.visitTime) {
        dateKey = place.visitTime.split('T')[0];
      }
      if (!dateKey) {
        const matchingChap = chapters.find((c) => c.id === place.chapterId);
        if (matchingChap) dateKey = matchingChap.date;
      }
      if (!dateKey) dateKey = 'Unsorted';

      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(place);
    });

    // Include dates from chapters if no visits exist yet
    chapters.forEach((chap) => {
      if (chap.date && !map[chap.date]) {
        map[chap.date] = [];
      }
    });

    return map;
  }, [visitedPlaces, chapters]);

  const sortedDates = useMemo(() => {
    return Object.keys(visitsByDateGroup).sort();
  }, [visitsByDateGroup]);

  return (
    <div className="space-y-8">
      {sortedDates.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#025259]/20 p-8 text-center bg-[#FFFFFF]">
          <Utensils className="mx-auto h-10 w-10 text-[#025259]/40 mb-3" />
          <h3 className="text-base font-semibold text-[#025259]">No Food Visits Logged Yet</h3>
          <p className="text-xs text-stone-600 max-w-sm mx-auto mt-1 mb-4">
            Import photos with EXIF metadata or add your first culinary visit to create your daily dining timeline.
          </p>
          <button
            onClick={() => onOpenAddModal()}
            className="inline-flex items-center gap-2 rounded-lg bg-[#ff947a] px-4 py-2 text-xs font-bold text-[#025259] hover:bg-[#f08368] transition shadow"
          >
            <Plus className="h-4 w-4" /> Add First Visit
          </button>
        </div>
      ) : (
        sortedDates.map((dateKey, dayIdx) => {
          const placesOnDate = visitsByDateGroup[dateKey] || [];
          const matchingChapter = chapters.find((c) => c.date === dateKey);
          const formattedDate = dateKey === 'Unsorted' ? 'Unsorted Visits' : formatDate(dateKey);

          return (
            <div
              key={dateKey}
              className="relative pl-6 sm:pl-8 border-l-2 border-[#ff947a] space-y-4 group"
            >
              {/* Day Badge Node */}
              <div className="absolute -left-[17px] top-0 flex h-8 w-8 items-center justify-center rounded-full bg-[#025259] text-white font-bold text-xs shadow-md border-2 border-[#FDF8F0]">
                {dayIdx + 1}
              </div>

              {/* Clean Visit Date Header */}
              <div className="flex items-center justify-between pb-2 border-b border-[#025259]/10">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-[#ff947a]" />
                  <h3 className="text-sm sm:text-base font-serif font-bold text-[#025259]">
                    {formattedDate}
                  </h3>
                  {placesOnDate.length > 0 && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#ff947a]/20 text-[#025259]">
                      {placesOnDate.length} {placesOnDate.length === 1 ? 'visit' : 'visits'}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => onOpenAddModal(matchingChapter?.id)}
                  className="flex items-center gap-1.5 rounded-lg border border-[#025259]/20 bg-[#FDF8F0] px-2.5 py-1 text-xs font-bold text-[#025259] hover:bg-[#ff947a] hover:text-[#025259] transition shadow-xs"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Log Visit
                </button>
              </div>

              {/* Visited Place Cards */}
              <div className="grid grid-cols-1 gap-4">
                {placesOnDate.length === 0 ? (
                  <div className="rounded-xl border border-[#025259]/10 p-4 bg-[#FFFFFF] text-xs text-stone-500 italic">
                    No places logged for this date yet. Click "Log Visit" to record a meal!
                  </div>
                ) : (
                  placesOnDate.map((place) => {
                    const isSelected = selectedPlaceId === place.id;
                    const mealBadge = getMealPeriodBadge(place.mealType);
                    const visitDateStr = place.localDate || (place.visitTime ? place.visitTime.split('T')[0] : dateKey);
                    const formattedVisitDate = formatDate(visitDateStr);
                    const displayTimeStr = place.localTime || (place.visitTime ? new Date(place.visitTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '');

                    return (
                      <div
                        key={place.id}
                        onClick={() => onSelectPlace(place)}
                        className={cn(
                          "group/card cursor-pointer rounded-2xl border p-4 sm:p-5 transition-all duration-200 bg-[#FFFFFF] shadow-md hover:shadow-lg hover:border-[#ff947a]/80 space-y-3.5",
                          isSelected
                            ? "border-[#ff947a] ring-2 ring-[#ff947a]/30 bg-[#FAF3E7]"
                            : "border-[#025259]/15"
                        )}
                      >
                        {/* Hero Header Row: Title, Rating, Price, Milestone & Actions */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="text-lg font-serif font-bold text-[#025259] group-hover/card:text-[#ff947a] transition leading-snug">
                                {place.name}
                              </h4>
                              {place.occasion && (
                                <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-md bg-[#ff947a]/20 border border-[#ff947a]/50 text-[#025259] uppercase tracking-wide">
                                  ✨ {place.occasion.replace('_', ' ')}
                                </span>
                              )}
                              {/* Rating */}
                              <div className="flex items-center gap-1 bg-[#E3A857]/20 px-2 py-0.5 rounded-md text-xs font-bold text-[#025259]">
                                <Star className="h-3.5 w-3.5 fill-[#E3A857] text-[#E3A857]" />
                                <span>{place.rating}.0</span>
                              </div>
                              {/* Price Level */}
                              {place.priceLevel && (
                                <div className="flex items-center text-xs font-bold text-[#025259] bg-[#025259]/10 px-2 py-0.5 rounded-md">
                                  {'$'.repeat(place.priceLevel)}
                                </div>
                              )}
                              {/* Palate Score */}
                              <PalateScoreBadge venue={{ name: place.name, category: place.category, address: place.address, notes: place.tastingNotes }} />
                            </div>

                            {/* Address Subtitle */}
                            <p className="text-xs text-stone-600 flex items-center gap-1.5">
                              <MapPin className="h-3.5 w-3.5 text-[#ff947a] shrink-0" />
                              <span>{place.address}</span>
                            </p>
                          </div>

                          {/* Quick Edit / Delete Controls */}
                          <div className="flex items-center gap-1 shrink-0">
                            {onEditPlace && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEditPlace(place);
                                }}
                                className="p-1.5 text-stone-400 hover:text-[#025259] hover:bg-stone-100 rounded-lg transition"
                                title="Edit Visit Details & Date"
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeletePlace(place.id);
                              }}
                              className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                              title="Delete Visit"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {/* Streamlined Metadata Sub-Row */}
                        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-[#025259]/80 font-medium py-1.5 px-3 bg-[#FAF3E7]/60 rounded-xl border border-[#025259]/10">
                          <span className="font-bold text-[#025259]">{place.category}</span>
                          <span className="text-stone-300">•</span>
                          <span className="inline-flex items-center gap-1 font-semibold">
                            <span>{mealBadge.icon}</span>
                            <span>{mealBadge.label}</span>
                          </span>
                          <span className="text-stone-300">•</span>
                          <span className="inline-flex items-center gap-1 text-stone-600">
                            <Calendar className="h-3 w-3 text-[#ff947a]" />
                            <span>{formattedVisitDate}</span>
                            {displayTimeStr && (
                              <>
                                <span>at</span>
                                <Clock className="h-3 w-3 text-[#ff947a]" />
                                <span>{displayTimeStr}</span>
                              </>
                            )}
                          </span>
                        </div>

                        {/* Celebration Story Reason */}
                        {place.celebrationReason && (
                          <div className="rounded-xl border-l-4 border-[#ff947a] bg-[#ff947a]/10 p-3 text-xs text-[#025259]">
                            <span className="font-bold text-[#025259]">🎉 Celebration Story: </span>
                            <span>{place.celebrationReason}</span>
                          </div>
                        )}

                        {/* Recommended Dish */}
                        {place.recommendedDish && (
                          <div className="inline-flex items-center gap-2 bg-[#FDF8F0] border border-[#025259]/15 rounded-lg px-3 py-1.5 text-xs text-[#025259]">
                            <Utensils className="h-3.5 w-3.5 text-[#ff947a] shrink-0" />
                            <span>Must Order: <strong>{place.recommendedDish}</strong></span>
                          </div>
                        )}

                        {/* Tasting Notes (Full Width) */}
                        {place.tastingNotes && (
                          <p className="text-xs text-[#025259] bg-[#FDF8F0] p-3.5 rounded-xl border border-[#025259]/10 italic leading-relaxed w-full">
                            "{place.tastingNotes}"
                          </p>
                        )}

                        {/* Photo Gallery (Full Width Responsive Grid/Flex) */}
                        {place.photoUrls && place.photoUrls.length > 0 && (
                          <div className="flex items-center gap-2.5 overflow-x-auto py-1 max-w-full">
                            {place.photoUrls.map((url, pIdx) => {
                              const itemDishName = place.photos?.[pIdx]?.dishName;
                              return (
                                <div
                                  key={pIdx}
                                  className="relative group/photo h-24 w-24 sm:h-28 sm:w-28 shrink-0 rounded-xl overflow-hidden border border-stone-200 shadow-sm group-hover/card:scale-102 transition"
                                >
                                  <img
                                    src={url}
                                    alt={`${place.name} dish ${pIdx + 1}`}
                                    className="h-full w-full object-cover"
                                  />
                                  {itemDishName && (
                                    <div className="absolute bottom-0 inset-x-0 bg-black/80 backdrop-blur-xs p-1 text-[9px] font-bold text-white truncate text-center">
                                      {itemDishName}
                                    </div>
                                  )}
                                  {onOpenVisualSearch && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onOpenVisualSearch(url);
                                      }}
                                      className="absolute inset-0 bg-black/60 opacity-0 group-hover/photo:opacity-100 transition flex flex-col items-center justify-center gap-1 text-[#ff947a] text-[10px] font-bold p-1 text-center"
                                      title="Find Dishes Like This"
                                    >
                                      <Search className="h-4 w-4 text-[#ff947a]" />
                                      <span>Find Similar Dishes</span>
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* AI & Sharing Action Toolbar */}
                        {(onOpenVisitStory || onGenerateVisitReel || onOpenSocialCaptions) && (
                          <div className="flex flex-wrap items-center gap-2 pt-2.5 border-t border-[#025259]/10">
                            {onGenerateVisitReel && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onGenerateVisitReel(place);
                                }}
                                className="flex items-center gap-1.5 rounded-lg border border-[#ff947a] bg-[#ff947a]/15 hover:bg-[#ff947a] px-3 py-1.5 text-xs font-bold text-[#025259] transition shadow-xs"
                                title="Generate 30s AI Story Reel"
                              >
                                <Sparkles className="h-3.5 w-3.5 text-[#ff947a]" />
                                <span>30s AI Reel</span>
                              </button>
                            )}

                            {onOpenSocialCaptions && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onOpenSocialCaptions(place);
                                }}
                                className="flex items-center gap-1.5 rounded-lg border border-[#025259]/20 bg-[#FDF8F0] hover:bg-[#FAF3E7] px-3 py-1.5 text-xs font-bold text-[#025259] transition shadow-xs"
                                title="Share & Generate Captions"
                              >
                                <Share2 className="h-3.5 w-3.5 text-[#ff947a]" />
                                <span>Share Captions</span>
                              </button>
                            )}

                            {onOpenVisitStory && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onOpenVisitStory(place);
                                }}
                                className={cn(
                                  "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition shadow-xs",
                                  place.story
                                    ? "border-[#025259] bg-[#025259] text-white hover:bg-[#025259]/90"
                                    : "border-[#025259]/20 bg-[#FDF8F0] text-[#025259] hover:bg-[#FAF3E7]"
                                )}
                                title="Read & Write Visit Capture Story"
                              >
                                <BookOpen className="h-3.5 w-3.5 text-[#ff947a]" />
                                <span>{place.story ? 'Read Story' : 'Written Story'}</span>
                              </button>
                            )}
                          </div>
                        )}

                        {/* Dish Tags */}
                        {place.dishTags.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            <Tag className="h-3 w-3 text-stone-400" />
                            {place.dishTags.map((tag, tIdx) => (
                              <span
                                key={tIdx}
                                className="text-[11px] bg-[#FAF3E7] hover:bg-[#FDF8F0] text-[#025259] px-2 py-0.5 rounded-md border border-[#025259]/10 font-medium"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
