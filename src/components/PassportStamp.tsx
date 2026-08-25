'use client';

import React from 'react';
import Image from 'next/image';

interface PassportStampProps {
  locationName?: string;
  visitDate?: string;
  category?: string;
  rating?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
}

export function PassportStamp({
  locationName = 'Palatero Entry',
  visitDate = new Date().toISOString().split('T')[0],
  category = 'Culinary Visit',
  rating = 5,
  size = 'md',
  className = '',
  onClick,
}: PassportStampProps) {
  const dimensions = {
    sm: 'w-24 h-24 text-[9px]',
    md: 'w-36 h-36 text-xs',
    lg: 'w-48 h-48 text-sm',
  }[size];

  return (
    <div
      onClick={onClick}
      className={`relative inline-flex flex-col items-center justify-center rounded-full border-4 border-[#025259] bg-[#FDF8F0] p-3 text-center shadow-lg transition-transform hover:scale-105 ${dimensions} ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {/* Outer Decorative Compass Ring */}
      <div className="absolute inset-1 rounded-full border-2 border-dashed border-[#025259]/40 pointer-events-none" />

      {/* Compass Seal Center Icon */}
      <div className="relative z-10 flex flex-col items-center justify-center space-y-1">
        <div className="relative h-8 w-8 sm:h-10 sm:w-10">
          <Image
            src="/logo-mark.png"
            alt="Palatero Seal"
            width={40}
            height={40}
            className="h-full w-full object-contain"
          />
        </div>

        <span className="font-serif font-bold text-[#025259] leading-tight truncate max-w-[90%]">
          {locationName}
        </span>

        <span className="font-sans text-[10px] font-semibold text-[#ff947a] tracking-wider uppercase">
          {category}
        </span>

        <span className="font-mono text-[9px] text-[#025259]/80 font-medium">
          {visitDate}
        </span>
      </div>

      {/* Scalloped Stamp Accent */}
      <div className="absolute -bottom-1 right-2 rounded-full bg-[#025259] px-2 py-0.5 text-[9px] font-bold text-[#FDF8F0] shadow-sm">
        ★ {rating}.0
      </div>
    </div>
  );
}
