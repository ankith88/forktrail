'use client';

import React, { useState } from 'react';
import { Trip } from '@/types';
import { getLocalDateString } from '@/lib/utils';
import { X, Compass, Calendar, MapPin, Image as ImageIcon } from 'lucide-react';

interface CreateTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTrip: (trip: Trip) => void;
}

export function CreateTripModal({ isOpen, onClose, onCreateTrip }: CreateTripModalProps) {
  const [categoryType, setCategoryType] = useState<'trip' | 'hometown_log'>('trip');
  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState(() => getLocalDateString());
  const [endDate, setEndDate] = useState(() => getLocalDateString(new Date(Date.now() + 86400000 * 5)));
  const [coverUrl, setCoverUrl] = useState('https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80');
  const [summary, setSummary] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !destination.trim()) return;

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const newTrip: Trip = {
      id: `trip_${Date.now()}`,
      userId: 'user_active',
      title,
      slug: slug || `trip-${Date.now()}`,
      destination,
      startDate,
      endDate: categoryType === 'hometown_log' ? 'Ongoing' : endDate,
      coverUrl: coverUrl || 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
      summary: summary || (categoryType === 'hometown_log' 
        ? `My personal hometown food journal exploring dining spots in ${destination}.`
        : `A culinary journey exploring the best food, markets, and tasting spots in ${destination}.`),
      visibility: 'public',
      createdAt: new Date().toISOString(),
      categoryType,
      isHometown: categoryType === 'hometown_log',
    };

    onCreateTrip(newTrip);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto font-sans">
      <div className="relative w-full max-w-lg rounded-3xl border border-[#025259]/20 bg-[#FFFFFF] p-6 shadow-2xl space-y-5 text-[#025259]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#025259]/15 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ff947a] text-[#025259] shadow-sm">
              <Compass className="h-5 w-5 stroke-[2.5]" />
            </div>
            <h2 className="text-base font-bold text-[#025259]">Create New Food Story Journal</h2>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-[#025259]">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Story Container Type Selector */}
          <div>
            <label className="block text-[#025259] font-bold mb-1.5">Log / Story Type</label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setCategoryType('trip');
                  if (!title || title.includes('Hometown Food Log')) setTitle('Tokyo Ramen & Sushi Tour');
                }}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all text-center ${
                  categoryType === 'trip'
                    ? 'border-[#ff947a] bg-[#ff947a]/15 text-[#025259] font-bold shadow-sm'
                    : 'border-[#025259]/15 bg-[#FDF8F0] text-stone-600 hover:bg-[#025259]/5'
                }`}
              >
                <span className="text-base mb-0.5">✈️ Travel Trip</span>
                <span className="text-[10px] text-stone-500 font-normal">Multi-day vacation itinerary</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCategoryType('hometown_log');
                  if (!title || title.includes('Tokyo')) setTitle('My Hometown Eats & Local Gems');
                }}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all text-center ${
                  categoryType === 'hometown_log'
                    ? 'border-[#ff947a] bg-[#ff947a]/15 text-[#025259] font-bold shadow-sm'
                    : 'border-[#025259]/15 bg-[#FDF8F0] text-stone-600 hover:bg-[#025259]/5'
                }`}
              >
                <span className="text-base mb-0.5">🏠 Hometown Food Log</span>
                <span className="text-[10px] text-stone-500 font-normal">Ongoing local dining journal</span>
              </button>
            </div>
          </div>

          {/* Trip Title & Destination */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="create-trip-title" className="block text-[#025259] font-bold mb-1">
                {categoryType === 'hometown_log' ? 'Journal Title' : 'Trip Title'}
              </label>
              <input
                id="create-trip-title"
                type="text"
                required
                placeholder={categoryType === 'hometown_log' ? 'e.g. My Hometown Eats' : 'e.g. Tokyo Ramen Tour'}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-[#025259]/20 bg-[#FDF8F0] p-2.5 text-[#025259] focus:border-[#ff947a] focus:outline-none font-medium"
              />
            </div>
            <div>
              <label htmlFor="create-trip-destination" className="block text-[#025259] font-bold mb-1">
                {categoryType === 'hometown_log' ? 'Hometown / City' : 'Destination / City'}
              </label>
              <input
                id="create-trip-destination"
                type="text"
                required
                placeholder={categoryType === 'hometown_log' ? 'e.g. Austin, TX' : 'e.g. Tokyo, Japan'}
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full rounded-xl border border-[#025259]/20 bg-[#FDF8F0] p-2.5 text-[#025259] focus:border-[#ff947a] focus:outline-none font-medium"
              />
            </div>
          </div>

          {/* Dates */}
          {categoryType === 'trip' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="create-trip-start-date" className="block text-[#025259] font-bold mb-1">Start Date</label>
                <input
                  id="create-trip-start-date"
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-xl border border-[#025259]/20 bg-[#FDF8F0] p-2.5 text-[#025259] font-medium"
                />
              </div>
              <div>
                <label htmlFor="create-trip-end-date" className="block text-[#025259] font-bold mb-1">End Date</label>
                <input
                  id="create-trip-end-date"
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-xl border border-[#025259]/20 bg-[#FDF8F0] p-2.5 text-[#025259] font-medium"
                />
              </div>
            </div>
          ) : (
            <div>
              <label htmlFor="create-trip-start-date" className="block text-[#025259] font-bold mb-1">Journal Started Date</label>
              <input
                id="create-trip-start-date"
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-xl border border-[#025259]/20 bg-[#FDF8F0] p-2.5 text-[#025259] font-medium"
              />
              <p className="text-[10px] text-stone-500 mt-1">Hometown logs are ongoing — visits are grouped by month & year.</p>
            </div>
          )}

          {/* Cover Photo */}
          <div>
            <label htmlFor="create-trip-cover" className="block text-[#025259] font-bold mb-1">Cover Image URL</label>
            <input
              id="create-trip-cover"
              type="text"
              placeholder="https://images.unsplash.com/photo-..."
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
              className="w-full rounded-xl border border-[#025259]/20 bg-[#FDF8F0] p-2.5 text-[#025259] focus:border-[#ff947a] focus:outline-none"
            />
          </div>

          {/* Summary */}
          <div>
            <label htmlFor="create-trip-summary" className="block text-[#025259] font-bold mb-1">Journal Description / Vibe</label>
            <textarea
              id="create-trip-summary"
              rows={3}
              placeholder={categoryType === 'hometown_log' ? 'Favorite local brunch spots, coffee roasters, and dinner gems in my home city...' : 'Exploring ramen alleys, outer markets, coffee roasteries, and izakayas...'}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full rounded-xl border border-[#025259]/20 bg-[#FDF8F0] p-2.5 text-[#025259] focus:border-[#ff947a] focus:outline-none"
            />
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
              {categoryType === 'hometown_log' ? 'Create Hometown Log' : 'Create Trip & Start Diary'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
