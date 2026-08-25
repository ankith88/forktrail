import { NextResponse } from 'next/server';

const MOCK_PLACES_RESULTS: any[] = [];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query') || '';

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (apiKey && apiKey !== 'your_google_maps_api_key' && query.trim()) {
    try {
      const googlePlacesUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
        query
      )}&key=${apiKey}`;

      const res = await fetch(googlePlacesUrl);
      const data = await res.json();

      if (data.status === 'OK' && data.results) {
        const places = data.results.map((p: any) => ({
          placeId: p.place_id,
          name: p.name,
          address: p.formatted_address,
          lat: p.geometry?.location?.lat,
          lng: p.geometry?.location?.lng,
          rating: p.rating || 4.5,
          priceLevel: p.price_level || 2,
          category: p.types?.[0] || 'Restaurant',
          photoUrl: p.photos?.[0]?.photo_reference
            ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${p.photos[0].photo_reference}&key=${apiKey}`
            : 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=400&q=80',
        }));

        return NextResponse.json({ success: true, places });
      }
    } catch (err) {
      console.warn('Google Places API proxy fetch failed:', err);
    }
  }

  // Return empty list when search yields no live API results or when query is empty
  return NextResponse.json({ success: true, places: [] });
}
