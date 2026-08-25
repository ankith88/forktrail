'use client';

import React from 'react';
import Image from 'next/image';

interface LoadingScreenProps {
  fullScreen?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  subtext?: string;
  className?: string;
}

export function LoadingScreen({
  fullScreen = false,
  size = 'lg',
  text = 'Loading Palatero...',
  subtext = 'Preparing your culinary journey',
  className = '',
}: LoadingScreenProps) {
  const logoDimensions = {
    sm: { width: 36, height: 36, ring: 'w-12 h-12', text: 'text-xs' },
    md: { width: 56, height: 56, ring: 'w-20 h-20', text: 'text-sm' },
    lg: { width: 84, height: 84, ring: 'w-28 h-28', text: 'text-base' },
    xl: { width: 112, height: 112, ring: 'w-36 h-36', text: 'text-lg' },
  }[size];

  const content = (
    <div className={`flex flex-col items-center justify-center p-6 text-center select-none ${className}`}>
      <div className="relative flex items-center justify-center mb-5">
        {/* Orbital rotating ring */}
        <div
          className={`absolute ${logoDimensions.ring} rounded-full border-2 border-dashed border-[#ff947a]/60 animate-orbit-spin pointer-events-none`}
        />
        <div
          className={`absolute ${logoDimensions.ring} rounded-full border border-[#025259]/15 scale-110 pointer-events-none`}
        />

        {/* Central Logo Mark with pulse animation */}
        <div className="relative z-10 animate-logo-pulse flex items-center justify-center">
          <Image
            src="/logo-mark.png"
            alt="Palatero Loading"
            width={logoDimensions.width}
            height={logoDimensions.height}
            priority
            className="object-contain drop-shadow-md"
          />
        </div>
      </div>

      {/* Label and Subtext */}
      {text && (
        <div className="space-y-1 z-10">
          <h3 className={`font-serif font-bold text-[#025259] ${logoDimensions.text} tracking-wide`}>
            {text}
          </h3>
          {subtext && (
            <p className="text-xs text-stone-500 font-medium max-w-xs leading-relaxed">
              {subtext}
            </p>
          )}
        </div>
      )}

      {/* Subtle Shimmer Bar */}
      <div className="w-28 h-1 bg-[#025259]/10 rounded-full overflow-hidden mt-4 relative">
        <div className="w-full h-full bg-gradient-to-r from-transparent via-[#ff947a] to-transparent animate-shimmer-bar" />
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#FDF8F0] text-[#025259] transition-opacity duration-300">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#ff947a]/15 via-transparent to-transparent pointer-events-none" />
        {content}
      </div>
    );
  }

  return content;
}
