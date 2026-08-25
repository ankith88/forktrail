'use client';

import React, { useState, useEffect } from 'react';
import { VisitedPlace, TimelineChapter } from '@/types';
import { getLocalDateString } from '@/lib/utils';
import { X, MapPin, Star, Utensils, Tag, Calendar, Navigation, Loader2 } from 'lucide-react';

interface AddVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  chapters: TimelineChapter[];
  defaultChapterId?: string;
  onSaveVisit: (visit: Partial<VisitedPlace>) => void;
}

export function AddVisitModal({
  isOpen,
  onClose,
  chapters,
  defaultChapterId,
  onSaveVisit,
}: AddVisitModalProps) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [category, setCategory] = useState('Ramen');
  const [rating, setRating] = useState(5);
  const [priceLevel, setPriceLevel] = useState(2);
  const [recommendedDish, setRecommendedDish] = useState('');
  const [tastingNotes, setTastingNotes] = useState('');
  const [dishTagsStr, setDishTagsStr] = useState('');
  const [chapterId, setChapterId] = useState(defaultChapterId || chapters[0]?.id || '');
  const [photoUrl, setPhotoUrl] = useState('');

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

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const dishTags = dishTagsStr
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    // Build ISO timestamp from user selected date
    const selectedDateObj = new Date(visitDate + 'T' + new Date().toTimeString().split(' ')[0]);
    const visitTimeIso = isNaN(selectedDateObj.getTime())
      ? new Date().toISOString()
      : selectedDateObj.toISOString();

    onSaveVisit({
      chapterId: chapterId || (chapters.length > 0 ? chapters[0].id : 'chap_hometown'),
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
      isHometown: chapters.length === 0 || chapters[0]?.id?.includes('hometown'),
      photoUrls: photoUrl
        ? [photoUrl]
        : ['https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80'],
    });

    onClose();
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl border border-[#025259]/20 bg-[#FFFFFF] p-6 shadow-2xl space-y-5">
        
        <div className="flex items-center justify-between border-b border-[#025259]/15 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ff947a] text-[#025259]">
              <Utensils className="h-5 w-5" />
            </div>
            <h2 className="text-base font-bold text-[#025259]">Log New Culinary Visit</h2>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-[#025259]">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Chapter Selector & Date Visited */}
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


          {/* Venue Name & Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="modal-venue-name" className="block text-[#025259] font-bold mb-1">Venue / Restaurant Name</label>
              <input
                id="modal-venue-name"
                type="text"
                required
                placeholder="e.g. Fuunji Ramen"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-[#025259]/20 bg-[#FDF8F0] p-2.5 text-[#025259] placeholder-stone-400 focus:border-[#ff947a] focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="modal-category" className="block text-[#025259] font-bold mb-1">Category</label>
              <select
                id="modal-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-[#025259]/20 bg-[#FDF8F0] p-2.5 text-[#025259] font-medium"
              >
                <option value="Ramen">Ramen</option>
                <option value="Sushi">Sushi</option>
                <option value="Izakaya">Izakaya</option>
                <option value="Café">Café</option>
                <option value="Bakery">Bakery</option>
                <option value="Fine Dining">Fine Dining</option>
                <option value="Street Food">Street Food</option>
                <option value="Yakiniku">Yakiniku</option>
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
              <label htmlFor="modal-recommended-dish" className="block text-[#025259] font-bold mb-1">Must Order Dish</label>
              <input
                id="modal-recommended-dish"
                type="text"
                placeholder="e.g. Special Tsukemen"
                value={recommendedDish}
                onChange={(e) => setRecommendedDish(e.target.value)}
                className="w-full rounded-xl border border-[#025259]/20 bg-[#FDF8F0] p-2.5 text-[#025259] placeholder-stone-400 focus:border-[#ff947a] focus:outline-none"
              />
            </div>
          </div>

          {/* Tasting Notes */}
          <div>
            <label htmlFor="modal-tasting-notes" className="block text-[#025259] font-bold mb-1">Tasting Notes & Sensory Impressions</label>
            <textarea
              id="modal-tasting-notes"
              rows={3}
              placeholder="Rich poultry-fish broth, firm chewy noodles, melt-in-mouth chashu..."
              value={tastingNotes}
              onChange={(e) => setTastingNotes(e.target.value)}
              className="w-full rounded-xl border border-[#025259]/20 bg-[#FDF8F0] p-2.5 text-[#025259] placeholder-stone-400 focus:border-[#ff947a] focus:outline-none"
            />
          </div>

          {/* Dish Tags & Photo URL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="modal-dish-tags" className="block text-[#025259] font-bold mb-1">Dish Tags (comma separated)</label>
              <input
                id="modal-dish-tags"
                type="text"
                placeholder="Tsukemen, Ajitama, Chashu"
                value={dishTagsStr}
                onChange={(e) => setDishTagsStr(e.target.value)}
                className="w-full rounded-xl border border-[#025259]/20 bg-[#FDF8F0] p-2.5 text-[#025259] placeholder-stone-400 focus:border-[#ff947a] focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="modal-photo-url" className="block text-[#025259] font-bold mb-1">Food Photo Image URL</label>
              <input
                id="modal-photo-url"
                type="text"
                placeholder="https://images.unsplash.com/..."
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                className="w-full rounded-xl border border-[#025259]/20 bg-[#FDF8F0] p-2.5 text-[#025259] placeholder-stone-400 focus:border-[#ff947a] focus:outline-none"
              />
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
              Save Visit to Timeline
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
