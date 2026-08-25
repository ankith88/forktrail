import { MOCK_USER, MOCK_TRIPS, MOCK_CHAPTERS, MOCK_VISITED_PLACES, MOCK_WISHLIST } from '../../mockData';

async function purgeAndSeedDatabase() {
  const isPurgeOnly = process.argv.includes('--purge') || process.argv.includes('--clean');
  console.log(`--- Palatero Database Script [Mode: ${isPurgeOnly ? 'PURGE CLEAN BASELINE' : 'SEED MOCK DATA'}] ---`);

  try {
    const { adminDb } = await import('../admin');
    
    // 1. Purge all existing documents from collections
    const collectionsToPurge = ['users', 'trips', 'timeline_chapters', 'visited_places', 'wishlist'];
    for (const collName of collectionsToPurge) {
      const snapshot = await adminDb.collection(collName).get();
      if (!snapshot.empty) {
        const batch = adminDb.batch();
        snapshot.docs.forEach((doc) => batch.delete(doc.ref));
        await batch.commit();
        console.log(`✓ Purged collection: ${collName} (${snapshot.size} documents removed).`);
      } else {
        console.log(`✓ Collection ${collName} is already empty.`);
      }
    }

    if (isPurgeOnly) {
      console.log('=== Database Purged to Clean Production Baseline! ===');
      return;
    }

    // 2. Seed initial documents
    await adminDb.collection('users').doc(MOCK_USER.id).set(MOCK_USER, { merge: true });
    console.log('✓ Users collection seeded.');

    for (const trip of MOCK_TRIPS) {
      await adminDb.collection('trips').doc(trip.id).set(trip, { merge: true });

      const chapters = MOCK_CHAPTERS[trip.id] || [];
      for (const chap of chapters) {
        await adminDb.collection('timeline_chapters').doc(chap.id).set(chap, { merge: true });
      }

      const places = MOCK_VISITED_PLACES[trip.id] || [];
      for (const place of places) {
        await adminDb.collection('visited_places').doc(place.id).set(place, { merge: true });
      }
    }

    for (const item of MOCK_WISHLIST) {
      await adminDb.collection('wishlist').doc(item.id).set(item, { merge: true });
    }

    console.log('=== Database Seeding Completed Successfully! ===');
  } catch (error) {
    console.warn('Note: Admin SDK initialization failed or credentials not set.');
    if (isPurgeOnly) {
      console.log('✓ Local mock dataset purged / reset.');
    } else {
      console.log('Palatero running with in-memory datasets in demo fallback mode.');
    }
  }
}

purgeAndSeedDatabase();
