import { UserProfile, Trip, TimelineChapter, VisitedPlace, WishlistItem } from '@/types';

export const MOCK_USER: UserProfile = {
  id: 'user_active',
  username: 'food_explorer',
  displayName: 'Food Explorer',
  bio: 'Culinary explorer traveling the globe one meal at a time. 🍜✨',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  favoriteCuisines: [],
  location: '',
  joinedDate: '2025-01-01',
};

export const MOCK_TRIPS: Trip[] = [];

export const MOCK_CHAPTERS: Record<string, TimelineChapter[]> = {};

export const MOCK_VISITED_PLACES: Record<string, VisitedPlace[]> = {};

export const MOCK_WISHLIST: WishlistItem[] = [];
