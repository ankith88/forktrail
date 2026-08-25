'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Sparkles, Bot } from 'lucide-react';
import { AISearchModal } from '@/components/AISearchModal';

export function Footer() {
  const [isAISearchModalOpen, setIsAISearchModalOpen] = useState(false);

  return (
    <>
      <footer className="w-full border-t border-[#013b40] bg-[#025259] py-8 text-xs text-[#FAF3E7] font-sans">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-[#FAF3E7] p-1 shadow-md transition-transform group-hover:scale-105">
                <Image
                  src="/logo-mark.png"
                  alt="Palatero Logo"
                  width={36}
                  height={36}
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="text-left">
                <span className="font-serif font-bold text-white text-base block leading-tight">
                  Palatero
                </span>
                <span className="text-[11px] tracking-wide text-[#ff947a] font-semibold block">
                  Taste the story.
                </span>
              </div>
            </Link>

            {/* AI Searchable badge */}
            <button
              onClick={() => setIsAISearchModalOpen(true)}
              className="inline-flex items-center gap-2 bg-[#013b40]/80 hover:bg-[#013b40] text-emerald-300 px-3 py-1.5 rounded-full border border-emerald-500/30 transition-all hover:scale-105 hover:border-emerald-400 group cursor-pointer shadow-sm"
              title="Click to view AI Search & Indexing parameters"
            >
              <div className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#ff947a] animate-pulse" />
                <span className="font-mono text-[11px] font-medium text-white">AI Searchable</span>
              </div>
              <span className="text-[10px] text-stone-300 font-mono bg-white/10 px-1.5 py-0.5 rounded flex items-center gap-1">
                <Bot className="w-3 h-3 text-sky-300" /> Claude · Gemini · ChatGPT
              </span>
            </button>
          </div>

          <div className="flex flex-col items-center sm:items-end gap-1 text-center sm:text-right">
            <p className="text-stone-300">
              © {new Date().getFullYear()} Palatero. Built for foodies, travelers &amp; culinary storytellers.
            </p>
            <div className="flex items-center gap-3 text-[11px] text-stone-400 font-mono">
              <a href="/llms.txt" target="_blank" rel="noopener noreferrer" className="hover:text-[#ff947a] transition-colors">
                llms.txt
              </a>
              <span>•</span>
              <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="hover:text-[#ff947a] transition-colors">
                sitemap.xml
              </a>
            </div>
          </div>
        </div>
      </footer>

      <AISearchModal
        isOpen={isAISearchModalOpen}
        onClose={() => setIsAISearchModalOpen(false)}
      />
    </>
  );
}

