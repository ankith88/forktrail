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
  categoryType?: 'trip' | 'hometown_log' | 'standalone_story';
  isHometown?: boolean;
}

export interface TimelineChapter {
  id: string;
  tripId: string;
  dayNumber: number;
  date: string;
  title: string;
  notes?: string;
}

export interface VisitedPhoto {
  url: string;
  dishName?: string;
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
  localDate?: string; // YYYY-MM-DD (Preserves venue local wall-clock date)
  localTime?: string; // HH:mm (e.g. 21:02)
  mealType?: 'breakfast' | 'brunch' | 'lunch' | 'snack' | 'dinner' | 'late_night';
  timezone?: string; // e.g. "Australia/Sydney"
  photoUrls: string[];
  photos?: VisitedPhoto[];
  occasion?: string;
  celebrationReason?: string;
  dishTags: string[];
  rating: number; // 1-5
  tastingNotes: string;
  priceLevel?: number; // 1-4
  category: string;
  recommendedDish?: string;
  isHometown?: boolean;
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
  localDate?: string;
  localTime?: string;
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
  dishName?: string;
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

export interface DecodedDish {
  originalName: string;
  translatedName: string;
  description: string;
  ingredients: string[];
  allergens: string[];
  isSpecialty: boolean;
  price: string;
}

export interface VoiceNoteAnalysis {
  aromaAndFlavor: string;
  textureAndPresentation: string;
  standoutDish: string;
  valueAndVibe: string;
  rawTranscription?: string;
}

export interface TasteProfile {
  summary: string;
  topCuisines: string[];
  keyFlavors: string[];
  diningStyle: string;
  computedAt: string;
}

export interface PalateMatchResult {
  matchPercentage: number;
  reasoning: string;
}

export interface ItinerarySlot {
  timeSlot: string;
  venueName: string;
  category: string;
  activityType: string;
  address: string;
  lat: number;
  lng: number;
  notes: string;
  estimatedDuration: string;
}

export interface ItineraryDay {
  dayNumber: number;
  title: string;
  schedule: ItinerarySlot[];
}

export interface VisualSearchResult {
  dishAttributes: {
    dishType: string;
    style: string;
    toppings: string[];
  };
  nearbyMatches: {
    placeId: string;
    name: string;
    address: string;
    rating: number;
    userRatingsTotal?: number;
    lat: number;
    lng: number;
    distanceKm: number;
    matchingSpecialty: string;
    photoUrl?: string;
  }[];
}

export interface SocialCaptions {
  instagram: string;
  twitter: string;
  substack: string;
  bourdain: string;
}


