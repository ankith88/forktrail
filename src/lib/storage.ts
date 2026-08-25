import { Trip, VisitedPlace, WishlistItem, TimelineChapter } from '@/types';

function getKey(baseKey: string, userId?: string | null): string {
  return userId ? `${baseKey}_${userId}` : baseKey;
}

const TRIPS_KEY = 'palatero_user_trips';
const VISITED_KEY = 'palatero_user_visited';
const WISHLIST_KEY = 'palatero_user_wishlist';
const CHAPTERS_KEY = 'palatero_user_chapters';

export function getStoredTrips(userId?: string | null): Trip[] {
  if (typeof window === 'undefined') return [];
  try {
    const key = getKey(TRIPS_KEY, userId);
    const data = localStorage.getItem(key);
    if (data) return JSON.parse(data);

    if (userId) {
      const baseData = localStorage.getItem(TRIPS_KEY);
      if (baseData) return JSON.parse(baseData);
    }
    return [];
  } catch (e) {
    console.error('Failed to load trips from storage:', e);
    return [];
  }
}

export function saveStoredTrips(trips: Trip[], userId?: string | null) {
  if (typeof window === 'undefined') return;
  try {
    const key = getKey(TRIPS_KEY, userId);
    localStorage.setItem(key, JSON.stringify(trips));
    if (userId) {
      localStorage.setItem(TRIPS_KEY, JSON.stringify(trips));
    }
  } catch (e) {
    console.error('Failed to save trips to storage:', e);
  }
}

export function getStoredVisitedPlaces(userId?: string | null): Record<string, VisitedPlace[]> {
  if (typeof window === 'undefined') return {};
  try {
    const key = getKey(VISITED_KEY, userId);
    const data = localStorage.getItem(key);
    if (data) return JSON.parse(data);

    if (userId) {
      const baseData = localStorage.getItem(VISITED_KEY);
      if (baseData) return JSON.parse(baseData);
    }
    return {};
  } catch (e) {
    console.error('Failed to load visited places from storage:', e);
    return {};
  }
}

export function saveStoredVisitedPlaces(visitedMap: Record<string, VisitedPlace[]>, userId?: string | null) {
  if (typeof window === 'undefined') return;
  try {
    const key = getKey(VISITED_KEY, userId);
    localStorage.setItem(key, JSON.stringify(visitedMap));
    if (userId) {
      localStorage.setItem(VISITED_KEY, JSON.stringify(visitedMap));
    }
  } catch (e) {
    console.error('Failed to save visited places to storage:', e);
  }
}

export function getStoredWishlist(userId?: string | null): WishlistItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const key = getKey(WISHLIST_KEY, userId);
    const data = localStorage.getItem(key);
    if (data) return JSON.parse(data);

    if (userId) {
      const baseData = localStorage.getItem(WISHLIST_KEY);
      if (baseData) return JSON.parse(baseData);
    }
    return [];
  } catch (e) {
    console.error('Failed to load wishlist from storage:', e);
    return [];
  }
}

export function saveStoredWishlist(wishlist: WishlistItem[], userId?: string | null) {
  if (typeof window === 'undefined') return;
  try {
    const key = getKey(WISHLIST_KEY, userId);
    localStorage.setItem(key, JSON.stringify(wishlist));
    if (userId) {
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
    }
  } catch (e) {
    console.error('Failed to save wishlist to storage:', e);
  }
}

export function getStoredChapters(userId?: string | null): Record<string, TimelineChapter[]> {
  if (typeof window === 'undefined') return {};
  try {
    const key = getKey(CHAPTERS_KEY, userId);
    const data = localStorage.getItem(key);
    if (data) return JSON.parse(data);

    if (userId) {
      const baseData = localStorage.getItem(CHAPTERS_KEY);
      if (baseData) return JSON.parse(baseData);
    }
    return {};
  } catch (e) {
    console.error('Failed to load chapters from storage:', e);
    return {};
  }
}

export function saveStoredChapters(chaptersMap: Record<string, TimelineChapter[]>, userId?: string | null) {
  if (typeof window === 'undefined') return;
  try {
    const key = getKey(CHAPTERS_KEY, userId);
    localStorage.setItem(key, JSON.stringify(chaptersMap));
    if (userId) {
      localStorage.setItem(CHAPTERS_KEY, JSON.stringify(chaptersMap));
    }
  } catch (e) {
    console.error('Failed to save chapters to storage:', e);
  }
}
