import { db } from './client';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { User as FirebaseUser } from 'firebase/auth';
import { Trip, TimelineChapter, VisitedPlace, WishlistItem } from '@/types';

// Ensure user profile document exists in Firestore users collection
export async function syncUserProfileToFirestore(user: FirebaseUser) {
  if (!db || !user?.uid) return;
  try {
    const userRef = doc(db, 'users', user.uid);
    await setDoc(
      userRef,
      {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || 'Food Explorer',
        photoURL: user.photoURL || '',
        lastSeenAt: new Date().toISOString(),
      },
      { merge: true }
    );
    console.log(`[Firestore] User profile synced for UID: ${user.uid}`);
  } catch (error) {
    console.error('Error syncing user profile to Firestore:', error);
  }
}

// Save or update a trip / hometown food log in Firestore
export async function saveTripToFirestore(userId: string, trip: Trip) {
  if (!db || !userId) {
    console.warn('[Firestore] Cannot save trip: Missing db or userId');
    return;
  }
  try {
    const tripRef = doc(db, 'trips', trip.id);
    await setDoc(tripRef, { ...trip, userId, updatedAt: new Date().toISOString() }, { merge: true });
    console.log(`[Firestore] Saved trip/hometown log ${trip.id} for user ${userId}`);
  } catch (error) {
    console.error('Error saving trip to Firestore:', error);
  }
}

// Save or update a visited place in Firestore
export async function saveVisitedPlaceToFirestore(userId: string, place: VisitedPlace) {
  if (!db || !userId) {
    console.warn('[Firestore] Cannot save place: Missing db or userId');
    return;
  }
  try {
    const placeRef = doc(db, 'visited_places', place.id);
    await setDoc(placeRef, { ...place, userId, updatedAt: new Date().toISOString() }, { merge: true });
    console.log(`[Firestore] Saved visited place ${place.id} for user ${userId}`);
  } catch (error) {
    console.error('Error saving visited place to Firestore:', error);
  }
}

// Delete a visited place from Firestore
export async function deleteVisitedPlaceFromFirestore(placeId: string) {
  if (!db || !placeId) return;
  try {
    const placeRef = doc(db, 'visited_places', placeId);
    await deleteDoc(placeRef);
    console.log(`[Firestore] Deleted visited place ${placeId}`);
  } catch (error) {
    console.error('Error deleting visited place from Firestore:', error);
  }
}

// Save or update a wishlist item in Firestore
export async function saveWishlistItemToFirestore(userId: string, item: WishlistItem) {
  if (!db || !userId) {
    console.warn('[Firestore] Cannot save wishlist item: Missing db or userId');
    return;
  }
  try {
    const itemRef = doc(db, 'wishlist', item.id);
    await setDoc(itemRef, { ...item, userId, updatedAt: new Date().toISOString() }, { merge: true });
    console.log(`[Firestore] Saved wishlist item ${item.id} for user ${userId}`);
  } catch (error) {
    console.error('Error saving wishlist item to Firestore:', error);
  }
}

// Delete a wishlist item from Firestore
export async function deleteWishlistItemFromFirestore(itemId: string) {
  if (!db || !itemId) return;
  try {
    const itemRef = doc(db, 'wishlist', itemId);
    await deleteDoc(itemRef);
    console.log(`[Firestore] Deleted wishlist item ${itemId}`);
  } catch (error) {
    console.error('Error deleting wishlist item from Firestore:', error);
  }
}

// Save or update a timeline chapter in Firestore
export async function saveChapterToFirestore(userId: string, chapter: TimelineChapter) {
  if (!db || !userId) {
    console.warn('[Firestore] Cannot save chapter: Missing db or userId');
    return;
  }
  try {
    const chapterRef = doc(db, 'timeline_chapters', chapter.id);
    await setDoc(chapterRef, { ...chapter, userId, updatedAt: new Date().toISOString() }, { merge: true });
    console.log(`[Firestore] Saved chapter ${chapter.id} for user ${userId}`);
  } catch (error) {
    console.error('Error saving timeline chapter to Firestore:', error);
  }
}

// Fetch user data from Firestore strictly filtered by user ID (Trips, Visited Places, Chapters, Wishlist)
export async function fetchUserDataFromFirestore(userId: string): Promise<{
  trips: Trip[];
  visitedPlacesMap: Record<string, VisitedPlace[]>;
  chaptersMap: Record<string, TimelineChapter[]>;
  wishlistItems: WishlistItem[];
}> {
  if (!db || !userId) {
    return { trips: [], visitedPlacesMap: {}, chaptersMap: {}, wishlistItems: [] };
  }

  try {
    // 1. Fetch Trips (Filtered strictly by userId)
    const tripsQuery = query(collection(db, 'trips'), where('userId', '==', userId));
    const tripsSnap = await getDocs(tripsQuery);
    const trips: Trip[] = tripsSnap.docs.map((docSnap) => docSnap.data() as Trip);

    // 2. Fetch Visited Places (Filtered strictly by userId)
    const visitedQuery = query(collection(db, 'visited_places'), where('userId', '==', userId));
    const visitedSnap = await getDocs(visitedQuery);
    const visitedPlacesMap: Record<string, VisitedPlace[]> = {};

    visitedSnap.docs.forEach((docSnap) => {
      const place = docSnap.data() as VisitedPlace;
      if (place.tripId) {
        if (!visitedPlacesMap[place.tripId]) {
          visitedPlacesMap[place.tripId] = [];
        }
        visitedPlacesMap[place.tripId].push(place);
      }
    });

    // 3. Fetch Chapters (Filtered strictly by userId)
    const chaptersQuery = query(collection(db, 'timeline_chapters'), where('userId', '==', userId));
    const chaptersSnap = await getDocs(chaptersQuery);
    const chaptersMap: Record<string, TimelineChapter[]> = {};

    chaptersSnap.docs.forEach((docSnap) => {
      const chapter = docSnap.data() as TimelineChapter;
      if (chapter.tripId) {
        if (!chaptersMap[chapter.tripId]) {
          chaptersMap[chapter.tripId] = [];
        }
        chaptersMap[chapter.tripId].push(chapter);
      }
    });

    // Sort chapters by dayNumber
    Object.keys(chaptersMap).forEach((tripId) => {
      chaptersMap[tripId].sort((a, b) => a.dayNumber - b.dayNumber);
    });

    // 4. Fetch Wishlist Items (Filtered strictly by userId)
    const wishlistQuery = query(collection(db, 'wishlist'), where('userId', '==', userId));
    const wishlistSnap = await getDocs(wishlistQuery);
    const wishlistItems: WishlistItem[] = wishlistSnap.docs.map(
      (docSnap) => docSnap.data() as WishlistItem
    );

    return {
      trips,
      visitedPlacesMap,
      chaptersMap,
      wishlistItems,
    };
  } catch (error) {
    console.error('Error fetching user data from Firestore:', error);
    return { trips: [], visitedPlacesMap: {}, chaptersMap: {}, wishlistItems: [] };
  }
}
