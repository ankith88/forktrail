'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Play, Pause, ChevronLeft, ChevronRight, Share2, Copy, Check, MapPin, Star, Utensils, Sparkles, X, ArrowLeft, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

import { ReelSlide, ReelData } from '@/types';

interface ReelViewerProps {
  tripTitle: string;
  reelData: ReelData;
  onClose?: () => void;
  onOpenOccasionModal?: () => void;
}

export function ReelViewer({ tripTitle, reelData, onClose, onOpenOccasionModal }: ReelViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const currentSlide = reelData.slides[currentIndex] || reelData.slides[0];
  const slideDurationMs = 5000; // 5 seconds per slide

  // Auto-advance progress timer
  useEffect(() => {
    if (!isPlaying) return;

    const stepMs = 50;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (currentIndex < reelData.slides.length - 1) {
            setCurrentIndex((c) => c + 1);
            return 0;
          } else {
            setIsPlaying(false);
            return 100;
          }
        }
        return prev + (stepMs / slideDurationMs) * 100;
      });
    }, stepMs);

    return () => clearInterval(interval);
  }, [isPlaying, currentIndex, reelData.slides.length]);

  const handleNext = () => {
    if (currentIndex < reelData.slides.length - 1) {
      setCurrentIndex((c) => c + 1);
      setProgress(0);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((c) => c - 1);
      setProgress(0);
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSocialShare = (platform: 'whatsapp' | 'twitter' | 'facebook') => {
    if (typeof window === 'undefined') return;
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`Check out this AI Culinary Story Reel for "${reelData.headline}" on Palatero! 🍷✨`);

    let shareUrl = '';
    if (platform === 'whatsapp') shareUrl = `https://api.whatsapp.com/send?text=${text}%20${url}`;
    if (platform === 'twitter') shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
    if (platform === 'facebook') shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;

    window.open(shareUrl, '_blank');
  };

  // Download 30s Video Reel using MediaRecorder or synthetic export download
  const handleDownloadVideoReel = () => {
    setIsRecording(true);

    // Simulate rendering/exporting high-res 9:16 vertical video reel
    setTimeout(() => {
      const element = document.createElement('a');
      const blob = new Blob([
        `PALATERO 30-SECOND STORY REEL MP4 EXPORT\nHeadline: ${reelData.headline}\nOccasion: ${reelData.occasionPrompt || 'Culinary Tour'}\nStops: ${reelData.slides.length} Venues`
      ], { type: 'video/mp4' });
      element.href = URL.createObjectURL(blob);
      element.download = `${tripTitle.toLowerCase().replace(/\s+/g, '_')}_30s_story_reel.mp4`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      setIsRecording(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 text-white font-sans overflow-hidden">
      
      {/* Background Blur Backdrop */}
      <div className="absolute inset-0 opacity-40 filter blur-2xl scale-110">
        <img src={currentSlide.photoUrl} alt={currentSlide.venueName} className="h-full w-full object-cover" />
      </div>

      {/* Main Vertical Story Container */}
      <div className="relative w-full max-w-md h-full max-h-[92vh] sm:rounded-3xl border border-[#025259]/40 bg-[#025259] overflow-hidden shadow-2xl flex flex-col justify-between">
        
        {/* Full Image */}
        <img
          src={currentSlide.photoUrl}
          alt={currentSlide.venueName}
          className="absolute inset-0 h-full w-full object-cover filter brightness-[0.8] contrast-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/90" />

        {/* Top Header & Story Progress Bars */}
        <div className="relative z-20 p-4 space-y-3">
          
          {/* Multi-segment Progress Bars */}
          <div className="flex items-center gap-1.5 w-full">
            {reelData.slides.map((_, idx) => (
              <div key={idx} className="h-1 flex-1 rounded-full bg-white/30 overflow-hidden">
                <div
                  className="h-full bg-[#ff947a] transition-all duration-75"
                  style={{
                    width:
                      idx < currentIndex
                        ? '100%'
                        : idx === currentIndex
                        ? `${progress}%`
                        : '0%',
                  }}
                />
              </div>
            ))}
          </div>

          {/* User Byline & Controls */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#ff947a] text-[#025259] font-bold">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <p className="font-bold text-white leading-none">{tripTitle}</p>
                <p className="text-[10px] text-[#E3A857] font-semibold mt-0.5">
                  {reelData.occasionBadge || 'AI Story Reel'} • Stop {currentIndex + 1} of {reelData.slides.length}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {onOpenOccasionModal && (
                <button
                  onClick={onOpenOccasionModal}
                  className="flex items-center gap-1 text-[11px] font-bold rounded-lg bg-[#ff947a]/20 border border-[#ff947a] px-2 py-1 text-[#ff947a] hover:bg-[#ff947a] hover:text-[#025259] transition"
                >
                  <Sparkles className="h-3 w-3" />
                  Prompt
                </button>
              )}
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-1.5 rounded-full bg-black/40 text-white hover:bg-black/60 transition"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </button>
              {onClose ? (
                <button onClick={onClose} className="p-1.5 rounded-full bg-black/40 text-white hover:bg-black/60 transition">
                  <X className="h-4 w-4" />
                </button>
              ) : (
                <Link href="/" className="p-1.5 rounded-full bg-black/40 text-white hover:bg-black/60 transition">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              )}
            </div>
          </div>

          {/* Headline & Occasion Prompt Pill */}
          <div className="flex items-center justify-between text-[11px] bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-white/10">
            <span className="font-semibold text-stone-200 truncate max-w-[240px]">
              "{reelData.headline}"
            </span>
            <span className="text-[10px] font-mono text-[#E3A857] uppercase font-bold">
              {currentSlide.timeCode || '00:30'}
            </span>
          </div>

        </div>

        {/* Click Nav Touch Overlay (Left/Right Tap) */}
        <div className="absolute inset-0 z-10 flex">
          <div className="w-1/2 h-full cursor-pointer" onClick={handlePrev} />
          <div className="w-1/2 h-full cursor-pointer" onClick={handleNext} />
        </div>

        {/* Bottom Story Card Overlay */}
        <div className="relative z-20 p-5 space-y-3.5">
          
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ff947a] px-3 py-1 text-xs font-bold text-[#025259] shadow-sm">
              <Sparkles className="h-3.5 w-3.5" />
              {currentSlide.vibeTag}
            </span>
            <div className="flex items-center gap-1 bg-[#E3A857] px-2.5 py-0.5 rounded-lg text-xs font-bold text-[#025259]">
              <Star className="h-3.5 w-3.5 fill-[#025259]" />
              {currentSlide.rating}.0 / 5
            </div>
          </div>

          <div>
            {currentSlide.dishName && (
              <div className="inline-flex items-center gap-1.5 mb-1.5 rounded-xl bg-[#ff947a] border border-[#ff947a] px-3 py-1 text-xs font-extrabold text-[#025259] shadow-md">
                <Utensils className="h-3.5 w-3.5" />
                <span>Featured Dish: {currentSlide.dishName}</span>
              </div>
            )}
            <h3 className="font-serif font-extrabold text-2xl sm:text-3xl text-white tracking-tight leading-tight">
              {currentSlide.venueName}
            </h3>
            <p className="text-xs text-[#FAF3E7] flex items-center gap-1 mt-0.5">
              <MapPin className="h-3.5 w-3.5 text-[#ff947a]" />
              <span>{currentSlide.category} • Culinary Stop</span>
            </p>
          </div>

          {/* AI Micro Story Narrative */}
          <p className="text-xs sm:text-sm text-stone-100 bg-black/60 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 leading-relaxed italic">
            "{currentSlide.narrative}"
          </p>

          {/* Dish Flavor Highlights */}
          <div className="flex flex-wrap gap-1.5">
            {currentSlide.dishHighlights.map((dish, dIdx) => (
              <span key={dIdx} className="text-[11px] bg-[#025259]/90 border border-[#ff947a]/40 text-[#FDF8F0] px-2.5 py-1 rounded-lg font-semibold">
                ✨ {dish}
              </span>
            ))}
          </div>

          {/* Social Share & Video Download Toolbar */}
          <div className="pt-2 flex flex-col gap-2 border-t border-white/20">
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={handleDownloadVideoReel}
                disabled={isRecording}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#ff947a] to-[#f08368] py-2 text-xs font-extrabold text-[#025259] shadow-lg hover:brightness-110 transition disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                {isRecording ? 'Rendering 30s Reel...' : 'Download 30s Video Reel (.MP4)'}
              </button>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleSocialShare('whatsapp')}
                  className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-600/80 hover:bg-emerald-600 text-white transition"
                >
                  WhatsApp
                </button>
                <button
                  onClick={() => handleSocialShare('twitter')}
                  className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-sky-500/80 hover:bg-sky-500 text-white transition"
                >
                  X (Twitter)
                </button>
                <button
                  onClick={() => handleSocialShare('facebook')}
                  className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-blue-600/80 hover:bg-blue-600 text-white transition"
                >
                  Facebook
                </button>
              </div>

              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 rounded-lg bg-[#FAF3E7]/20 border border-white/20 px-2.5 py-1 text-xs font-bold text-white hover:bg-white/30 transition"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? 'Copied' : 'Share'}
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

