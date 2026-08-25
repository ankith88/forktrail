import { Trip, VisitedPlace, WishlistItem, TimelineChapter } from '@/types';

const TRIPS_KEY = 'forktrail_user_trips';
const VISITED_KEY = 'forktrail_user_visited';
const WISHLIST_KEY = 'forktrail_user_wishlist';
const CHAPTERS_KEY = 'forktrail_user_chapters';

export function getStoredTrips(): Trip[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(TRIPS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to load trips from storage:', e);
    return [];
  }
}

export function saveStoredTrips(trips: Trip[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(TRIPS_KEY, JSON.stringify(trips));
  } catch (e) {
    console.error('Failed to save trips to storage:', e);
  }
}

export function getStoredVisitedPlaces(): Record<string, VisitedPlace[]> {
  if (typeof window === 'undefined') return {};
  try {
    const data = localStorage.getItem(VISITED_KEY);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    console.error('Failed to load visited places from storage:', e);
    return {};
  }
}

export function saveStoredVisitedPlaces(visitedMap: Record<string, VisitedPlace[]>) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(VISITED_KEY, JSON.stringify(visitedMap));
  } catch (e) {
    console.error('Failed to save visited places to storage:', e);
  }
}

export function getStoredWishlist(): WishlistItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(WISHLIST_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to load wishlist from storage:', e);
    return [];
  }
}

export function saveStoredWishlist(wishlist: WishlistItem[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
  } catch (e) {
    console.error('Failed to save wishlist to storage:', e);
  }
}

export function getStoredChapters(): Record<string, TimelineChapter[]> {
  if (typeof window === 'undefined') return {};
  try {
    const data = localStorage.getItem(CHAPTERS_KEY);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    console.error('Failed to load chapters from storage:', e);
    return {};
  }
}

export function saveStoredChapters(chaptersMap: Record<string, TimelineChapter[]>) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CHAPTERS_KEY, JSON.stringify(chaptersMap));
  } catch (e) {
    console.error('Failed to save chapters to storage:', e);
  }
}
