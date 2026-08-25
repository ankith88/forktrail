'use client';

import React, { useState, useEffect } from 'react';
import { PalateMatchResult, TasteProfile } from '@/types';
import { Sparkles, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PalateScoreBadgeProps {
  venue: {
    name: string;
    category?: string;
    address?: string;
    notes?: string;
    description?: string;
  };
  tasteProfile?: TasteProfile | null;
  className?: string;
}

export function PalateScoreBadge({ venue, tasteProfile, className }: PalateScoreBadgeProps) {
  const [matchResult, setMatchResult] = useState<PalateMatchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (!venue?.name) return;

    let isMounted = true;
    const fetchPalateMatch = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/ai/palate-match', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'match-venue',
            venue,
            tasteProfile,
          }),
        });

        const data = await res.json();
        if (data.success && isMounted) {
          setMatchResult({
            matchPercentage: data.matchPercentage || 92,
            reasoning: data.reasoning || `${data.matchPercentage || 92}% Match — Great fit for your palate profile.`,
          });
        }
      } catch (err) {
        console.error('Failed to compute palate match:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchPalateMatch();

    return () => {
      isMounted = false;
    };
  }, [venue.name, venue.category]);

  if (isLoading) {
    return (
      <div className={cn('inline-flex items-center gap-1.5 rounded-full bg-[#FAF3E7] px-2.5 py-1 text-[11px] font-bold text-[#025259] border border-[#025259]/10 animate-pulse', className)}>
        <Sparkles className="h-3 w-3 text-[#ff947a] animate-spin" />
        <span>Calculating Palate Match...</span>
      </div>
    );
  }

  if (!matchResult) return null;

  const isHighMatch = matchResult.matchPercentage >= 90;

  return (
    <div className={cn('inline-block', className)}>
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold shadow-sm transition hover:scale-102 border',
          isHighMatch
            ? 'bg-[#ff947a]/20 border-[#ff947a]/50 text-[#025259]'
            : 'bg-[#025259]/10 border-[#025259]/30 text-[#025259]'
        )}
      >
        <Sparkles className={cn('h-3.5 w-3.5', isHighMatch ? 'text-[#ff947a]' : 'text-[#025259]')} />
        <span>{matchResult.matchPercentage}% Palate Match</span>
        {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </button>

      {isExpanded && (
        <div className="mt-1.5 p-2.5 rounded-xl bg-[#FDF8F0] border border-[#ff947a]/40 shadow-md text-xs text-[#025259] space-y-1 animate-in fade-in zoom-in-95 duration-150 max-w-xs">
          <div className="flex items-center gap-1 font-bold text-[#025259]">
            <Info className="h-3.5 w-3.5 text-[#ff947a]" /> Palate AI Breakdown:
          </div>
          <p className="text-[11px] leading-relaxed text-stone-700 italic">
            {matchResult.reasoning}
          </p>
        </div>
      )}
    </div>
  );
}
