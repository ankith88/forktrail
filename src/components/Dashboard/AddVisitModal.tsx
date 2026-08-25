'use client';

import React, { useState } from 'react';
import { VisitedPlace, TimelineChapter } from '@/types';
import { X, MapPin, Star, Utensils, Tag } from 'lucide-react';

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

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const dishTags = dishTagsStr
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    onSaveVisit({
      chapterId: chapterId || chapters[0]?.id,
      name,
      address: address || 'Tokyo, Japan',
      category,
      rating,
      priceLevel,
      recommendedDish,
      tastingNotes,
      dishTags: dishTags.length ? dishTags : ['Culinary Spot'],
      visitTime: new Date().toISOString(),
      lat: 35.6875 + (Math.random() - 0.5) * 0.05,
      lng: 139.6972 + (Math.random() - 0.5) * 0.05,
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
          
          {/* Chapter Selector */}
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
