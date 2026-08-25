'use client';

import React from 'react';
import { Share2 } from 'lucide-react';

interface ShareButtonProps {
  title: string;
  summary: string;
}

export function ShareButton({ title, summary }: ShareButtonProps) {
  const handleShare = () => {
    if (typeof window !== 'undefined' && navigator.share) {
      navigator.share({
        title,
        text: summary,
        url: window.location.href,
      }).catch((err) => console.log('Share dismissed', err));
    } else if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      alert('Blog link copied to clipboard!');
    }
  };

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-500 hover:text-stone-950 transition"
    >
      <Share2 className="h-3.5 w-3.5" />
      Share Magazine
    </button>
  );
}
