'use client';

import React, { useState, useEffect } from 'react';
import { VisitedPlace } from '@/types';
import {
  X,
  BookOpen,
  Sparkles,
  Edit3,
  Check,
  Copy,
  Share2,
  Loader2,
  Star,
  MapPin,
  Calendar,
  Utensils,
  RefreshCw,
  FileText,
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';

interface VisitStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  visit: VisitedPlace | null;
  onSaveStory: (visitId: string, storyText: string) => void;
}

export function VisitStoryModal({ isOpen, onClose, visit, onSaveStory }: VisitStoryModalProps) {
  const [storyText, setStoryText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<'bourdain' | 'michelin' | 'memoir' | 'foodie_vlog' | 'poetic'>('bourdain');
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (visit) {
      setStoryText(visit.story || '');
      setIsEditing(false);
      setSavedSuccess(false);
    }
  }, [visit, isOpen]);

  if (!isOpen || !visit) return null;

  const handleGenerateStory = async (overrideStyle?: 'bourdain' | 'michelin' | 'memoir' | 'foodie_vlog' | 'poetic') => {
    const styleToUse = overrideStyle || selectedStyle;
    if (overrideStyle) setSelectedStyle(overrideStyle);
    setIsGenerating(true);

    try {
      const res = await fetch('/api/ai/generate-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visit,
          style: styleToUse,
        }),
      });

      const data = await res.json();
      if (data.success && data.story) {
        setStoryText(data.story);
      }
    } catch (err) {
      console.error('Error generating visit story:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    onSaveStory(visit.id, storyText);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
    }, 2000);
  };

  const handleCopy = () => {
    if (typeof window !== 'undefined') {
      const textToCopy = `📖 VISITED STORY: ${visit.name}\n${visit.address} • ${visit.category}\n\n${storyText}`;
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const coverPhotoUrl = visit.photoUrls?.[0] || 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80';
  const visitDateStr = visit.localDate || (visit.visitTime ? visit.visitTime.split('T')[0] : '');

  const styleOptions: { id: 'bourdain' | 'michelin' | 'memoir' | 'foodie_vlog' | 'poetic'; label: string; desc: string }[] = [
    { id: 'bourdain', label: '🍷 Bourdain Travelogue', desc: 'Evocative, raw & soulful narrative' },
    { id: 'michelin', label: '⭐️ Michelin Review', desc: 'Refined inspector evaluation' },
    { id: 'memoir', label: '📖 Culinary Memoir', desc: 'Warm personal nostalgia & story' },
    { id: 'foodie_vlog', label: '🔥 Foodie Vlog', desc: 'Vibrant modern food review' },
    { id: 'poetic', label: '🌙 Poetic & Sensory', desc: 'Atmospheric sensory prose' },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-3xl border border-[#025259]/30 bg-[#FFFFFF] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Cover Photo Header Backdrop */}
        <div className="relative h-44 sm:h-52 w-full shrink-0 overflow-hidden bg-stone-900">
          <img src={coverPhotoUrl} alt={visit.name} className="h-full w-full object-cover brightness-[0.75]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/80 transition"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="absolute bottom-4 inset-x-4 sm:inset-x-6 text-white space-y-1">
            <div className="flex items-center gap-2 text-xs text-[#ff947a] font-bold">
              <BookOpen className="h-4 w-4" />
              <span>Visit Capture Story</span>
              {visit.occasion && (
                <span className="bg-[#ff947a] text-[#025259] px-2 py-0.5 rounded-md font-extrabold text-[10px] uppercase">
                  ✨ {visit.occasion.replace('_', ' ')}
                </span>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">{visit.name}</h2>
            <div className="flex flex-wrap items-center gap-3 text-xs text-stone-200">
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-[#ff947a]" /> {visit.address}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-[#E3A857] font-bold">
                <Star className="h-3.5 w-3.5 fill-[#E3A857]" /> {visit.rating}.0 / 5
              </span>
              {visitDateStr && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-[#ff947a]" /> {formatDate(visitDateStr)}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Scrollable Story Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          
          {/* AI Style Toolbar */}
          <div className="rounded-2xl border border-[#025259]/15 bg-[#FAF3E7]/60 p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#025259] flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-[#ff947a]" /> AI Narrative Style Presets
              </span>
              <button
                type="button"
                onClick={() => handleGenerateStory()}
                disabled={isGenerating}
                className="flex items-center gap-1.5 rounded-xl bg-[#ff947a] px-3 py-1.5 text-xs font-bold text-[#025259] hover:bg-[#f08368] transition shadow-sm disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Writing Story...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>{storyText ? 'Regenerate Story' : 'Write Story with AI'}</span>
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {styleOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleGenerateStory(opt.id)}
                  disabled={isGenerating}
                  className={cn(
                    "p-2 rounded-xl border text-left text-xs transition font-semibold",
                    selectedStyle === opt.id
                      ? "bg-[#025259] text-white border-[#025259] shadow-sm"
                      : "bg-white text-[#025259] border-[#025259]/15 hover:bg-[#FDF8F0]"
                  )}
                >
                  <p className="font-bold text-[11px] truncate">{opt.label}</p>
                  <p className={cn("text-[9px] truncate mt-0.5", selectedStyle === opt.id ? "text-stone-200" : "text-stone-500")}>
                    {opt.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Story Body Display or Editor */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#025259] uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-[#ff947a]" /> Written Narrative
              </span>
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-1 text-xs font-bold text-[#025259] hover:text-[#ff947a] underline"
              >
                <Edit3 className="h-3.5 w-3.5" />
                {isEditing ? 'Preview Story' : 'Edit Story Text'}
              </button>
            </div>

            {isEditing ? (
              <textarea
                rows={8}
                value={storyText}
                onChange={(e) => setStoryText(e.target.value)}
                placeholder="Write your custom story narrative for this visit capture..."
                className="w-full rounded-2xl border border-[#025259]/20 bg-[#FDF8F0] p-4 text-xs sm:text-sm text-[#025259] leading-relaxed focus:border-[#ff947a] focus:outline-none transition"
              />
            ) : storyText ? (
              <div className="rounded-2xl border border-[#025259]/15 bg-[#FDF8F0] p-4 sm:p-5 text-xs sm:text-sm text-[#025259] leading-relaxed space-y-3 font-serif">
                {storyText.split('\n\n').map((paragraph, idx) => (
                  <p key={idx} className="first-letter:text-xl first-letter:font-bold first-letter:text-[#ff947a]">
                    {paragraph}
                  </p>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-[#025259]/20 p-8 text-center bg-[#FDF8F0]/40 space-y-2">
                <BookOpen className="mx-auto h-8 w-8 text-[#025259]/40" />
                <p className="text-xs font-bold text-[#025259]">No written story created yet for this visit.</p>
                <p className="text-[11px] text-stone-500 max-w-xs mx-auto">
                  Click "Write Story with AI" above to generate a custom travelogue or write your own memories.
                </p>
                <button
                  type="button"
                  onClick={() => handleGenerateStory()}
                  disabled={isGenerating}
                  className="mt-2 inline-flex items-center gap-1.5 rounded-xl bg-[#ff947a] px-4 py-2 text-xs font-bold text-[#025259] hover:bg-[#f08368] transition shadow"
                >
                  <Sparkles className="h-4 w-4" />
                  Generate Visit Story
                </button>
              </div>
            )}
          </div>

          {/* Dish Highlights & Tasting Notes Card */}
          {visit.recommendedDish && (
            <div className="rounded-xl border border-[#025259]/15 bg-white p-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Utensils className="h-4 w-4 text-[#ff947a]" />
                <span className="font-bold text-[#025259]">Must Order Dish:</span>
                <span className="text-stone-700">{visit.recommendedDish}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Controls */}
        <div className="flex-none bg-[#FFFFFF] border-t border-[#025259]/15 px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between gap-2 shadow-xs">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-xl border border-[#025259]/20 bg-[#FDF8F0] px-3.5 py-2 text-xs font-bold text-[#025259] hover:bg-[#FAF3E7] transition"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
            <span>{copied ? 'Copied to Clipboard' : 'Copy Story'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[#025259]/20 px-4 py-2 text-xs font-bold text-[#025259] hover:bg-[#FDF8F0] transition"
            >
              Close
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 rounded-xl bg-[#ff947a] px-5 py-2 text-xs font-bold text-[#025259] hover:bg-[#f08368] transition shadow-md"
            >
              {savedSuccess ? <Check className="h-4 w-4" /> : <BookOpen className="h-4 w-4" />}
              <span>{savedSuccess ? 'Story Saved!' : 'Save Story'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
