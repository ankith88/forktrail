'use client';

import React, { useState } from 'react';
import { Trip } from '@/types';
import { X, Compass, Calendar, MapPin, Image as ImageIcon } from 'lucide-react';

interface CreateTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTrip: (trip: Trip) => void;
}

export function CreateTripModal({ isOpen, onClose, onCreateTrip }: CreateTripModalProps) {
  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0]);
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
      endDate,
      coverUrl: coverUrl || 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
      summary: summary || `A culinary journey exploring the best food, markets, and tasting spots in ${destination}.`,
      visibility: 'public',
      createdAt: new Date().toISOString(),
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
            <h2 className="text-base font-bold text-[#025259]">Start New Culinary Trip</h2>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-[#025259]">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Trip Title & Destination */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="create-trip-title" className="block text-[#025259] font-bold mb-1">Trip Title</label>
              <input
                id="create-trip-title"
                type="text"
                required
                placeholder="e.g. Tokyo Ramen & Sushi Tour"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-[#025259]/20 bg-[#FDF8F0] p-2.5 text-[#025259] focus:border-[#ff947a] focus:outline-none font-medium"
              />
            </div>
            <div>
              <label htmlFor="create-trip-destination" className="block text-[#025259] font-bold mb-1">Destination / City</label>
              <input
                id="create-trip-destination"
                type="text"
                required
                placeholder="e.g. Tokyo, Japan"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full rounded-xl border border-[#025259]/20 bg-[#FDF8F0] p-2.5 text-[#025259] focus:border-[#ff947a] focus:outline-none font-medium"
              />
            </div>
          </div>

          {/* Dates */}
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
            <label htmlFor="create-trip-summary" className="block text-[#025259] font-bold mb-1">Trip Summary / Vibe</label>
            <textarea
              id="create-trip-summary"
              rows={3}
              placeholder="Exploring ramen alleys, outer markets, coffee roasteries, and izakayas..."
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
              Create Trip & Start Diary
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
