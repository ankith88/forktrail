'use client';

import React, { useState, useMemo } from 'react';
import { TimelineChapter, VisitedPlace } from '@/types';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Star,
  Utensils,
  Tag,
  Plus,
  Clock,
  Trash2,
  Share2,
  Search,
  Edit3,
} from 'lucide-react';
import { cn, formatDate, getMealPeriodBadge } from '@/lib/utils';
import { PalateScoreBadge } from '@/components/ai/PalateScoreBadge';

interface CalendarViewProps {
  chapters: TimelineChapter[];
  visitedPlaces: VisitedPlace[];
  selectedPlaceId?: string | null;
  onSelectPlace: (place: VisitedPlace) => void;
  onOpenAddModal: (chapterId?: string, defaultDate?: string) => void;
  onEditPlace?: (place: VisitedPlace) => void;
  onDeletePlace: (placeId: string) => void;
  onOpenVisualSearch?: (photoUrl: string) => void;
  onOpenSocialCaptions?: (place: VisitedPlace) => void;
}

export function CalendarView({
  chapters,
  visitedPlaces,
  selectedPlaceId,
  onSelectPlace,
  onOpenAddModal,
  onEditPlace,
  onDeletePlace,
  onOpenVisualSearch,
  onOpenSocialCaptions,
}: CalendarViewProps) {
  // Map places by date string (YYYY-MM-DD)
  const visitsByDate = useMemo(() => {
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
      if (dateKey) {
        if (!map[dateKey]) map[dateKey] = [];
        map[dateKey].push(place);
      }
    });
    return map;
  }, [visitedPlaces, chapters]);

  // Available dates with visits sorted chronologically
  const sortedVisitedDates = useMemo(() => {
    return Object.keys(visitsByDate).sort();
  }, [visitsByDate]);

  // Initial display month & year based on existing visits or current date
  const [currentYear, setCurrentYear] = useState<number>(() => {
    if (sortedVisitedDates.length > 0) {
      const first = sortedVisitedDates[0];
      const y = parseInt(first.split('-')[0], 10);
      if (!isNaN(y)) return y;
    }
    return new Date().getFullYear();
  });

  const [currentMonth, setCurrentMonth] = useState<number>(() => {
    if (sortedVisitedDates.length > 0) {
      const first = sortedVisitedDates[0];
      const m = parseInt(first.split('-')[1], 10) - 1;
      if (!isNaN(m)) return m;
    }
    return new Date().getMonth();
  });

  // Selected date filter (YYYY-MM-DD)
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    if (sortedVisitedDates.length > 0) {
      return sortedVisitedDates[0];
    }
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(
      today.getDate()
    ).padStart(2, '0')}`;
  });

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  // Build calendar matrix for currentYear and currentMonth
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    const days: {
      dayNum: number | null;
      dateStr: string | null;
      visits: VisitedPlace[];
    }[] = [];

    // Blank cells before day 1
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push({ dayNum: null, dateStr: null, visits: [] });
    }

    // Days of month
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(
        d
      ).padStart(2, '0')}`;
      const visits = visitsByDate[dateStr] || [];
      days.push({ dayNum: d, dateStr, visits });
    }

    return days;
  }, [currentYear, currentMonth, visitsByDate]);

  const selectedVisits = visitsByDate[selectedDate] || [];

  return (
    <div className="space-y-6">
      {/* Calendar Header & Month Selector */}
      <div className="rounded-2xl border border-[#025259]/15 bg-[#FFFFFF] p-4 sm:p-6 shadow-sm space-y-4">
        
        {/* Navigation & Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-[#025259]/10 pb-4">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-[#ff947a]" />
            <h2 className="font-serif text-xl font-bold text-[#025259]">
              {monthNames[currentMonth]} {currentYear}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick jump to months with visits */}
            {sortedVisitedDates.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto max-w-[220px] sm:max-w-xs py-1">
                {Array.from(
                  new Set(
                    sortedVisitedDates.map((d) => {
                      const [y, m] = d.split('-');
                      return `${y}-${m}`;
                    })
                  )
                ).map((ymKey) => {
                  const [y, m] = ymKey.split('-');
                  const monthIdx = parseInt(m, 10) - 1;
                  const yearNum = parseInt(y, 10);
                  const isCurrent = currentYear === yearNum && currentMonth === monthIdx;

                  return (
                    <button
                      key={ymKey}
                      onClick={() => {
                        setCurrentYear(yearNum);
                        setCurrentMonth(monthIdx);
                      }}
                      className={cn(
                        'px-2.5 py-1 rounded-lg text-xs font-bold transition shrink-0 border',
                        isCurrent
                          ? 'bg-[#ff947a] border-[#ff947a] text-[#025259] shadow-sm'
                          : 'bg-[#FDF8F0] border-[#025259]/15 text-[#025259]/80 hover:bg-[#FAF3E7]'
                      )}
                    >
                      {monthNames[monthIdx].substring(0, 3)} {yearNum}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="flex items-center gap-1">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg border border-[#025259]/20 bg-[#FDF8F0] text-[#025259] hover:bg-[#ff947a] transition"
                title="Previous Month"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg border border-[#025259]/20 bg-[#FDF8F0] text-[#025259] hover:bg-[#ff947a] transition"
                title="Next Month"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-[#025259]/70 pb-1">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>

        {/* Calendar Month Grid */}
        <div className="grid grid-cols-7 gap-1.5">
          {calendarDays.map((cell, idx) => {
            if (!cell.dayNum || !cell.dateStr) {
              return (
                <div
                  key={`blank_${idx}`}
                  className="h-16 sm:h-20 rounded-xl bg-stone-50/50 border border-transparent"
                />
              );
            }

            const hasVisits = cell.visits.length > 0;
            const isSelected = selectedDate === cell.dateStr;

            return (
              <div
                key={cell.dateStr}
                onClick={() => setSelectedDate(cell.dateStr!)}
                className={cn(
                  'relative h-16 sm:h-20 p-1.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between overflow-hidden',
                  isSelected
                    ? 'border-[#ff947a] ring-2 ring-[#ff947a]/40 bg-[#FAF3E7] shadow-sm'
                    : hasVisits
                    ? 'border-[#025259]/30 bg-[#FFFFFF] hover:border-[#ff947a] shadow-xs'
                    : 'border-[#025259]/10 bg-[#FFFFFF] hover:bg-[#FDF8F0] text-stone-400'
                )}
              >
                {/* Date Number Badge */}
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      'text-xs font-bold rounded-md px-1.5 py-0.5',
                      isSelected
                        ? 'bg-[#025259] text-white'
                        : hasVisits
                        ? 'bg-[#ff947a]/20 text-[#025259]'
                        : 'text-stone-600'
                    )}
                  >
                    {cell.dayNum}
                  </span>
                  {hasVisits && (
                    <span className="flex h-2 w-2 rounded-full bg-[#ff947a] animate-pulse" />
                  )}
                </div>

                {/* Visit Badges preview in calendar cell */}
                {hasVisits && (
                  <div className="space-y-0.5 overflow-hidden">
                    {cell.visits.slice(0, 2).map((v) => {
                      const badge = getMealPeriodBadge(v.mealType);
                      return (
                        <div
                          key={v.id}
                          className="flex items-center gap-1 text-[9px] font-bold text-[#025259] bg-[#FAF3E7] border border-[#025259]/15 px-1 py-0.5 rounded truncate"
                          title={`${v.name} (${badge.label})`}
                        >
                          <span>{badge.icon}</span>
                          <span className="truncate">{v.name}</span>
                        </div>
                      );
                    })}
                    {cell.visits.length > 2 && (
                      <span className="block text-[8px] font-bold text-[#ff947a] text-right">
                        +{cell.visits.length - 2} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Visits Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between bg-[#FFFFFF] p-4 rounded-xl border border-[#025259]/15 shadow-sm">
          <div>
            <h3 className="font-serif font-bold text-base text-[#025259]">
              Visits on {formatDate(selectedDate)}
            </h3>
            <p className="text-xs text-stone-500">
              {selectedVisits.length === 0
                ? 'No culinary visits recorded for this date yet.'
                : `${selectedVisits.length} dining memory logged.`}
            </p>
          </div>

          <button
            onClick={() => onOpenAddModal(undefined, selectedDate)}
            className="flex items-center gap-1.5 rounded-lg bg-[#ff947a] px-3 py-1.5 text-xs font-bold text-[#025259] hover:bg-[#f08368] transition shadow"
          >
            <Plus className="h-3.5 w-3.5" />
            Log Visit on {selectedDate}
          </button>
        </div>

        {/* Visit Cards list for selected date */}
        {selectedVisits.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#025259]/20 p-8 text-center bg-[#FFFFFF]">
            <Utensils className="mx-auto h-8 w-8 text-[#025259]/30 mb-2" />
            <p className="text-xs text-stone-600">
              No food logs on {formatDate(selectedDate)}. Click "Log Visit" to record a meal!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {selectedVisits.map((place) => {
              const isSelected = selectedPlaceId === place.id;
              const mealBadge = getMealPeriodBadge(place.mealType);
              const visitDateStr = place.localDate || (place.visitTime ? place.visitTime.split('T')[0] : selectedDate);
              const formattedVisitDate = formatDate(visitDateStr);
              const displayTimeStr =
                place.localTime ||
                (place.visitTime
                  ? new Date(place.visitTime).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : '');

              return (
                <div
                  key={place.id}
                  onClick={() => onSelectPlace(place)}
                  className={cn(
                    'group/card cursor-pointer rounded-2xl border p-4 sm:p-5 transition-all duration-200 bg-[#FFFFFF] shadow-md hover:shadow-lg hover:border-[#ff947a]/80 space-y-3.5',
                    isSelected
                      ? 'border-[#ff947a] ring-2 ring-[#ff947a]/30 bg-[#FAF3E7]'
                      : 'border-[#025259]/15'
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
                        <PalateScoreBadge
                          venue={{
                            name: place.name,
                            category: place.category,
                            address: place.address,
                            notes: place.tastingNotes,
                          }}
                        />
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
                      <CalendarIcon className="h-3 w-3 text-[#ff947a]" />
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

                  {/* Must Order Dish */}
                  {place.recommendedDish && (
                    <div className="inline-flex items-center gap-2 bg-[#FDF8F0] border border-[#025259]/15 rounded-lg px-3 py-1.5 text-xs text-[#025259]">
                      <Utensils className="h-3.5 w-3.5 text-[#ff947a] shrink-0" />
                      <span>
                        Must Order: <strong>{place.recommendedDish}</strong>
                      </span>
                    </div>
                  )}

                  {/* Tasting Notes */}
                  {place.tastingNotes && (
                    <p className="text-xs text-[#025259] bg-[#FDF8F0] p-3.5 rounded-xl border border-[#025259]/10 italic leading-relaxed w-full">
                      "{place.tastingNotes}"
                    </p>
                  )}

                  {/* Photo Gallery */}
                  {place.photoUrls && place.photoUrls.length > 0 && (
                    <div className="flex items-center gap-2.5 overflow-x-auto py-1 max-w-full">
                      {place.photoUrls.map((url, pIdx) => (
                        <div
                          key={pIdx}
                          className="relative group/photo h-24 w-24 sm:h-28 sm:w-28 shrink-0 rounded-xl overflow-hidden border border-stone-200 shadow-sm group-hover/card:scale-102 transition"
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

                  {/* Action Toolbar */}
                  {onOpenSocialCaptions && (
                    <div className="flex flex-wrap items-center gap-2 pt-2.5 border-t border-[#025259]/10">
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
            })}
          </div>
        )}
      </div>
    </div>
  );
}
