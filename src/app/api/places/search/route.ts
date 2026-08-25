import { NextResponse } from 'next/server';

const MOCK_PLACES_RESULTS = [
  {
    placeId: 'ChIJW3PZ4QeMGGARmE5yvYV61hM',
    name: 'Rokurinsha (六厘舎)',
    address: 'Tokyo Station Ramen Street, Chiyoda-ku, Tokyo',
    lat: 35.6812,
    lng: 139.7671,
    rating: 4.6,
    priceLevel: 2,
    category: 'Ramen',
    photoUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=400&q=80',
  },
  {
    placeId: 'ChIJ5c3VpAeMGGARaL54_qWqCVM',
    name: 'Torishige Yakitori (鳥茂)',
    address: '2-6-5 Yoyogi, Shibuya-ku, Tokyo',
    lat: 35.6882,
    lng: 139.6991,
    rating: 4.8,
    priceLevel: 3,
    category: 'Izakaya',
    photoUrl: 'https://images.unsplash.com/photo-1555126634-323283e090fa?auto=format&fit=crop&w=400&q=80',
  },
  {
    placeId: 'ChIJ5w4h_QyLGGAR9G6Z9M4n0kA',
    name: 'Sushi Sawada (鮨 さわ田)',
    address: '5-9-19 Ginza, Chuo-ku, Tokyo',
    lat: 35.6715,
    lng: 139.7638,
    rating: 4.9,
    priceLevel: 4,
    category: 'Sushi',
    photoUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=400&q=80',
  },
  {
    placeId: 'ChIJb6tZqAiMGGARXbWp_oWqDMM',
    name: 'About Life Coffee Brewers',
    address: '1-19-8 Dogenzaka, Shibuya-ku, Tokyo',
    lat: 35.6582,
    lng: 139.6975,
    rating: 4.5,
    priceLevel: 1,
    category: 'Café',
    photoUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=400&q=80',
  },
  {
    placeId: 'ChIJ_6tZqAiMGGARXbWp_oWqDMM',
    name: "All'Antico Vinaio Florence",
    address: 'Via dei Neri 65r, Florence, Italy',
    lat: 43.7683,
    lng: 11.2582,
    rating: 4.8,
    priceLevel: 1,
    category: 'Street Food',
    photoUrl: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=400&q=80',
  },
];

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
      console.warn('Google Places API proxy fetch failed, falling back to mock results:', err);
    }
  }

  // Fallback filtering on mock places dataset
  const filtered = query
    ? MOCK_PLACES_RESULTS.filter(
        p =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.category.toLowerCase().includes(query.toLowerCase()) ||
          p.address.toLowerCase().includes(query.toLowerCase())
      )
    : MOCK_PLACES_RESULTS;

  return NextResponse.json({ success: true, places: filtered });
}
