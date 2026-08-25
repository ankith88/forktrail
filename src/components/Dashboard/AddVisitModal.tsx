'use client';

import React, { useState, useEffect } from 'react';
import { VisitedPlace, TimelineChapter, Trip } from '@/types';
import { getLocalDateString, getMealPeriodFromTime, MealType, cn } from '@/lib/utils';
import {
  X,
  MapPin,
  Star,
  Utensils,
  Tag,
  Calendar,
  Clock,
  Navigation,
  Loader2,
  Sparkles,
  Check,
  BookOpen,
  UploadCloud,
  Plus,
  Trash2,
  Image as ImageIcon,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import { VoiceNoteRecorder } from '@/components/ai/VoiceNoteRecorder';
import { VoiceNoteAnalysis } from '@/types';
import { GoogleRestaurantDropdown, GooglePlaceResult } from './GoogleRestaurantDropdown';
import { uploadImageToStorage } from '@/lib/firebase/storageUpload';

interface AddVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  chapters: TimelineChapter[];
  defaultChapterId?: string;
  defaultDate?: string;
  initialVisit?: VisitedPlace | null;
  onSaveVisit: (visit: Partial<VisitedPlace>) => void;
  trips?: Trip[];
  activeTrip?: Trip | null;
  onSelectTrip?: (trip: Trip) => void;
  isHometown?: boolean;
  userId?: string;
}

export function AddVisitModal({
  isOpen,
  onClose,
  chapters,
  defaultChapterId,
  defaultDate,
  initialVisit,
  onSaveVisit,
  trips = [],
  activeTrip = null,
  onSelectTrip,
  isHometown = false,
  userId,
}: AddVisitModalProps) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [category, setCategory] = useState('Restaurant');
  const [rating, setRating] = useState(5);
  const [priceLevel, setPriceLevel] = useState(2);
  const [recommendedDish, setRecommendedDish] = useState('');

  const [tastingNotes, setTastingNotes] = useState('');
  const [dishTagsStr, setDishTagsStr] = useState('');
  const [selectedTripId, setSelectedTripId] = useState<string>(activeTrip?.id || (trips.length > 0 ? trips[0].id : ''));
  const [chapterId, setChapterId] = useState(defaultChapterId || chapters[0]?.id || '');
  
  // Occasion & Celebration Reason
  const [occasion, setOccasion] = useState('casual');
  const [celebrationReason, setCelebrationReason] = useState('');

  // Multi-photo upload & labeled dish photos state
  const [photos, setPhotos] = useState<{ url: string; dishName?: string }[]>([]);
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  
  const [isAutopopulated, setIsAutopopulated] = useState(false);
  const [selectedPlaceId, setSelectedPlaceId] = useState('');
  const [showAdvancedLocation, setShowAdvancedLocation] = useState(false);

  // User Geolocation capture
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState<string>('Select venue via Google search for auto-location');

  const currentTrip = trips.find((t) => t.id === selectedTripId) || activeTrip;
  const isHometownLog =
    isHometown ||
    currentTrip?.categoryType === 'hometown_log' ||
    currentTrip?.isHometown ||
    chapters.length === 0 ||
    chapters[0]?.id?.includes('hometown');

  // Date & Time Visited & Meal Period
  const [visitDate, setVisitDate] = useState(() => getLocalDateString());
  const [visitTimeInput, setVisitTimeInput] = useState(() => {
    const now = new Date();
    const hrs = String(now.getHours()).padStart(2, '0');
    const mins = String(now.getMinutes()).padStart(2, '0');
    return `${hrs}:${mins}`;
  });
  const [mealType, setMealType] = useState<MealType>(() => getMealPeriodFromTime(visitTimeInput));
  const [isManualMealType, setIsManualMealType] = useState(false);

  // Initialize or reset form state when modal opens or initialVisit/defaultDate/defaultChapterId changes
  useEffect(() => {
    if (!isOpen) return;

    if (initialVisit) {
      setName(initialVisit.name || '');
      setAddress(initialVisit.address || '');
      setCategory(initialVisit.category || 'Restaurant');
      setRating(initialVisit.rating || 5);
      setPriceLevel(initialVisit.priceLevel || 2);
      setRecommendedDish(initialVisit.recommendedDish || '');
      setTastingNotes(initialVisit.tastingNotes || '');
      setDishTagsStr((initialVisit.dishTags || []).join(', '));
      setSelectedPlaceId(initialVisit.placeId || '');
      setChapterId(initialVisit.chapterId || defaultChapterId || chapters[0]?.id || '');
      setOccasion(initialVisit.occasion || 'casual');
      setCelebrationReason(initialVisit.celebrationReason || '');
      
      const vDate = initialVisit.localDate || (initialVisit.visitTime ? initialVisit.visitTime.split('T')[0] : getLocalDateString());
      setVisitDate(vDate);

      const vTime = initialVisit.localTime || (initialVisit.visitTime && initialVisit.visitTime.includes('T') ? initialVisit.visitTime.split('T')[1].substring(0, 5) : '20:00');
      setVisitTimeInput(vTime);
      setMealType(initialVisit.mealType || getMealPeriodFromTime(vTime));
      setIsManualMealType(Boolean(initialVisit.mealType));

      if (initialVisit.lat && initialVisit.lng) {
        setLat(initialVisit.lat);
        setLng(initialVisit.lng);
        setLocationStatus(`📍 Venue GPS: ${initialVisit.lat.toFixed(4)}°, ${initialVisit.lng.toFixed(4)}°`);
      }

      if (initialVisit.photos && initialVisit.photos.length > 0) {
        setPhotos(initialVisit.photos);
      } else if (initialVisit.photoUrls && initialVisit.photoUrls.length > 0) {
        setPhotos(initialVisit.photoUrls.map((url) => ({ url, dishName: '' })));
      } else {
        setPhotos([]);
      }
    } else {
      // New visit creation
      setName('');
      setAddress('');
      setCategory('Restaurant');
      setRating(5);
      setPriceLevel(2);
      setRecommendedDish('');
      setTastingNotes('');
      setDishTagsStr('');
      setSelectedPlaceId('');
      setOccasion('casual');
      setCelebrationReason('');
      setPhotos([]);

      const targetChap = defaultChapterId ? chapters.find((c) => c.id === defaultChapterId) : undefined;
      const initialDate = defaultDate || targetChap?.date || getLocalDateString();
      setVisitDate(initialDate);

      const now = new Date();
      const hrs = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      const nowTimeStr = `${hrs}:${mins}`;
      setVisitTimeInput(nowTimeStr);
      setMealType(getMealPeriodFromTime(nowTimeStr));
      setIsManualMealType(false);
    }
  }, [isOpen, initialVisit, defaultDate, defaultChapterId]);

  // Keep selectedTripId in sync with activeTrip
  useEffect(() => {
    if (activeTrip) {
      setSelectedTripId(activeTrip.id);
    }
  }, [activeTrip]);

  const handleTimeChange = (newTime: string) => {
    setVisitTimeInput(newTime);
    if (!isManualMealType) {
      setMealType(getMealPeriodFromTime(newTime));
    }
  };

  const handleDetectLocation = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setLocationStatus('Geolocation is not supported by browser');
      return;
    }
    setIsLocating(true);
    setLocationStatus('Acquiring GPS location...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        setIsLocating(false);
        setLocationStatus(`Captured GPS: ${pos.coords.latitude.toFixed(4)}°, ${pos.coords.longitude.toFixed(4)}°`);
      },
      (err) => {
        setIsLocating(false);
        setLocationStatus(`Error: ${err.message || 'Permission denied'}`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSelectGooglePlace = (place: GooglePlaceResult) => {
    setName(place.name);
    setAddress(place.address || '');
    const detectedCuisine = place.cuisine || place.category || 'Restaurant';
    setCategory(detectedCuisine);

    if (place.lat !== null && place.lng !== null) {
      setLat(place.lat);
      setLng(place.lng);
      setLocationStatus(`📍 Google Map: ${place.lat.toFixed(4)}°, ${place.lng.toFixed(4)}°`);
    }

    if (place.rating) {
      setRating(Math.max(1, Math.min(5, Math.round(place.rating))));
    }

    if (place.priceLevel) {
      setPriceLevel(Math.max(1, Math.min(4, place.priceLevel)));
    }

    if (place.photoUrl && !photos.some((p) => p.url === place.photoUrl)) {
      setPhotos((prev) => [{ url: place.photoUrl, dishName: '' }, ...prev]);
    }

    if (place.placeId) {
      setSelectedPlaceId(place.placeId);
    }

    setIsAutopopulated(true);
  };

  const handleClearAutopopulated = () => {
    setIsAutopopulated(false);
  };

  const handleMultiplePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const files = Array.from(e.target.files);
    if (!userId) {
      alert('Please sign in to upload photos.');
      return;
    }

    setIsUploadingPhoto(true);
    try {
      const newItems: { url: string; dishName: string }[] = [];
      for (const file of files) {
        const url = await uploadImageToStorage(file, userId, 'visit_photos');
        if (url) newItems.push({ url, dishName: '' });
      }
      setPhotos((prev) => [...prev, ...newItems]);
    } catch (err: any) {
      console.error('Error uploading photos:', err);
      alert('Failed to upload image(s): ' + (err.message || 'Unknown error'));
    } finally {
      setIsUploadingPhoto(false);
      e.target.value = '';
    }
  };

  const handleAddCustomUrl = () => {
    if (!customUrlInput.trim()) return;
    const trimmed = customUrlInput.trim();
    if (!photos.some((p) => p.url === trimmed)) {
      setPhotos((prev) => [...prev, { url: trimmed, dishName: '' }]);
    }
    setCustomUrlInput('');
  };

  const handleUpdateDishName = (index: number, dishName: string) => {
    setPhotos((prev) => prev.map((p, i) => (i === index ? { ...p, dishName } : p)));
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMovePhotoLeft = (index: number) => {
    if (index <= 0) return;
    setPhotos((prev) => {
      const updated = [...prev];
      const temp = updated[index - 1];
      updated[index - 1] = updated[index];
      updated[index] = temp;
      return updated;
    });
  };

  const handleMovePhotoRight = (index: number) => {
    setPhotos((prev) => {
      if (index >= prev.length - 1) return prev;
      const updated = [...prev];
      const temp = updated[index + 1];
      updated[index + 1] = updated[index];
      updated[index] = temp;
      return updated;
    });
  };

  const handleSetCoverPhoto = (index: number) => {
    if (index === 0) return;
    setPhotos((prev) => {
      const target = prev[index];
      const rest = prev.filter((_, i) => i !== index);
      return [target, ...rest];
    });
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const dishTags = dishTagsStr
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const localDateTimeStr = `${visitDate}T${visitTimeInput}:00`;
    const selectedDateObj = new Date(localDateTimeStr);
    const visitTimeIso = isNaN(selectedDateObj.getTime())
      ? `${visitDate}T${visitTimeInput}:00Z`
      : selectedDateObj.toISOString();

    const finalPhotos = photos.length
      ? photos
      : [{ url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80', dishName: recommendedDish || 'Chef Specialty' }];

    onSaveVisit({
      id: initialVisit?.id,
      tripId: currentTrip?.id,
      chapterId: isHometownLog
        ? defaultChapterId || chapters[0]?.id || `chap_${currentTrip?.id || 'hometown'}_local`
        : chapterId || (chapters.length > 0 ? chapters[0].id : 'chap_hometown'),
      placeId: selectedPlaceId || initialVisit?.placeId || `place_${Date.now()}`,
      name,
      address: address || 'Local Dining Spot',
      category,
      rating,
      priceLevel,
      recommendedDish,
      tastingNotes,
      dishTags: dishTags.length ? dishTags : ['Local Eats'],
      visitTime: visitTimeIso,
      localDate: visitDate,
      localTime: visitTimeInput,
      mealType,
      lat: lat !== null ? lat : 35.6812 + (Math.random() - 0.5) * 0.05,
      lng: lng !== null ? lng : 139.7671 + (Math.random() - 0.5) * 0.05,
      isHometown: isHometownLog,
      photoUrls: finalPhotos.map((p) => p.url),
      photos: finalPhotos,
      occasion,
      celebrationReason,
    });

    onClose();
  };

  const quickTagsSuggestions = ['#Ramen', '#Coffee', '#Cocktails', '#Dessert', '#Seafood', '#Bistro', '#BBQ'];

  return (
    <div className="fixed inset-0 z-[100] flex flex-col sm:items-center sm:justify-center bg-black/75 backdrop-blur-md overflow-hidden font-sans p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="relative flex flex-col w-full h-full sm:h-auto sm:max-h-[88vh] max-w-xl bg-[#FFFFFF] shadow-2xl rounded-none sm:rounded-3xl border-0 sm:border border-[#025259]/20 overflow-hidden text-[#025259]">
        
        {/* Form wrapping header, scrollable body, and sticky footer */}
        <form onSubmit={handleSubmit} className="flex flex-col h-full sm:h-auto sm:max-h-[88vh] w-full overflow-hidden">
          
          {/* Fixed Header */}
          <div className="flex-none sticky top-0 z-20 bg-[#FFFFFF]/95 backdrop-blur-md border-b border-[#025259]/15 px-4 py-3 sm:px-6 sm:py-4 shadow-xs">
            {/* Drag Handle for Mobile */}
            <div className="w-10 h-1 bg-stone-300 rounded-full mx-auto mb-2 sm:hidden" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-[#ff947a] text-[#025259] shadow-sm shrink-0">
                  <Utensils className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-[#025259] leading-tight">Log Culinary Visit</h2>
                  <p className="text-[11px] font-semibold text-stone-500">
                    {isHometownLog ? '🏠 Hometown Log Visit' : '✈️ Travel Trip Spot'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-full text-stone-400 hover:text-[#025259] hover:bg-stone-100 transition focus:outline-none"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
            
            {/* Auto-populated Notification */}
            {isAutopopulated && (
              <div className="flex items-center justify-between rounded-xl bg-emerald-50 border border-emerald-200 p-2.5 text-xs text-emerald-800 shadow-sm animate-in fade-in">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white text-[10px] font-bold shrink-0">
                    ✓
                  </span>
                  <span className="font-semibold text-[11px]">
                    Google Place Loaded: Geolocation, Cuisine ({category}) & Address synced!
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleClearAutopopulated}
                  className="text-[11px] underline font-medium text-emerald-700 hover:text-emerald-900 shrink-0 ml-2"
                >
                  Reset
                </button>
              </div>
            )}

            {/* Target Log, Date & Time Visited */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {trips.length > 0 && (
                <div className="sm:col-span-1">
                  <label htmlFor="modal-target-trip" className="block text-[#025259] font-bold mb-1 flex items-center gap-1.5 text-xs">
                    <BookOpen className="h-3.5 w-3.5 text-[#ff947a]" /> Target Log / Journal
                  </label>
                  <select
                    id="modal-target-trip"
                    value={selectedTripId}
                    onChange={(e) => {
                      const found = trips.find((t) => t.id === e.target.value);
                      if (found) {
                        setSelectedTripId(found.id);
                        if (onSelectTrip) onSelectTrip(found);
                      }
                    }}
                    className="w-full rounded-xl border border-[#025259]/20 bg-[#FDF8F0] p-2.5 text-[#025259] text-xs font-medium focus:border-[#ff947a] focus:outline-none transition shadow-sm"
                  >
                    {trips.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.categoryType === 'hometown_log' || t.isHometown ? '🏠 Hometown:' : '✈️ Trip:'} {t.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label htmlFor="modal-visit-date" className="block text-[#025259] font-bold mb-1 flex items-center gap-1 text-xs">
                  <Calendar className="h-3.5 w-3.5 text-[#ff947a]" /> Date Visited
                </label>
                <input
                  id="modal-visit-date"
                  type="date"
                  required
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                  className="w-full rounded-xl border border-[#025259]/20 bg-[#FDF8F0] p-2.5 text-[#025259] text-xs font-medium focus:border-[#ff947a] focus:outline-none transition shadow-sm"
                />
              </div>

              <div>
                <label htmlFor="modal-visit-time" className="block text-[#025259] font-bold mb-1 flex items-center gap-1 text-xs">
                  <Clock className="h-3.5 w-3.5 text-[#ff947a]" /> Time Visited
                </label>
                <input
                  id="modal-visit-time"
                  type="time"
                  required
                  value={visitTimeInput}
                  onChange={(e) => handleTimeChange(e.target.value)}
                  className="w-full rounded-xl border border-[#025259]/20 bg-[#FDF8F0] p-2.5 text-[#025259] text-xs font-medium focus:border-[#ff947a] focus:outline-none transition shadow-sm"
                />
              </div>
            </div>

            {/* Meal Period Selection */}
            <div>
              <label className="block text-[#025259] font-bold mb-1.5 flex items-center justify-between text-xs">
                <span>Meal / Dining Occasion</span>
                <span className="text-[10px] text-stone-500 font-normal">Auto-detected from time, click to customize</span>
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                {[
                  { id: 'breakfast', label: 'Breakfast', icon: '🌅' },
                  { id: 'brunch', label: 'Brunch', icon: '🥂' },
                  { id: 'lunch', label: 'Lunch', icon: '☀️' },
                  { id: 'snack', label: 'Snack', icon: '☕' },
                  { id: 'dinner', label: 'Dinner', icon: '🌙' },
                  { id: 'late_night', label: 'Late Night', icon: '🍸' },
                ].map((m) => {
                  const isSelected = mealType === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        setMealType(m.id as MealType);
                        setIsManualMealType(true);
                      }}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl border text-[11px] font-bold transition ${
                        isSelected
                          ? 'bg-[#ff947a] border-[#ff947a] text-[#025259] shadow-sm scale-102 ring-2 ring-[#ff947a]/30'
                          : 'bg-[#FDF8F0] border-[#025259]/15 text-[#025259]/80 hover:bg-[#FAF3E7]'
                      }`}
                    >
                      <span className="text-sm">{m.icon}</span>
                      <span className="mt-0.5 leading-none text-[10px]">{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Celebration Occasion & Story Reason */}
            <div className="rounded-xl border border-[#ff947a]/30 bg-[#ff947a]/5 p-3 space-y-2 shadow-xs">
              <label className="block text-[#025259] font-bold flex items-center justify-between text-xs">
                <span className="flex items-center gap-1 text-[#025259]">
                  <Sparkles className="h-3.5 w-3.5 text-[#ff947a]" /> Event / Celebration Occasion
                </span>
                <span className="text-[10px] text-stone-500 font-semibold">Powers AI 30s Reel Story</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {[
                  { id: 'birthday', label: '🎂 Birthday' },
                  { id: 'anniversary', label: '🥂 Anniversary' },
                  { id: 'date_night', label: '✨ Date Night' },
                  { id: 'food_crawl', label: '🍜 Food Crawl' },
                  { id: 'milestone', label: '🎉 Milestone' },
                  { id: 'business', label: '💼 Business' },
                  { id: 'casual', label: '🍽️ Casual Dine' },
                ].map((occ) => {
                  const isSelected = occasion === occ.id;
                  return (
                    <button
                      key={occ.id}
                      type="button"
                      onClick={() => setOccasion(occ.id)}
                      className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-bold transition text-left truncate ${
                        isSelected
                          ? 'bg-[#ff947a] border-[#ff947a] text-[#025259] shadow-sm'
                          : 'bg-white border-[#025259]/15 text-[#025259]/80 hover:bg-[#FDF8F0]'
                      }`}
                    >
                      {occ.label}
                    </button>
                  );
                })}
              </div>
              <input
                type="text"
                placeholder="Reason for eating here? (e.g. Sarah's 30th Birthday party with chef's tasting menu)"
                value={celebrationReason}
                onChange={(e) => setCelebrationReason(e.target.value)}
                className="w-full rounded-xl border border-[#025259]/20 bg-white p-2.5 text-xs text-[#025259] placeholder-stone-400 focus:border-[#ff947a] focus:outline-none transition shadow-sm"
              />
            </div>

            {/* Venue Name (Google Dropdown) */}
            <div>
              <label htmlFor="modal-venue-name" className="block text-[#025259] font-bold mb-1 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1">
                  <Utensils className="h-3.5 w-3.5 text-[#ff947a]" /> Restaurant / Venue Name
                </span>
                <span className="text-[10px] text-[#ff947a] font-semibold flex items-center gap-0.5">
                  <Sparkles className="h-3 w-3" /> Select from Google Dropdown
                </span>
              </label>
              <GoogleRestaurantDropdown
                id="modal-venue-name"
                required
                value={name}
                onChange={(val) => setName(val)}
                onSelectPlace={handleSelectGooglePlace}
                isAutopopulated={isAutopopulated}
                onClearAutopopulated={handleClearAutopopulated}
                placeholder="Start typing venue name (e.g. Grappa, Mensho Tokyo)..."
              />
            </div>

            {/* Auto-populated Google Details Info Card */}
            <div className="rounded-xl border border-[#025259]/15 bg-[#FDF8F0] p-3 space-y-1.5 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Navigation className="h-3.5 w-3.5 text-[#ff947a]" />
                  <span className="font-bold text-[#025259] text-[11px]">Auto Location & Cuisine</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAdvancedLocation((prev) => !prev)}
                  className="text-[10px] text-[#025259]/70 underline hover:text-[#025259] font-medium"
                >
                  {showAdvancedLocation ? 'Hide Details' : 'Edit Address / GPS'}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-stone-600">
                <div>
                  <span className="font-semibold text-[#025259]">Cuisine:</span> {category}
                </div>
                <div className="truncate">
                  <span className="font-semibold text-[#025259]">Location:</span>{' '}
                  {lat !== null && lng !== null ? `${lat.toFixed(4)}°, ${lng.toFixed(4)}°` : 'Pending Google selection'}
                </div>
              </div>

              {showAdvancedLocation && (
                <div className="pt-2 border-t border-[#025259]/10 space-y-2 animate-in fade-in">
                  <div>
                    <label htmlFor="modal-address" className="block text-[#025259] font-semibold mb-0.5 text-[10px]">Address</label>
                    <input
                      id="modal-address"
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Address automatically filled from Google"
                      className="w-full rounded-lg border border-[#025259]/20 bg-[#FFFFFF] p-2 text-xs text-[#025259]"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] text-stone-500 truncate">{locationStatus}</span>
                    <button
                      type="button"
                      onClick={handleDetectLocation}
                      disabled={isLocating}
                      className="flex items-center gap-1 rounded-lg border border-[#025259]/20 bg-[#FFFFFF] px-2.5 py-1 font-bold text-[#025259] text-[10px] hover:bg-[#ff947a] transition shrink-0"
                    >
                      {isLocating ? <Loader2 className="h-3 w-3 animate-spin text-[#ff947a]" /> : <MapPin className="h-3 w-3 text-[#ff947a]" />}
                      Use Device GPS
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Rating & Must Order Dish */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="modal-rating-select" className="block text-[#025259] font-bold mb-1 flex items-center gap-1 text-xs">
                  <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-400" /> Rating (1-5 Stars)
                </label>
                <select
                  id="modal-rating-select"
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="w-full rounded-xl border border-[#025259]/20 bg-[#FDF8F0] p-2.5 text-[#025259] text-xs font-bold focus:border-[#ff947a] focus:outline-none transition shadow-sm"
                >
                  <option value={5}>5 ★★★★★ (Masterpiece)</option>
                  <option value={4}>4 ★★★★☆ (Excellent)</option>
                  <option value={3}>3 ★★★☆☆ (Good)</option>
                  <option value={2}>2 ★★☆☆☆ (Average)</option>
                  <option value={1}>1 ★☆☆☆☆ (Skip)</option>
                </select>
              </div>

              <div>
                <label htmlFor="modal-recommended-dish" className="block text-[#025259] font-bold mb-1 text-xs">Must Order Dish / Drink</label>
                <input
                  id="modal-recommended-dish"
                  type="text"
                  placeholder="e.g. Special Tsukemen, Espresso Tonic..."
                  value={recommendedDish}
                  onChange={(e) => setRecommendedDish(e.target.value)}
                  className="w-full rounded-xl border border-[#025259]/20 bg-[#FDF8F0] p-2.5 text-[#025259] text-xs placeholder-stone-400 focus:border-[#ff947a] focus:outline-none font-medium transition shadow-sm"
                />
              </div>
            </div>

            {/* AI Voice-to-Tasting Note Recorder */}
            <VoiceNoteRecorder
              onApplyAnalysis={(analysis: VoiceNoteAnalysis) => {
                const combinedNotes = `Aroma & Flavor: ${analysis.aromaAndFlavor}\nTexture: ${analysis.textureAndPresentation}\nVibe: ${analysis.valueAndVibe}`;
                setTastingNotes((prev) => (prev ? `${prev}\n\n${combinedNotes}` : combinedNotes));
                if (analysis.standoutDish && !recommendedDish) {
                  setRecommendedDish(analysis.standoutDish);
                }
              }}
            />

            {/* Tasting Notes & Sensory Impressions */}
            <div>
              <label htmlFor="modal-tasting-notes" className="block text-[#025259] font-bold mb-1 text-xs">Tasting Notes & Sensory Impressions</label>
              <textarea
                id="modal-tasting-notes"
                rows={3}
                placeholder="Rich poultry-fish broth, firm chewy noodles, cozy neighborhood vibe..."
                value={tastingNotes}
                onChange={(e) => setTastingNotes(e.target.value)}
                className="w-full rounded-xl border border-[#025259]/20 bg-[#FDF8F0] p-2.5 text-[#025259] text-xs placeholder-stone-400 focus:border-[#ff947a] focus:outline-none transition shadow-sm"
              />
            </div>

            {/* Dish Tags */}
            <div>
              <label htmlFor="modal-dish-tags" className="block text-[#025259] font-bold mb-1 flex items-center justify-between text-xs">
                <span>Dish Tags (comma separated)</span>
                <span className="text-[10px] text-stone-400">Click to add:</span>
              </label>
              <input
                id="modal-dish-tags"
                type="text"
                placeholder="Ramen, Cold Brew, V60, Speakeasy"
                value={dishTagsStr}
                onChange={(e) => setDishTagsStr(e.target.value)}
                className="w-full rounded-xl border border-[#025259]/20 bg-[#FDF8F0] p-2.5 text-[#025259] text-xs placeholder-stone-400 focus:border-[#ff947a] focus:outline-none mb-1.5 transition shadow-sm"
              />
              <div className="flex flex-wrap gap-1">
                {quickTagsSuggestions.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      const cleanTag = tag.replace('#', '');
                      setDishTagsStr((prev) => {
                        const tags = prev.split(',').map((t) => t.trim()).filter(Boolean);
                        if (!tags.includes(cleanTag)) {
                          return tags.length ? `${prev}, ${cleanTag}` : cleanTag;
                        }
                        return prev;
                      });
                    }}
                    className="rounded-lg bg-[#025259]/5 hover:bg-[#ff947a]/20 border border-[#025259]/10 px-2 py-0.5 text-[10px] font-semibold text-[#025259] transition"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Multiple Photos Upload Gallery */}
            <div className="space-y-2 pt-2 border-t border-[#025259]/10">
              <label className="block text-[#025259] font-bold flex items-center justify-between text-xs">
                <span className="flex items-center gap-1">
                  <ImageIcon className="h-3.5 w-3.5 text-[#ff947a]" /> Food Photos & Dish Names
                </span>
                <span className="text-[10px] text-stone-500 font-semibold">{photos.length} photo(s) attached</span>
              </label>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                {/* File Upload Button */}
                <label className="flex items-center justify-center gap-2 cursor-pointer rounded-xl bg-[#ff947a]/20 border border-[#ff947a] px-3.5 py-2.5 text-xs font-bold text-[#025259] hover:bg-[#ff947a]/30 transition shrink-0 shadow-xs">
                  {isUploadingPhoto ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-[#025259]" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="h-4 w-4 text-[#025259]" />
                      <span>Choose Photos</span>
                    </>
                  )}
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleMultiplePhotoUpload}
                    disabled={isUploadingPhoto}
                    className="hidden"
                  />
                </label>

                {/* Paste Image URL Input */}
                <div className="flex-1 flex gap-1.5">
                  <input
                    type="text"
                    placeholder="Or paste photo URL (https://...)"
                    value={customUrlInput}
                    onChange={(e) => setCustomUrlInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomUrl();
                      }
                    }}
                    className="w-full rounded-xl border border-[#025259]/20 bg-[#FDF8F0] p-2.5 text-[#025259] placeholder-stone-400 focus:border-[#ff947a] focus:outline-none text-xs transition shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomUrl}
                    disabled={!customUrlInput.trim()}
                    className="shrink-0 flex items-center justify-center px-3 rounded-xl bg-[#025259] text-white hover:bg-[#025259]/90 disabled:opacity-40 transition font-bold"
                    title="Add URL"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Labeled Photo Gallery Grid Preview with Manual Reordering */}
              {photos.length > 0 && (
                <div className="space-y-2 mt-2 pt-2 border-t border-[#025259]/10 max-h-56 overflow-y-auto pr-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider block">
                      Arrange Photos & Tag Dish Names:
                    </span>
                    <span className="text-[10px] text-[#ff947a] font-bold">
                      💡 Use arrows ← → to reorder photos
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {photos.map((item, index) => (
                      <div key={index} className={cn("flex flex-col gap-1.5 p-2 rounded-xl border shadow-xs transition", index === 0 ? "border-[#ff947a] bg-[#ff947a]/10" : "border-[#025259]/15 bg-[#FAF3E7]/50")}>
                        <div className="flex items-center gap-2">
                          <div className="group relative h-14 w-14 rounded-lg overflow-hidden border border-[#025259]/20 shrink-0 shadow-xs">
                            <img src={item.url} alt={`Photo ${index + 1}`} className="h-full w-full object-cover" />
                            {index === 0 && (
                              <span className="absolute top-0 inset-x-0 bg-[#025259] text-[#ff947a] text-[8px] font-extrabold text-center py-0.5 uppercase tracking-tighter">
                                Cover
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemovePhoto(index)}
                              className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-white opacity-90 hover:opacity-100 transition shadow-sm z-10"
                              title="Remove photo"
                            >
                              <X className="h-2.5 w-2.5" />
                            </button>
                          </div>

                          <div className="flex-1 flex flex-col justify-between h-full gap-1">
                            <input
                              type="text"
                              placeholder="Dish name (e.g. Wagyu A5 Nigiri)"
                              value={item.dishName || ''}
                              onChange={(e) => handleUpdateDishName(index, e.target.value)}
                              className="w-full rounded-lg border border-[#025259]/20 bg-white px-2 py-1 text-[11px] text-[#025259] placeholder-stone-400 focus:border-[#ff947a] focus:outline-none"
                            />
                            
                            {/* Reorder Toolbar */}
                            <div className="flex items-center justify-between text-[10px]">
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleMovePhotoLeft(index)}
                                  disabled={index === 0}
                                  className="flex items-center justify-center h-5 w-5 rounded bg-white border border-[#025259]/20 text-[#025259] hover:bg-[#ff947a] transition disabled:opacity-30 disabled:pointer-events-none"
                                  title="Move Left / Earlier"
                                >
                                  <ArrowLeft className="h-3 w-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleMovePhotoRight(index)}
                                  disabled={index === photos.length - 1}
                                  className="flex items-center justify-center h-5 w-5 rounded bg-white border border-[#025259]/20 text-[#025259] hover:bg-[#ff947a] transition disabled:opacity-30 disabled:pointer-events-none"
                                  title="Move Right / Later"
                                >
                                  <ArrowRight className="h-3 w-3" />
                                </button>
                              </div>

                              {index !== 0 && (
                                <button
                                  type="button"
                                  onClick={() => handleSetCoverPhoto(index)}
                                  className="text-[9px] font-bold text-[#025259] hover:text-[#ff947a] underline"
                                >
                                  Set Cover
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Fixed Footer / Sticky Bottom Bar */}
          <div className="flex-none sticky bottom-0 z-20 bg-[#FFFFFF]/95 backdrop-blur-md border-t border-[#025259]/15 px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-end gap-3 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none rounded-xl border border-[#025259]/20 px-4 py-2.5 text-xs font-semibold text-[#025259] hover:bg-[#FDF8F0] transition text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 sm:flex-none rounded-xl bg-[#ff947a] px-6 py-2.5 text-xs font-bold text-[#025259] hover:bg-[#f08368] active:scale-[0.98] transition shadow-md text-center flex items-center justify-center gap-1.5"
            >
              <Check className="h-4 w-4" />
              <span>Save Visit to Log</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

