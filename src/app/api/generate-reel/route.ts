import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { MOCK_TRIPS, MOCK_VISITED_PLACES, MOCK_CHAPTERS } from '@/lib/mockData';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tripSlug } = body;

    const trip = MOCK_TRIPS.find((t) => t.slug === tripSlug) || MOCK_TRIPS[0];
    const visitedPlaces = MOCK_VISITED_PLACES[trip.id] || [];

    if (!visitedPlaces.length) {
      return NextResponse.json({ error: 'No visited places found for trip reel generation' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey && apiKey !== 'your_gemini_api_key') {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `You are an elite culinary storyteller and travel magazine editor for ForkTrail.
Synthesize the following culinary travel data into a high-energy, vertical Instagram/TikTok Story Reel narrative:

Trip Details:
Title: ${trip.title}
Destination: ${trip.destination}
Summary: ${trip.summary}

Logged Visited Venues & Food Photos:
${JSON.stringify(visitedPlaces, null, 2)}

Instructions:
1. Create a punchy overall Reel Headline and Tagline.
2. For each venue stop, write a magazine-grade micro-story narrative (2-3 sentences max) capturing the sensory flavors, atmosphere, and culinary craftsmanship.
3. List 2-3 specific dish highlights for each stop.

Return ONLY a JSON object matching this structure:
{
  "headline": "string",
  "tagline": "string",
  "slides": [
    {
      "venueName": "string",
      "category": "string",
      "rating": 5,
      "photoUrl": "string",
      "narrative": "string",
      "dishHighlights": ["string"],
      "vibeTag": "string",
      "lat": 0.0,
      "lng": 0.0
    }
  ]
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });

        const text = response.text || '';
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const aiReel = JSON.parse(jsonMatch[0]);
          return NextResponse.json({ success: true, method: 'gemini-ai', reel: aiReel });
        }
      } catch (geminiError) {
        console.warn('Gemini AI Reel synthesis error, falling back to smart narrative engine:', geminiError);
      }
    }

    // Smart Fallback Culinary Story Reel Engine
    const slides = visitedPlaces.map((place, idx) => ({
      venueName: place.name,
      category: place.category,
      rating: place.rating,
      photoUrl: place.photoUrls?.[0] || 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80',
      narrative: place.tastingNotes || `An unforgettable stop at ${place.name}. Signature aromas, artisanal craftsmanship, and exquisite textures served in the heart of ${trip.destination}.`,
      dishHighlights: place.dishTags.length ? place.dishTags : ['Chef Signature Dish', 'Umami Highlight'],
      vibeTag: idx % 2 === 0 ? '🔥 High Energy Izakaya Vibe' : '✨ Artisanal Gastronomy',
      lat: place.lat,
      lng: place.lng,
    }));

    const fallbackReel = {
      headline: `The Ultimate Culinary Journey through ${trip.destination}`,
      tagline: `${visitedPlaces.length} Iconic Stops • Michelin Stars • Local Night Markets`,
      slides,
    };

    return NextResponse.json({ success: true, method: 'smart-engine', reel: fallbackReel });
  } catch (error) {
    console.error('Error generating AI story reel:', error);
    return NextResponse.json({ error: 'Failed to generate culinary story reel' }, { status: 500 });
  }
}
