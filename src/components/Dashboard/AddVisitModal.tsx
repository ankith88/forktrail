'use client';

import React, { useState, useEffect } from 'react';
import { VisitedPlace, TimelineChapter, Trip } from '@/types';
import { getLocalDateString } from '@/lib/utils';
import { X, MapPin, Star, Utensils, Tag, Calendar, Navigation, Loader2, Sparkles, Check, BookOpen } from 'lucide-react';
import { VoiceNoteRecorder } from '@/components/ai/VoiceNoteRecorder';
import { VoiceNoteAnalysis } from '@/types';
import { GoogleRestaurantDropdown, GooglePlaceResult } from './GoogleRestaurantDropdown';

import { UploadCloud } from 'lucide-react';
import { uploadImageToStorage } from '@/lib/firebase/storageUpload';

interface AddVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  chapters: TimelineChapter[];
  defaultChapterId?: string;
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
  onSaveVisit,
  trips = [],
  activeTrip = null,
  onSelectTrip,
  isHometown = false,
  userId,
}: AddVisitModalProps) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [category, setCategory] = useState('Ramen');
  const [rating, setRating] = useState(5);
  const [priceLevel, setPriceLevel] = useState(2);
  const [recommendedDish, setRecommendedDish] = useState('');
  const [tastingNotes, setTastingNotes] = useState('');
  const [dishTagsStr, setDishTagsStr] = useState('');
  const [selectedTripId, setSelectedTripId] = useState<string>(activeTrip?.id || (trips.length > 0 ? trips[0].id : ''));
  const [chapterId, setChapterId] = useState(defaultChapterId || chapters[0]?.id || '');
  const [photoUrl, setPhotoUrl] = useState('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isAutopopulated, setIsAutopopulated] = useState(false);
  const [selectedPlaceId, setSelectedPlaceId] = useState('');

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];
    if (!userId) {
      alert('Please sign in to upload photos.');
      return;
    }
    setIsUploadingPhoto(true);
    try {
      const storageUrl = await uploadImageToStorage(file, userId, 'visit_photos');
      setPhotoUrl(storageUrl);
    } catch (err: any) {
      console.error('Error uploading photo to Firebase Storage:', err);
      alert('Failed to upload image to Firebase Storage: ' + (err.message || 'Unknown error'));
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Keep selectedTripId in sync with activeTrip
  useEffect(() => {
    if (activeTrip) {
      setSelectedTripId(activeTrip.id);
    }
  }, [activeTrip]);

  const currentTrip = trips.find((t) => t.id === selectedTripId) || activeTrip;
  const isHometownLog =
    isHometown ||
    currentTrip?.categoryType === 'hometown_log' ||
    currentTrip?.isHometown ||
    chapters.length === 0 ||
    chapters[0]?.id?.includes('hometown');

  // Date Visited - Defaults to current local date of user location
  const [visitDate, setVisitDate] = useState(() => getLocalDateString());

  // User Geolocation capture
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState<string>('Location not detected');

  const handleDetectLocation = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setLocationStatus('Geolocation is not supported by your browser');
      return;
    }
    setIsLocating(true);
    setLocationStatus('Acquiring location...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        setIsLocating(false);
        setLocationStatus(`Captured: ${pos.coords.latitude.toFixed(4)}°, ${pos.coords.longitude.toFixed(4)}°`);
      },
      (err) => {
        setIsLocating(false);
        setLocationStatus(`Error: ${err.message || 'Permission denied'}`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => {
    if (isOpen && lat === null) {
      handleDetectLocation();
    }
  }, [isOpen]);

  const handleSelectGooglePlace = (place: GooglePlaceResult) => {
    setName(place.name);
    setAddress(place.address || '');
    const detectedCuisine = place.cuisine || place.category || 'Restaurant';
    setCategory(detectedCuisine);

    if (place.lat !== null && place.lng !== null) {
      setLat(place.lat);
      setLng(place.lng);
      setLocationStatus(`Google Map: ${place.lat.toFixed(4)}°, ${place.lng.toFixed(4)}°`);
    }

    if (place.rating) {
      setRating(Math.max(1, Math.min(5, Math.round(place.rating))));
    }

    if (place.priceLevel) {
      setPriceLevel(Math.max(1, Math.min(4, place.priceLevel)));
    }

    if (place.photoUrl) {
      setPhotoUrl(place.photoUrl);
    }

    if (place.placeId) {
      setSelectedPlaceId(place.placeId);
    }

    setIsAutopopulated(true);
  };

  const handleClearAutopopulated = () => {
    setIsAutopopulated(false);
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const dishTags = dishTagsStr
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    // Build ISO timestamp from user selected date
    const selectedDateObj = new Date(visitDate + 'T' + new Date().toTimeString().split(' ')[0]);
    const visitTimeIso = isNaN(selectedDateObj.getTime())
      ? new Date().toISOString()
      : selectedDateObj.toISOString();

    onSaveVisit({
      tripId: currentTrip?.id,
      chapterId: isHometownLog
        ? defaultChapterId || chapters[0]?.id || `chap_${currentTrip?.id || 'hometown'}_local`
        : chapterId || (chapters.length > 0 ? chapters[0].id : 'chap_hometown'),
      placeId: selectedPlaceId || `place_${Date.now()}`,
      name,
      address: address || 'Local Dining Spot',
      category,
      rating,
      priceLevel,
      recommendedDish,
      tastingNotes,
      dishTags: dishTags.length ? dishTags : ['Local Eats'],
      visitTime: visitTimeIso,
      lat: lat !== null ? lat : 37.7749 + (Math.random() - 0.5) * 0.05,
      lng: lng !== null ? lng : -122.4194 + (Math.random() - 0.5) * 0.05,
      isHometown: isHometownLog,
      photoUrls: photoUrl
        ? [photoUrl]
        : ['https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80'],
    });

    onClose();
  };

  const standardCategories = [
    'Ramen',
    'Sushi',
    'Izakaya',
    'Café',
    'Bakery',
    'Fine Dining',
    'Street Food',
    'Yakiniku',
    'Italian',
    'French',
    'Chinese',
    'Mexican',
    'Indian',
    'Thai',
    'Korean',
    'Vietnamese',
    'Seafood',
    'Steakhouse',
    'Spanish',
    'Bistro',
    'Cocktail Bar',
    'Bar',
    'Pub',
    'Restaurant',
  ];
  const allCategoryOptions = Array.from(new Set([category, ...standardCategories]));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto font-sans">
      <div className="relative w-full max-w-lg rounded-2xl border border-[#025259]/20 bg-[#FFFFFF] p-6 shadow-2xl space-y-5 text-[#025259]">
        
        <div className="flex items-center justify-between border-b border-[#025259]/15 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ff947a] text-[#025259]">
              <Utensils className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#025259]">Log New Culinary Visit</h2>
              <p className="text-[10px] font-semibold text-stone-500">
                {isHometownLog ? '🏠 Hometown Log Visit' : '✈️ Travel Trip Spot'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-[#025259]">
            <X className="h-5 w-5" />
          </button>
        </div>

        {isAutopopulated && (
          <div className="flex items-center justify-between rounded-xl bg-emerald-50 border border-emerald-200 p-2.5 text-xs text-emerald-800 shadow-sm animate-in fade-in">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white text-[10px] font-bold">
                ✓
              </span>
              <span className="font-semibold">
                Auto-populated from Google Places (Address, Cuisine, Rating & Location loaded)
              </span>
            </div>
            <button
              type="button"
              onClick={handleClearAutopopulated}
              className="text-[11px] underline font-medium text-emerald-700 hover:text-emerald-900"
            >
              Reset
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Target Log Selector (If user has multiple logs) */}
          {trips.length > 0 && (
            <div>
              <label htmlFor="modal-target-trip" className="block text-[#025259] font-bold mb-1 flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5 text-[#ff947a]" /> Target Food Log / Journal
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
                className="w-full rounded-xl border border-[#025259]/20 bg-[#FDF8F0] p-2.5 text-[#025259] font-medium focus:border-[#ff947a] focus:outline-none"
              >
                {trips.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.categoryType === 'hometown_log' || t.isHometown ? '🏠 Hometown Log:' : '✈️ Travel Trip:'} {t.title} ({t.destination})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Date Visited & Timeline Chapter (Day/Chapter is hidden for Hometown Logs!) */}
          {!isHometownLog ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="modal-chapter-select" className="block text-[#025259] font-bold mb-1">Timeline Day / Chapter</label>
                <select
                  id="modal-chapter-select"
                  value={chapterId}
                  onChange={(e) => setChapterId(e.target.value)}
                  className="w-full rounded-xl border border-[#025259]/20 bg-[#FDF8F0] p-2.5 text-[#025259] font-medium"
                >
                  {chapters.map((c) => (
                    <option key={c.id} value={c.id}>
                      Day {c.dayNumber}: {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="modal-visit-date" className="block text-[#025259] font-bold mb-1 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-[#ff947a]" /> Date Visited
                </label>
                <input
                  id="modal-visit-date"
                  type="date"
                  required
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                  className="w-full rounded-xl border border-[#025259]/20 bg-[#FDF8F0] p-2.5 text-[#025259] font-medium focus:border-[#ff947a] focus:outline-none"
                />
              </div>
            </div>
          ) : (
            <div>
              <label htmlFor="modal-visit-date" className="block text-[#025259] font-bold mb-1 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-[#ff947a]" /> Date Visited
              </label>
              <input
                id="modal-visit-date"
                type="date"
                required
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
                className="w-full rounded-xl border border-[#025259]/20 bg-[#FDF8F0] p-2.5 text-[#025259] font-medium focus:border-[#ff947a] focus:outline-none"
              />
            </div>
          )}

          {/* User Geolocation Card */}
          <div className="rounded-xl border border-[#025259]/15 bg-[#FDF8F0] p-3 text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#025259]/10 text-[#025259]">
                <Navigation className="h-4 w-4 text-[#ff947a]" />
              </div>
              <div className="truncate">
                <span className="block font-bold text-[#025259]">Captured Geolocation</span>
                <span className="block text-[11px] text-stone-600 truncate">{locationStatus}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={isLocating}
              className="shrink-0 flex items-center gap-1 rounded-lg border border-[#025259]/20 bg-[#FFFFFF] px-2.5 py-1.5 font-bold text-[#025259] hover:bg-[#ff947a] transition text-[11px] disabled:opacity-50"
            >
              {isLocating ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin text-[#ff947a]" />
                  Locating...
                </>
              ) : (
                <>
                  <MapPin className="h-3 w-3 text-[#ff947a]" />
                  Detect Location
                </>
              )}
            </button>
          </div>

          {/* Venue Name (Google Dropdown) & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="modal-venue-name" className="block text-[#025259] font-bold mb-1 flex items-center justify-between">
                <span>Venue / Restaurant Name</span>
                <span className="text-[10px] text-[#ff947a] font-normal flex items-center gap-0.5">
                  <Sparkles className="h-2.5 w-2.5" /> Google Dropdown
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
                placeholder="Search venue on Google..."
              />
            </div>
            <div>
              <label htmlFor="modal-category" className="block text-[#025259] font-bold mb-1">Cuisine / Category</label>
              <select
                id="modal-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-[#025259]/20 bg-[#FDF8F0] p-2.5 text-[#025259] font-medium"
              >
                {allCategoryOptions.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="modal-address" className="block text-[#025259] font-bold mb-1">Address / Location</label>
            <input
              id="modal-address"
              type="text"
              placeholder="e.g. 2-14-3 Yoyogi, Shibuya-ku, Tokyo"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full rounded-xl border border-[#025259]/20 bg-[#FDF8F0] p-2.5 text-[#025259] placeholder-stone-400 focus:border-[#ff947a] focus:outline-none"
            />
          </div>

          {/* Rating & Recommended Dish */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="modal-rating-select" className="block text-[#025259] font-bold mb-1">Rating (1-5 Stars)</label>
              <select
                id="modal-rating-select"
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="w-full rounded-xl border border-[#025259]/20 bg-[#FDF8F0] p-2.5 text-[#025259] font-medium"
              >
                <option value={5}>5 ★★★★★ (Masterpiece)</option>
                <option value={4}>4 ★★★★☆ (Excellent)</option>
                <option value={3}>3 ★★★☆☆ (Good)</option>
                <option value={2}>2 ★★☆☆☆ (Average)</option>
                <option value={1}>1 ★☆☆☆☆ (Skip)</option>
              </select>
            </div>
            <div>
              <label htmlFor="modal-recommended-dish" className="block text-[#025259] font-bold mb-1">Must Order Dish / Drink</label>
              <input
                id="modal-recommended-dish"
                type="text"
                placeholder="e.g. Special Tsukemen or Espresso Tonic"
                value={recommendedDish}
                onChange={(e) => setRecommendedDish(e.target.value)}
                className="w-full rounded-xl border border-[#025259]/20 bg-[#FDF8F0] p-2.5 text-[#025259] placeholder-stone-400 focus:border-[#ff947a] focus:outline-none"
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

          {/* Tasting Notes */}
          <div>
            <label htmlFor="modal-tasting-notes" className="block text-[#025259] font-bold mb-1">Tasting Notes & Sensory Impressions</label>
            <textarea
              id="modal-tasting-notes"
              rows={3}
              placeholder="Rich poultry-fish broth, firm chewy noodles, cozy neighborhood vibe..."
              value={tastingNotes}
              onChange={(e) => setTastingNotes(e.target.value)}
              className="w-full rounded-xl border border-[#025259]/20 bg-[#FDF8F0] p-2.5 text-[#025259] placeholder-stone-400 focus:border-[#ff947a] focus:outline-none"
            />
          </div>

          {/* Dish Tags & Photo Upload */}
          <div className="space-y-3">
            <div>
              <label htmlFor="modal-dish-tags" className="block text-[#025259] font-bold mb-1">Dish Tags (comma separated)</label>
              <input
                id="modal-dish-tags"
                type="text"
                placeholder="Coffee, Cold Brew, V60"
                value={dishTagsStr}
                onChange={(e) => setDishTagsStr(e.target.value)}
                className="w-full rounded-xl border border-[#025259]/20 bg-[#FDF8F0] p-2.5 text-[#025259] placeholder-stone-400 focus:border-[#ff947a] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[#025259] font-bold mb-1">Food Photo (Upload to Firebase Storage)</label>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <label className="flex items-center justify-center gap-2 cursor-pointer rounded-xl bg-[#ff947a]/20 border border-[#ff947a] px-3.5 py-2.5 text-xs font-bold text-[#025259] hover:bg-[#ff947a]/30 transition shrink-0">
                  {isUploadingPhoto ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-[#025259]" />
                      <span>Uploading to Firebase...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="h-4 w-4 text-[#025259]" />
                      <span>Choose Image File</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    disabled={isUploadingPhoto}
                    className="hidden"
                  />
                </label>
                <input
                  id="modal-photo-url"
                  type="text"
                  placeholder="Or paste image URL (https://...)"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  className="w-full rounded-xl border border-[#025259]/20 bg-[#FDF8F0] p-2.5 text-[#025259] placeholder-stone-400 focus:border-[#ff947a] focus:outline-none text-xs"
                />
              </div>
              {photoUrl && (
                <div className="mt-2 flex items-center gap-2">
                  <img src={photoUrl} alt="Preview" className="h-10 w-10 rounded-lg object-cover border border-[#025259]/20" />
                  <span className="text-[10px] text-emerald-700 font-semibold truncate">Image attached & ready to save!</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#025259]/15">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[#025259]/20 px-4 py-2 font-semibold text-[#025259] hover:bg-[#FDF8F0] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-[#ff947a] px-5 py-2 font-bold text-[#025259] hover:bg-[#f08368] transition shadow-md"
            >
              Save Visit to Log
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
