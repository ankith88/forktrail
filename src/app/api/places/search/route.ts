import { NextResponse } from 'next/server';

export function mapGoogleTypesToCuisine(types: string[] = []): string {
  const typeSet = new Set(types);

  if (typeSet.has('ramen_restaurant')) return 'Ramen';
  if (typeSet.has('sushi_restaurant')) return 'Sushi';
  if (typeSet.has('izakaya') || typeSet.has('pub') || typeSet.has('bar')) return 'Izakaya';
  if (typeSet.has('bakery')) return 'Bakery';
  if (typeSet.has('cafe') || typeSet.has('coffee_shop')) return 'Café';
  if (typeSet.has('fine_dining_restaurant')) return 'Fine Dining';
  if (typeSet.has('yakiniku_restaurant') || typeSet.has('barbecue_restaurant')) return 'Yakiniku';
  if (typeSet.has('japanese_restaurant')) return 'Japanese';
  if (typeSet.has('italian_restaurant') || typeSet.has('pizza_restaurant')) return 'Italian';
  if (typeSet.has('french_restaurant')) return 'French';
  if (typeSet.has('chinese_restaurant')) return 'Chinese';
  if (typeSet.has('mexican_restaurant')) return 'Mexican';
  if (typeSet.has('indian_restaurant')) return 'Indian';
  if (typeSet.has('thai_restaurant')) return 'Thai';
  if (typeSet.has('korean_restaurant')) return 'Korean';
  if (typeSet.has('vietnamese_restaurant')) return 'Vietnamese';
  if (typeSet.has('seafood_restaurant')) return 'Seafood';
  if (typeSet.has('steak_house')) return 'Steakhouse';
  if (typeSet.has('spanish_restaurant')) return 'Spanish';
  if (typeSet.has('fast_food_restaurant') || typeSet.has('meal_takeaway')) return 'Street Food';

  for (const t of types) {
    if (t.endsWith('_restaurant') && t !== 'restaurant') {
      const cuisineName = t.replace('_restaurant', '').replace(/_/g, ' ');
      return cuisineName.charAt(0).toUpperCase() + cuisineName.slice(1);
    }
  }

  if (typeSet.has('bistro')) return 'Bistro';
  if (typeSet.has('diner')) return 'Diner';

  return 'Restaurant';
}

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
        const places = data.results.map((p: any) => {
          const cuisine = mapGoogleTypesToCuisine(p.types || []);
          return {
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
            photoUrl: p.photos?.[0]?.photo_reference
              ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=600&photo_reference=${p.photos[0].photo_reference}&key=${apiKey}`
              : 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
          };
        });

        return NextResponse.json({ success: true, places });
      }
    } catch (err) {
      console.warn('Google Places API proxy fetch failed:', err);
    }
  }

  return NextResponse.json({ success: true, places: [] });
}

