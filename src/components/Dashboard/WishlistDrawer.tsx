'use client';

import React, { useState } from 'react';
import { WishlistItem } from '@/types';
import { X, Search, Heart, MapPin, Plus, CheckCircle2, Star, Tag, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  wishlistItems: WishlistItem[];
  onAddWishlistItem: (item: Partial<WishlistItem>) => void;
  onConvertToVisited: (item: WishlistItem) => void;
  onRemoveWishlistItem: (id: string) => void;
}

export function WishlistDrawer({
  isOpen,
  onClose,
  wishlistItems,
  onAddWishlistItem,
  onConvertToVisited,
  onRemoveWishlistItem,
}: WishlistDrawerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedPlaceForWishlist, setSelectedPlaceForWishlist] = useState<any | null>(null);
  const [wishlistNotes, setWishlistNotes] = useState('');
  const [priority, setPriority] = useState<'must-try' | 'if-time' | 'backup'>('must-try');

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch(`/api/places/search?query=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (data.success && data.places) {
        setSearchResults(data.places);
      }
    } catch (err) {
      console.error('Failed to search places:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSaveToWishlist = (place: any) => {
    onAddWishlistItem({
      placeId: place.placeId,
      name: place.name,
      address: place.address,
      lat: place.lat,
      lng: place.lng,
      notes: wishlistNotes || 'Bookmarked from Google Places search',
      category: place.category || 'Restaurant',
      priority,
      photoUrl: place.photoUrl,
    });

    setSelectedPlaceForWishlist(null);
    setWishlistNotes('');
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-sm">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FDF8F0] border-l border-[#025259]/20 shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="p-5 border-b border-[#013b40] bg-[#025259] text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ff947a] text-[#025259]">
                <Heart className="h-5 w-5 fill-[#025259]/20" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Want to Visit Wishlist</h2>
                <p className="text-xs text-[#FAF3E7]">Save dining spots for future trips</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-white/80 hover:bg-[#03717b] hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            
            {/* Search Box */}
            <form onSubmit={handleSearch} className="space-y-3">
              <label htmlFor="wishlist-search" className="block text-xs font-bold text-[#025259]">
                Search & Bookmark Future Dining Spots
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#025259]/50" />
                <input
                  id="wishlist-search"
                  type="text"
                  placeholder="Search ramen, omakase, gelato, venue name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-[#025259]/20 bg-[#FFFFFF] pl-9 pr-20 py-2 text-xs text-[#025259] placeholder-stone-400 focus:border-[#ff947a] focus:outline-none focus:ring-1 focus:ring-[#ff947a] transition shadow-sm"
                />
                <button
                  type="submit"
                  disabled={isSearching}
                  className="absolute right-1.5 top-1.5 rounded-lg bg-[#025259] px-3 py-1 text-xs font-bold text-white hover:bg-[#03717b] transition shadow-sm"
                >
                  {isSearching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Search'}
                </button>
              </div>
            </form>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="space-y-2 border-b border-[#025259]/15 pb-5">
                <h4 className="text-xs font-bold text-[#025259] uppercase tracking-wider">Search Results</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {searchResults.map((place) => (
                    <div key={place.placeId} className="bg-[#FFFFFF] border border-[#025259]/15 p-3 rounded-xl flex items-center justify-between text-xs shadow-sm">
                      <div>
                        <p className="font-semibold text-[#025259]">{place.name}</p>
                        <p className="text-[11px] text-stone-500 truncate max-w-[200px]">{place.address}</p>
                      </div>
                      <button
                        onClick={() => setSelectedPlaceForWishlist(place)}
                        className="flex items-center gap-1 rounded-lg bg-[#ff947a] text-[#025259] px-2.5 py-1 text-[11px] font-bold hover:bg-[#f08368] transition shadow-sm"
                      >
                        <Plus className="h-3 w-3" /> Save
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Save Form Dialog when spot selected */}
            {selectedPlaceForWishlist && (
              <div className="p-4 rounded-xl border border-[#ff947a] bg-[#FFFFFF] shadow-md space-y-3">
                <h4 className="text-xs font-bold text-[#025259]">Save "{selectedPlaceForWishlist.name}"</h4>
                <div>
                  <label htmlFor="wishlist-notes" className="block text-[11px] text-[#025259] font-medium mb-1">Personal Tasting Notes / Tips</label>
                  <textarea
                    id="wishlist-notes"
                    rows={2}
                    value={wishlistNotes}
                    onChange={(e) => setWishlistNotes(e.target.value)}
                    placeholder="Must try the special pork tsukemen, line forms at 11am..."
                    className="w-full rounded-lg border border-[#025259]/20 bg-[#FDF8F0] p-2 text-xs text-[#025259] focus:border-[#ff947a] focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="priority-select" className="block text-[11px] text-[#025259] font-medium mb-1">Priority</label>
                  <select
                    id="priority-select"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full rounded-lg border border-[#025259]/20 bg-[#FDF8F0] p-2 text-xs text-[#025259]"
                  >
                    <option value="must-try">🔥 Must Try</option>
                    <option value="if-time">✨ If Time Permits</option>
                    <option value="backup">📌 Backup Option</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setSelectedPlaceForWishlist(null)}
                    className="text-xs text-stone-500 px-3 py-1 hover:text-[#025259]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSaveToWishlist(selectedPlaceForWishlist)}
                    className="text-xs bg-[#025259] text-white font-bold px-3 py-1 rounded-lg hover:bg-[#03717b] transition shadow"
                  >
                    Confirm Bookmark
                  </button>
                </div>
              </div>
            )}

            {/* Saved Wishlist List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-[#025259]">
                <span className="font-bold">Bookmarked Spots ({wishlistItems.length})</span>
                <span className="text-[11px] font-semibold text-[#ff947a]">1-Click Convert to Visited</span>
              </div>

              {wishlistItems.length === 0 ? (
                <p className="text-xs text-stone-500 italic text-center py-6">
                  No spots saved to wishlist yet. Use search above to bookmark venues!
                </p>
              ) : (
                wishlistItems.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-[#025259]/15 bg-[#FFFFFF] p-4 space-y-2.5 hover:border-[#ff947a] transition group shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className={cn(
                          "inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border mb-1",
                          item.priority === 'must-try'
                            ? "bg-[#ff947a]/20 text-[#025259] border-[#ff947a]/40"
                            : "bg-[#025259]/10 text-[#025259] border-[#025259]/20"
                        )}>
                          {item.priority}
                        </span>
                        <h4 className="font-bold text-sm text-[#025259] group-hover:text-[#ff947a] transition">
                          {item.name}
                        </h4>
                        <p className="text-xs text-stone-600 flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3 text-[#ff947a] shrink-0" />
                          <span className="truncate">{item.address}</span>
                        </p>
                      </div>

                      <button
                        onClick={() => onRemoveWishlistItem(item.id)}
                        className="text-stone-400 hover:text-rose-600 text-xs p-1"
                        title="Remove from Wishlist"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    {item.notes && (
                      <p className="text-xs text-[#025259] bg-[#FDF8F0] p-2.5 rounded-lg border border-[#025259]/10 italic">
                        "{item.notes}"
                      </p>
                    )}

                    {/* Convert Button */}
                    <button
                      onClick={() => onConvertToVisited(item)}
                      className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#ff947a] py-1.5 text-xs font-bold text-[#025259] hover:bg-[#f08368] transition shadow-sm"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Convert to Logged Visit
                    </button>
                  </div>
                ))
              )}
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
