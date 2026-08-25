export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  favoriteCuisines: string[];
  location: string;
  joinedDate: string;
}

export interface Trip {
  id: string;
  userId: string;
  title: string;
  slug: string;
  destination: string;
  startDate: string;
  endDate: string;
  coverUrl: string;
  summary: string;
  visibility: 'public' | 'private';
  createdAt: string;
}

export interface TimelineChapter {
  id: string;
  tripId: string;
  dayNumber: number;
  date: string;
  title: string;
  notes?: string;
}

export interface VisitedPlace {
  id: string;
  tripId: string;
  chapterId: string;
  placeId: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  visitTime: string;
  photoUrls: string[];
  dishTags: string[];
  rating: number; // 1-5
  tastingNotes: string;
  priceLevel?: number; // 1-4
  category: string;
  recommendedDish?: string;
}

export interface WishlistItem {
  id: string;
  userId: string;
  tripId?: string;
  placeId: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  notes: string;
  category: string;
  priority: 'must-try' | 'if-time' | 'backup';
  createdAt: string;
  photoUrl?: string;
}

export interface PhotoEXIFData {
  fileName: string;
  previewUrl: string;
  timestamp?: string;
  lat?: number;
  lng?: number;
  make?: string;
  model?: string;
}

export interface AIProcessedPhotoGroup {
  suggestedChapterTitle: string;
  date: string;
  dayNumber: number;
  places: {
    suggestedVenueName: string;
    suggestedCategory: string;
    lat?: number;
    lng?: number;
    visitTime: string;
    detectedDishes: string[];
    suggestedTastingNotes: string;
    suggestedRating: number;
    photoUrls: string[];
  }[];
}

export interface ReelSlide {
  venueName: string;
  category: string;
  rating: number;
  photoUrl: string;
  narrative: string;
  dishHighlights: string[];
  vibeTag: string;
  lat: number;
  lng: number;
  timeCode?: string;
}

export interface ReelData {
  headline: string;
  tagline: string;
  occasionPrompt?: string;
  occasionBadge?: string;
  bgMusicMood?: 'romantic' | 'festive' | 'chill' | 'luxury';
  slides: ReelSlide[];
}

