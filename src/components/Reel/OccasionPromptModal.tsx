'use client';

import React, { useState } from 'react';
import { Sparkles, X, Heart, Cake, Utensils, Compass, Wine, Flame, Send } from 'lucide-react';

interface OccasionPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (occasionPrompt: string) => void;
  isGenerating?: boolean;
}

const PRESET_OCCASIONS = [
  { label: '🥂 5th Anniversary Dinner', prompt: 'Our 5th Anniversary romantic candlelight dinner with wine pairing and fine dining delicacies.' },
  { label: '🎂 Birthday Feast Celebration', prompt: 'Ultimate Birthday culinary feast with signature dishes, drinks, and joyful group moments.' },
  { label: '✨ Romantic Date Night', prompt: 'Cozy romantic date night exploring intimate hidden dining gems and handcrafted cocktails.' },
  { label: '🍜 High-Energy Foodie Crawl', prompt: 'Epic street food and izakaya crawl sampling local favorites and vibrant night market flavors.' },
  { label: '🍷 Fine Dining & Wine Pairing', prompt: 'Artisanal gastronomy tasting menu showcasing exquisite textures and sommelier wine pairings.' },
];

export function OccasionPromptModal({ isOpen, onClose, onGenerate, isGenerating }: OccasionPromptModalProps) {
  const [customPrompt, setCustomPrompt] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customPrompt.trim()) {
      onGenerate(customPrompt.trim());
    }
  };

  const handleSelectPreset = (promptText: string) => {
    setCustomPrompt(promptText);
    onGenerate(promptText);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto font-sans">
      <div className="relative w-full max-w-lg rounded-2xl border border-[#ff947a]/40 bg-[#FFFFFF] p-6 shadow-2xl space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#025259]/15 pb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ff947a] text-[#025259] shadow-md">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#025259]">AI Occasion Story Generator</h3>
              <p className="text-xs text-stone-500">Provide an initial prompt to craft a custom 30s Story Reel</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-stone-400 hover:bg-[#FDF8F0] hover:text-[#025259] transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Custom Prompt Input */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="block text-xs font-bold text-[#025259]">
            Describe the Occasion or Experience Prompt:
          </label>
          <textarea
            rows={3}
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="e.g. Our 5th Anniversary dinner at Le Bernardin with champagne toast, wagyu beef, and romantic candle lights..."
            className="w-full rounded-xl border border-[#025259]/20 bg-[#FDF8F0] p-3 text-xs text-[#025259] placeholder-stone-400 focus:border-[#ff947a] focus:outline-none focus:ring-1 focus:ring-[#ff947a] transition"
          />

          <button
            type="submit"
            disabled={!customPrompt.trim() || isGenerating}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#ff947a] py-2.5 text-xs font-bold text-[#025259] hover:bg-[#f08368] transition shadow-md disabled:opacity-50"
          >
            <Sparkles className="h-4 w-4" />
            {isGenerating ? 'Generating 30s AI Story...' : 'Generate 30-Second AI Story Reel'}
          </button>
        </form>

        {/* Quick Presets */}
        <div className="space-y-2 pt-2 border-t border-[#025259]/10">
          <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Or choose a preset theme:</p>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {PRESET_OCCASIONS.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPreset(item.prompt)}
                disabled={isGenerating}
                className="w-full text-left p-2.5 rounded-xl border border-[#025259]/10 bg-[#FAF3E7] hover:bg-[#ff947a]/20 hover:border-[#ff947a] transition text-xs flex items-center justify-between group"
              >
                <span className="font-bold text-[#025259]">{item.label}</span>
                <Send className="h-3.5 w-3.5 text-[#025259]/40 group-hover:text-[#025259] transition" />
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
