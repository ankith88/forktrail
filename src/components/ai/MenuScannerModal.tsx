'use client';

import React, { useState, useRef } from 'react';
import { DecodedDish } from '@/types';
import { X, Camera, Upload, Search, Sparkles, AlertTriangle, Star, Plus, Heart, Check, Loader2, Utensils } from 'lucide-react';
import { cn } from '@/lib/utils';

import { LoadingScreen } from '@/components/ui/LoadingScreen';

interface MenuScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddDishToVisit: (dish: DecodedDish) => void;
  onAddDishToWishlist: (dish: DecodedDish) => void;
}

export function MenuScannerModal({
  isOpen,
  onClose,
  onAddDishToVisit,
  onAddDishToWishlist,
}: MenuScannerModalProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDecoding, setIsDecoding] = useState(false);
  const [decodedDishes, setDecodedDishes] = useState<DecodedDish[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [allergenFilter, setAllergenFilter] = useState<string>('all');
  const [addedLogs, setAddedLogs] = useState<Record<string, boolean>>({});
  const [addedWishlist, setAddedWishlist] = useState<Record<string, boolean>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setImagePreview(base64);
      processMenuImage(base64, file.type);
    };
    reader.readAsDataURL(file);
  };

  const processMenuImage = async (base64: string, mimeType: string) => {
    setIsDecoding(true);
    setDecodedDishes([]);
    try {
      const res = await fetch('/api/ai/decode-menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, mimeType }),
      });
      const data = await res.json();
      if (data.success && data.dishes) {
        setDecodedDishes(data.dishes);
      }
    } catch (err) {
      console.error('Failed to decode menu photo:', err);
    } finally {
      setIsDecoding(false);
    }
  };

  // Demo scan trigger when opening without image
  const handleRunDemoScan = () => {
    const demoBase64 = 'data:image/jpeg;base64,demo';
    setImagePreview('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80');
    processMenuImage(demoBase64, 'image/jpeg');
  };

  const filteredDishes = decodedDishes.filter((dish) => {
    const matchesSearch =
      dish.originalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dish.translatedName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dish.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dish.ingredients.some((i) => i.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (allergenFilter === 'specialty') return dish.isSpecialty;
    if (allergenFilter === 'gluten-free') return !dish.allergens.map((a) => a.toLowerCase()).includes('gluten');
    if (allergenFilter === 'dairy-free') return !dish.allergens.map((a) => a.toLowerCase()).includes('dairy');
    if (allergenFilter === 'nut-free') return !dish.allergens.map((a) => a.toLowerCase()).includes('nuts');

    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#FDF8F0] rounded-3xl border border-[#025259]/20 shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-5 bg-[#025259] text-white flex items-center justify-between border-b border-[#013b40]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ff947a] text-[#025259] shadow">
              <Camera className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Menu Photo Translator & Dish Decoder
                <span className="rounded-full bg-[#ff947a]/20 px-2.5 py-0.5 text-[10px] font-bold text-[#ff947a] border border-[#ff947a]/40 uppercase tracking-wider">
                  Gemini Vision AI
                </span>
              </h2>
              <p className="text-xs text-[#FAF3E7]">Translate non-native menus, extract ingredients & flag allergens instantly</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-white/80 hover:bg-[#03717b] hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Top Control Bar: Upload / Camera / Demo */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#FFFFFF] border border-[#025259]/15 shadow-sm">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 rounded-xl bg-[#025259] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#013b40] transition shadow"
              >
                <Upload className="h-4 w-4 text-[#ff947a]" />
                <span>Upload Menu Photo</span>
              </button>
              <button
                onClick={handleRunDemoScan}
                className="flex items-center gap-2 rounded-xl border border-[#ff947a] bg-[#ff947a]/15 px-4 py-2.5 text-xs font-bold text-[#025259] hover:bg-[#ff947a] transition shadow-sm"
              >
                <Sparkles className="h-4 w-4 text-[#ff947a]" />
                <span>Try Sample Menu Scan</span>
              </button>
            </div>

            {imagePreview && (
              <div className="flex items-center gap-3">
                <img
                  src={imagePreview}
                  alt="Menu Preview"
                  className="h-12 w-16 object-cover rounded-lg border border-[#025259]/20 shadow"
                />
                <span className="text-xs text-stone-600 font-medium">Menu photo loaded</span>
              </div>
            )}
          </div>

          {/* Loading State */}
          {isDecoding && (
            <div className="rounded-2xl border border-[#025259]/20 bg-[#FFFFFF] p-8 text-center shadow-sm">
              <LoadingScreen
                size="md"
                text="Decoding Menu with AI Vision..."
                subtext="Extracting dish names, translating foreign characters, & cross-checking food allergens"
              />
            </div>
          )}

          {/* Decoded Menu Results */}
          {!isDecoding && decodedDishes.length > 0 && (
            <div className="space-y-4">
              
              {/* Search & Filter bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search dishes or ingredients..."
                    className="w-full rounded-xl border border-[#025259]/20 bg-[#FFFFFF] pl-9 pr-4 py-2 text-xs font-medium focus:border-[#ff947a] focus:outline-none shadow-sm"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
                  {[
                    { key: 'all', label: 'All Dishes' },
                    { key: 'specialty', label: '★ House Specialties' },
                    { key: 'gluten-free', label: 'Gluten-Free' },
                    { key: 'dairy-free', label: 'Dairy-Free' },
                  ].map((filter) => (
                    <button
                      key={filter.key}
                      onClick={() => setAllergenFilter(filter.key)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-xs font-bold transition',
                        allergenFilter === filter.key
                          ? 'bg-[#025259] text-white shadow'
                          : 'bg-[#FFFFFF] text-[#025259] border border-[#025259]/15 hover:bg-[#FAF3E7]'
                      )}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dish Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredDishes.map((dish, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border border-[#025259]/15 bg-[#FFFFFF] p-5 shadow-sm hover:shadow-md transition space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-[#025259] leading-tight">
                              {dish.translatedName}
                            </h3>
                            {dish.isSpecialty && (
                              <span className="flex items-center gap-1 rounded-md bg-[#ff947a]/20 border border-[#ff947a]/40 px-2 py-0.5 text-[10px] font-bold text-[#025259]">
                                <Star className="h-3 w-3 fill-[#ff947a] text-[#ff947a]" /> Specialty
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-stone-500 font-medium italic mt-0.5">
                            {dish.originalName}
                          </p>
                        </div>
                        <span className="text-xs font-bold text-[#025259] bg-[#FAF3E7] px-2.5 py-1 rounded-lg border border-[#025259]/10">
                          {dish.price}
                        </span>
                      </div>

                      <p className="text-xs text-stone-700 leading-relaxed">{dish.description}</p>

                      {/* Ingredients */}
                      <div className="flex flex-wrap gap-1">
                        {dish.ingredients.map((ing, iIdx) => (
                          <span
                            key={iIdx}
                            className="rounded-md bg-stone-100 text-stone-700 px-2 py-0.5 text-[10px] font-medium"
                          >
                            {ing}
                          </span>
                        ))}
                      </div>

                      {/* Allergens Warning */}
                      {dish.allergens.length > 0 && (
                        <div className="flex items-center gap-1.5 pt-1 text-[11px] text-amber-800 font-semibold">
                          <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                          <span>Contains Allergens: {dish.allergens.join(', ')}</span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 pt-2 border-t border-stone-100">
                      <button
                        onClick={() => {
                          onAddDishToVisit(dish);
                          setAddedLogs((prev) => ({ ...prev, [idx]: true }));
                        }}
                        className={cn(
                          'flex-1 flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition shadow-sm',
                          addedLogs[idx]
                            ? 'bg-emerald-600 text-white'
                            : 'bg-[#ff947a] text-[#025259] hover:bg-[#f08368]'
                        )}
                      >
                        {addedLogs[idx] ? (
                          <>
                            <Check className="h-3.5 w-3.5" /> Logged Dish
                          </>
                        ) : (
                          <>
                            <Plus className="h-3.5 w-3.5" /> Log Dish
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => {
                          onAddDishToWishlist(dish);
                          setAddedWishlist((prev) => ({ ...prev, [idx]: true }));
                        }}
                        className={cn(
                          'flex items-center gap-1 rounded-xl border px-3 py-2 text-xs font-bold transition',
                          addedWishlist[idx]
                            ? 'bg-rose-50 border-rose-300 text-rose-700'
                            : 'border-[#025259]/20 bg-[#FDF8F0] text-[#025259] hover:bg-[#FAF3E7]'
                        )}
                      >
                        <Heart
                          className={cn(
                            'h-3.5 w-3.5',
                            addedWishlist[idx] ? 'fill-rose-600 text-rose-600' : 'text-[#025259]'
                          )}
                        />
                        <span>{addedWishlist[idx] ? 'Saved' : 'Wishlist'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!isDecoding && decodedDishes.length === 0 && (
            <div className="rounded-2xl border border-dashed border-[#025259]/20 bg-[#FFFFFF] p-12 text-center space-y-3">
              <Utensils className="h-10 w-10 text-[#025259]/40 mx-auto" />
              <h4 className="text-base font-bold text-[#025259]">No Menu Analyzed Yet</h4>
              <p className="text-xs text-stone-500 max-w-md mx-auto">
                Upload a photo of any printed restaurant menu (or click "Try Sample Menu Scan") to decode dish names, ingredients, price estimates, and allergen warnings.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
