'use client';

import React from 'react';
import { TimelineChapter, VisitedPlace } from '@/types';
import { Calendar, MapPin, Star, Utensils, Tag, Plus, Edit3, Trash2, ChevronRight, DollarSign, Share2, Search, Sparkles } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import { PalateScoreBadge } from '@/components/ai/PalateScoreBadge';

interface TimelineViewProps {
  chapters: TimelineChapter[];
  visitedPlaces: VisitedPlace[];
  selectedPlaceId?: string | null;
  onSelectPlace: (place: VisitedPlace) => void;
  onOpenAddModal: (chapterId?: string) => void;
  onDeletePlace: (placeId: string) => void;
  onOpenVisualSearch?: (photoUrl: string) => void;
  onOpenSocialCaptions?: (place: VisitedPlace) => void;
}

export function TimelineView({
  chapters,
  visitedPlaces,
  selectedPlaceId,
  onSelectPlace,
  onOpenAddModal,
  onDeletePlace,
  onOpenVisualSearch,
  onOpenSocialCaptions,
}: TimelineViewProps) {
  return (
    <div className="space-y-8">
      {chapters.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#025259]/20 p-8 text-center bg-[#FFFFFF]">
          <Utensils className="mx-auto h-10 w-10 text-[#025259]/40 mb-3" />
          <h3 className="text-base font-semibold text-[#025259]">No Timeline Chapters Yet</h3>
          <p className="text-xs text-stone-600 max-w-sm mx-auto mt-1 mb-4">
            Import photos with EXIF metadata or add your first culinary visit to create a daily food diary timeline.
          </p>
          <button
            onClick={() => onOpenAddModal()}
            className="inline-flex items-center gap-2 rounded-lg bg-[#ff947a] px-4 py-2 text-xs font-bold text-[#025259] hover:bg-[#f08368] transition shadow"
          >
            <Plus className="h-4 w-4" /> Add First Visit
          </button>
        </div>
      ) : (
        chapters.map((chapter) => {
          const placesInChapter = visitedPlaces.filter((p) => p.chapterId === chapter.id);

          return (
            <div
              key={chapter.id}
              className="relative pl-6 sm:pl-8 border-l-2 border-[#ff947a] space-y-4 group"
            >
              {/* Day Badge Node */}
              <div className="absolute -left-[17px] top-0 flex h-8 w-8 items-center justify-center rounded-full bg-[#025259] text-white font-bold text-xs shadow-md border-2 border-[#FDF8F0]">
                {chapter.dayNumber}
              </div>

              {/* Chapter Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#FFFFFF] border border-[#025259]/15 p-4 rounded-xl shadow-sm">
                <div>
                  <div className="flex items-center gap-2 text-xs text-[#025259] font-bold">
                    <Calendar className="h-3.5 w-3.5 text-[#ff947a]" />
                    <span>{formatDate(chapter.date)}</span>
                  </div>
                  <h3 className="text-base font-bold text-[#025259] mt-0.5">{chapter.title}</h3>
                  {chapter.notes && (
                    <p className="text-xs text-stone-600 mt-1 italic">{chapter.notes}</p>
                  )}
                </div>
                <button
                  onClick={() => onOpenAddModal(chapter.id)}
                  className="self-start sm:self-auto flex items-center gap-1.5 rounded-lg border border-[#025259]/20 bg-[#FDF8F0] px-3 py-1.5 text-xs font-bold text-[#025259] hover:bg-[#ff947a] hover:text-[#025259] transition"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Log Spot
                </button>
              </div>

              {/* Visited Place Cards */}
              <div className="grid grid-cols-1 gap-4">
                {placesInChapter.length === 0 ? (
                  <div className="rounded-xl border border-[#025259]/10 p-4 bg-[#FFFFFF] text-xs text-stone-500 italic">
                    No places logged for this day yet. Click "Log Spot" or drag photos above.
                  </div>
                ) : (
                  placesInChapter.map((place) => {
                    const isSelected = selectedPlaceId === place.id;

                    return (
                      <div
                        key={place.id}
                        onClick={() => onSelectPlace(place)}
                        className={cn(
                          "group/card cursor-pointer rounded-2xl border p-4 sm:p-5 transition-all duration-200 bg-[#FFFFFF] shadow-md hover:shadow-lg hover:border-[#ff947a]/80",
                          isSelected
                            ? "border-[#ff947a] ring-2 ring-[#ff947a]/30 bg-[#FAF3E7]"
                            : "border-[#025259]/15"
                        )}
                      >
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                          
                          {/* Left Details */}
                          <div className="flex-1 space-y-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-md bg-[#025259]/10 px-2.5 py-1 text-xs font-bold text-[#025259] border border-[#025259]/20">
                                {place.category}
                              </span>
                              
                              {/* Palate Score Badge */}
                              <PalateScoreBadge venue={{ name: place.name, category: place.category, address: place.address, notes: place.tastingNotes }} />

                              {/* Rating Stars */}
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

                              <span suppressHydrationWarning className="text-[11px] text-stone-500 ml-auto md:ml-0 font-medium">
                                🕒 {new Date(place.visitTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>

                            <div>
                              <h4 className="text-lg font-bold text-[#025259] group-hover/card:text-[#ff947a] transition">
                                {place.name}
                              </h4>
                              <p className="text-xs text-stone-600 flex items-center gap-1.5 mt-0.5">
                                <MapPin className="h-3.5 w-3.5 text-[#ff947a] shrink-0" />
                                <span>{place.address}</span>
                              </p>
                            </div>

                            {/* Recommended Dish */}
                            {place.recommendedDish && (
                              <div className="inline-flex items-center gap-2 bg-[#FDF8F0] border border-[#025259]/15 rounded-lg px-3 py-1.5 text-xs text-[#025259]">
                                <Utensils className="h-3.5 w-3.5 text-[#ff947a] shrink-0" />
                                <span>Must Order: <strong>{place.recommendedDish}</strong></span>
                              </div>
                            )}

                            {/* Tasting Notes */}
                            {place.tastingNotes && (
                              <p className="text-xs text-[#025259] bg-[#FDF8F0] p-3 rounded-xl border border-[#025259]/10 italic leading-relaxed">
                                "{place.tastingNotes}"
                              </p>
                            )}

                            {/* Dish Tags */}
                            {place.dishTags.length > 0 && (
                              <div className="flex flex-wrap items-center gap-1.5">
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

                          {/* Right Photo Gallery & Card Actions */}
                          <div className="flex flex-col items-end gap-3 shrink-0">
                            {place.photoUrls && place.photoUrls.length > 0 && (
                              <div className="flex items-center gap-2 overflow-x-auto max-w-full">
                                {place.photoUrls.slice(0, 3).map((url, pIdx) => (
                                  <div
                                    key={pIdx}
                                    className="relative group/photo h-28 w-28 sm:h-32 sm:w-32 rounded-xl overflow-hidden border border-stone-200 shadow-sm group-hover/card:scale-102 transition"
                                  >
                                    <img
                                      src={url}
                                      alt={`${place.name} dish ${pIdx + 1}`}
                                      className="h-full w-full object-cover"
                                    />
                                    {onOpenVisualSearch && (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onOpenVisualSearch(url);
                                        }}
                                        className="absolute inset-0 bg-black/50 opacity-0 group-hover/photo:opacity-100 transition flex flex-col items-center justify-center gap-1 text-[#ff947a] text-[10px] font-bold p-1 text-center"
                                        title="Find Dishes Like This"
                                      >
                                        <Search className="h-4 w-4 text-[#ff947a]" />
                                        <span>Find Similar Dishes</span>
                                      </button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}

                            <div className="flex items-center gap-2 pt-1">
                              {onOpenSocialCaptions && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onOpenSocialCaptions(place);
                                  }}
                                  className="flex items-center gap-1.5 rounded-lg border border-[#ff947a]/40 bg-[#ff947a]/15 px-2.5 py-1 text-xs font-bold text-[#025259] hover:bg-[#ff947a] transition shadow-sm"
                                  title="Share & Generate Captions"
                                >
                                  <Share2 className="h-3.5 w-3.5 text-[#ff947a]" />
                                  <span>Share Captions</span>
                                </button>
                              )}

                              <button
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
                        </div>
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
