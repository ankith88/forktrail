import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Calculate distance between two lat/lng points in kilometers (Haversine formula)
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  try {
    // If string starts with YYYY-MM-DD (e.g. "2026-08-24" or "2026-08-24T..."), extract date parts directly
    const cleanDateStr = dateString.split('T')[0];
    const parts = cleanDateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
        const localDate = new Date(year, month, day);
        return localDate.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
      }
    }
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function getLocalDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export type MealType = 'breakfast' | 'brunch' | 'lunch' | 'snack' | 'dinner' | 'late_night';

export function getMealPeriodFromTime(timeStr: string): MealType {
  if (!timeStr) return 'dinner';
  const cleanTime = timeStr.includes('T') ? timeStr.split('T')[1] : timeStr;
  const parts = cleanTime.split(':');
  if (parts.length < 2) return 'dinner';
  const hour = parseInt(parts[0], 10);
  const min = parseInt(parts[1], 10);
  if (isNaN(hour)) return 'dinner';

  const totalMin = hour * 60 + (isNaN(min) ? 0 : min);

  if (totalMin >= 300 && totalMin < 630) return 'breakfast';
  if (totalMin >= 630 && totalMin < 690) return 'brunch';
  if (totalMin >= 690 && totalMin < 900) return 'lunch';
  if (totalMin >= 900 && totalMin < 1050) return 'snack';
  if (totalMin >= 1050 && totalMin < 1350) return 'dinner';
  return 'late_night';
}

export function getMealPeriodBadge(mealType?: string): {
  label: string;
  icon: string;
  className: string;
} {
  switch (mealType) {
    case 'breakfast':
      return { label: 'Breakfast', icon: '🌅', className: 'bg-amber-50 text-amber-900 border-amber-200/80' };
    case 'brunch':
      return { label: 'Brunch', icon: '🥂', className: 'bg-rose-50 text-rose-900 border-rose-200/80' };
    case 'lunch':
      return { label: 'Lunch', icon: '☀️', className: 'bg-amber-100/70 text-amber-950 border-amber-300/80' };
    case 'snack':
      return { label: 'Snack', icon: '☕', className: 'bg-orange-50 text-orange-900 border-orange-200/80' };
    case 'dinner':
      return { label: 'Dinner', icon: '🌙', className: 'bg-[#025259]/10 text-[#025259] border-[#025259]/20 font-bold' };
    case 'late_night':
      return { label: 'Late Night', icon: '🍸', className: 'bg-purple-50 text-purple-900 border-purple-200/80' };
    default:
      return { label: 'Dining', icon: '🍽️', className: 'bg-stone-100 text-stone-800 border-stone-200' };
  }
}


