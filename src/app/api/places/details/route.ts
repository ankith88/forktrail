import { NextResponse } from 'next/server';
import { mapGoogleTypesToCuisine, parsePriceLevel } from '../search/route';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const placeId = searchParams.get('placeId') || '';

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!placeId.trim()) {
    return NextResponse.json({ success: false, message: 'Missing placeId' }, { status: 400 });
  }

  if (apiKey && apiKey !== 'your_google_maps_api_key') {
    // 1. Try Google Places API (New) Details: GET https://places.googleapis.com/v1/places/{placeId}
    if (!placeId.startsWith('fallback_')) {
      try {
        const newDetailsUrl = `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`;
        const newRes = await fetch(newDetailsUrl, {
          headers: {
            'X-Goog-Api-Key': apiKey,
            'X-Goog-FieldMask':
              'id,displayName,formattedAddress,location,rating,priceLevel,primaryTypeDisplayName,types,userRatingCount,photos,websiteUri,nationalPhoneNumber,googleMapsUri',
          },
        });

        if (newRes.ok) {
          const p = await newRes.json();
          if (p.id) {
            const category = p.primaryTypeDisplayName?.text || mapGoogleTypesToCuisine(p.types || []);
            const photoUrl = p.photos?.[0]?.name
              ? `https://places.googleapis.com/v1/${p.photos[0].name}/media?maxHeightPx=800&maxWidthPx=800&key=${apiKey}`
              : 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80';

            const placeDetails = {
              placeId: p.id,
              name: p.displayName?.text || '',
              address: p.formattedAddress || '',
              lat: p.location?.latitude ?? null,
              lng: p.location?.longitude ?? null,
              rating: p.rating ? Math.round(p.rating) : 4,
              rawRating: p.rating || 4.5,
              priceLevel: parsePriceLevel(p.priceLevel),
              category,
              cuisine: category,
              userRatingsTotal: p.userRatingCount || 0,
              website: p.websiteUri || '',
              phone: p.nationalPhoneNumber || '',
              url: p.googleMapsUri || '',
              photoUrl,
            };

            return NextResponse.json({ success: true, place: placeDetails });
          }
        }
      } catch (err) {
        console.warn('Places API (New) Place Details fetch failed:', err);
      }

      // 2. Fallback to Legacy Google Place Details
      try {
        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(
          placeId
        )}&fields=place_id,name,formatted_address,geometry,rating,price_level,types,photos,website,international_phone_number,url,user_ratings_total&key=${apiKey}`;

        const res = await fetch(detailsUrl);
        const data = await res.json();

        if (data.status === 'OK' && data.result) {
          const p = data.result;
          const cuisine = mapGoogleTypesToCuisine(p.types || []);

          const placeDetails = {
            placeId: p.place_id,
            name: p.name,
            address: p.formatted_address || '',
            lat: p.geometry?.location?.lat ?? null,
            lng: p.geometry?.location?.lng ?? null,
            rating: p.rating ? Math.round(p.rating) : 4,
            rawRating: p.rating || 4.5,
            priceLevel: p.price_level || 2,
            category: cuisine,
            cuisine: cuisine,
            userRatingsTotal: p.user_ratings_total || 0,
            website: p.website || '',
            phone: p.international_phone_number || '',
            url: p.url || '',
            photoUrl: p.photos?.[0]?.photo_reference
              ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${p.photos[0].photo_reference}&key=${apiKey}`
              : 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
          };

          return NextResponse.json({ success: true, place: placeDetails });
        }
      } catch (err) {
        console.warn('Google Place Details API fetch failed:', err);
      }
    }
  }

  // Fallback place details
  return NextResponse.json({
    success: true,
    place: {
      placeId,
      name: 'Custom Venue',
      address: 'Select or edit address below',
      lat: 35.6812,
      lng: 139.7671,
      rating: 4,
      rawRating: 4.5,
      priceLevel: 2,
      category: 'Restaurant',
      cuisine: 'Restaurant',
      userRatingsTotal: 50,
      photoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
    },
  });
}

