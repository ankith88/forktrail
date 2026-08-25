import { NextResponse } from 'next/server';
import { mapGoogleTypesToCuisine } from '../search/route';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const placeId = searchParams.get('placeId') || '';

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (apiKey && apiKey !== 'your_google_maps_api_key' && placeId.trim()) {
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

  return NextResponse.json({ success: false, message: 'Place details not found' }, { status: 404 });
}
