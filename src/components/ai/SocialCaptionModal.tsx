'use client';

import React, { useState, useEffect } from 'react';
import { SocialCaptions, VisitedPlace } from '@/types';
import { X, Share2, Copy, Check, Sparkles, Loader2, BookOpen, Globe, Camera, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SocialCaptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  place?: VisitedPlace | null;
  chapterTitle?: string;
  destinationCity?: string;
}

export function SocialCaptionModal({
  isOpen,
  onClose,
  place,
  chapterTitle,
  destinationCity,
}: SocialCaptionModalProps) {
  const [captions, setCaptions] = useState<SocialCaptions | null>(null);
  const [activeTab, setActiveTab] = useState<'instagram' | 'twitter' | 'substack' | 'bourdain'>('instagram');
  const [copiedTab, setCopiedTab] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      generateCaptions();
    }
  }, [isOpen, place]);

  const generateCaptions = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/ai/social-captions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          placeName: place?.name || 'Local Gourmet Spot',
          category: place?.category || 'Dining Venue',
          rating: place?.rating || 4.8,
          dishTags: place?.dishTags || ['Chef Signature', 'Local Special'],
          reviewNotes: place?.tastingNotes || 'Outstanding culinary experience and memorable atmosphere.',
          destinationCity: destinationCity || 'Tokyo',
          chapterTitle: chapterTitle || 'Day 1 Exploration',
        }),
      });

      const data = await res.json();
      if (data.captions) {
        setCaptions(data.captions);
      } else {
        setError('Could not generate social captions. Please try again.');
      }
    } catch (err) {
      console.error('Error generating social captions:', err);
      setError('Network error generating social captions.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, tabId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTab(tabId);
    setTimeout(() => setCopiedTab(null), 2000);
  };

  if (!isOpen) return null;

  const currentText = captions ? captions[activeTab] : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-3xl bg-[#FDF8F0] border border-[#025259]/20 shadow-2xl overflow-hidden text-[#025259] max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-[#025259] px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#ff947a] text-[#025259]">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-white">AI Social Caption Studio</h3>
              <p className="text-xs text-[#FAF3E7]">Synthesize dining logs into Instagram, Threads, Substack & Bourdain style prose</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 hover:bg-white/10 text-stone-300 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          
          {/* Format Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#FFFFFF] p-1.5 rounded-2xl border border-[#025259]/15 shadow-sm">
            {[
              { id: 'instagram', label: 'Instagram', icon: Camera },
              { id: 'twitter', label: 'X / Threads', icon: MessageSquare },
              { id: 'substack', label: 'Substack', icon: BookOpen },
              { id: 'bourdain', label: 'Bourdain Style', icon: Globe },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    'flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition',
                    isActive
                      ? 'bg-[#025259] text-white shadow'
                      : 'text-[#025259] hover:bg-[#FAF3E7]'
                  )}
                >
                  <Icon className={cn('h-3.5 w-3.5', isActive ? 'text-[#ff947a]' : 'text-[#025259]')} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Loading state */}
          {isLoading && (
            <div className="rounded-2xl border border-[#025259]/20 bg-[#FFFFFF] p-10 text-center space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-[#ff947a] mx-auto" />
              <h4 className="text-sm font-bold text-[#025259]">Crafting Captions with Gemini...</h4>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Synthesizing venue metadata, tasting notes, ratings, and culinary mood into 4 distinct social voices.
              </p>
            </div>
          )}

          {/* Caption Output Box */}
          {!isLoading && captions && (
            <div className="space-y-3">
              <div className="relative rounded-2xl border border-[#025259]/15 bg-[#FFFFFF] p-5 shadow-inner">
                <textarea
                  readOnly
                  value={currentText}
                  rows={8}
                  className="w-full bg-transparent text-xs text-stone-800 font-sans leading-relaxed focus:outline-none resize-none"
                />

                <div className="flex items-center justify-between pt-3 border-t border-stone-100">
                  <span className="text-[11px] text-stone-400 font-medium">
                    {activeTab === 'twitter' ? `${currentText.length}/280 chars` : 'Formatted & Ready to Post'}
                  </span>

                  <button
                    onClick={() => handleCopy(currentText, activeTab)}
                    className={cn(
                      'flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition shadow-sm',
                      copiedTab === activeTab
                        ? 'bg-emerald-600 text-white'
                        : 'bg-[#ff947a] text-[#025259] hover:bg-[#f08368]'
                    )}
                  >
                    {copiedTab === activeTab ? (
                      <>
                        <Check className="h-4 w-4" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" /> Copy to Clipboard
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
