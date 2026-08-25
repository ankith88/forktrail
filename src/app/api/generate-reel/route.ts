import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { MOCK_TRIPS, MOCK_VISITED_PLACES, MOCK_CHAPTERS } from '@/lib/mockData';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tripSlug, occasionPrompt, customPlaces } = body;

    const trip = MOCK_TRIPS.find((t) => t.slug === tripSlug) || MOCK_TRIPS[0];
    const visitedPlaces = customPlaces?.length ? customPlaces : (MOCK_VISITED_PLACES[trip.id] || []);

    if (!visitedPlaces.length) {
      return NextResponse.json({ error: 'No visited places found for trip reel generation' }, { status: 400 });
    }

    const occasionText = occasionPrompt || 'Culinary Discovery Tour';

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey && apiKey !== 'your_gemini_api_key') {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `You are an elite culinary storyteller and travel video editor for ForkTrail.
Synthesize the following culinary travel data and user occasion theme into a 30-second vertical social media story reel:

Occasion Theme / User Initial Prompt: "${occasionText}"
Trip Destination: ${trip.destination}

Logged Visited Venues & Food Photos:
${JSON.stringify(visitedPlaces, null, 2)}

Instructions:
1. Create a 30-second story reel script customized for this specific occasion ("${occasionText}").
2. Create a punchy overall Reel Headline and Tagline tailored to the occasion (e.g. for an Anniversary: "5 Years of Love & Fine Dining", for Birthday: "Ultimate Birthday Feast").
3. Assign an occasion badge (e.g. "🥂 Anniversary Celebration", "🎂 Birthday Feast", "✨ Date Night", "🍜 Foodie Exploration").
4. Pick background music mood: "romantic", "festive", "chill", or "luxury".
5. For each venue stop, write an emotional micro-story narrative (2-3 sentences max) capturing sensory flavors, atmosphere, and the occasion vibe.
6. List 2-3 specific dish highlights for each stop.

Return ONLY a JSON object matching this structure:
{
  "headline": "string",
  "tagline": "string",
  "occasionPrompt": "${occasionText}",
  "occasionBadge": "string",
  "bgMusicMood": "romantic",
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
      "lng": 0.0,
      "timeCode": "00:05"
    }
  ]
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
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

    // Smart Fallback Culinary Story Reel Engine based on occasion prompt
    const isAnniversary = occasionText.toLowerCase().includes('anniversary') || occasionText.toLowerCase().includes('love') || occasionText.toLowerCase().includes('date');
    const isBirthday = occasionText.toLowerCase().includes('birthday') || occasionText.toLowerCase().includes('party') || occasionText.toLowerCase().includes('celebrat');

    let badge = '✨ Culinary Exploration';
    let musicMood: 'romantic' | 'festive' | 'chill' | 'luxury' = 'luxury';
    if (isAnniversary) {
      badge = '🥂 Anniversary Candlelight Special';
      musicMood = 'romantic';
    } else if (isBirthday) {
      badge = '🎂 Birthday Culinary Feast';
      musicMood = 'festive';
    }

    const slides = visitedPlaces.map((place: any, idx: number) => {
      const timeCode = `00:${String((idx + 1) * 5).padStart(2, '0')}`;
      let narrative = place.tastingNotes;

      if (!narrative) {
        if (isAnniversary) {
          narrative = `Toast to unforgettable memories at ${place.name}. Signature aromas, candlelight elegance, and exquisite flavors in the heart of ${trip.destination}.`;
        } else if (isBirthday) {
          narrative = `Celebrating in style at ${place.name}! Extraordinary flavors, vibrant atmosphere, and legendary dishes to mark the occasion.`;
        } else {
          narrative = `An unforgettable stop at ${place.name}. Artisanal craftsmanship and exquisite textures served in ${trip.destination}.`;
        }
      }

      return {
        venueName: place.name,
        category: place.category || 'Fine Dining',
        rating: place.rating || 5,
        photoUrl: place.photoUrls?.[0] || 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80',
        narrative,
        dishHighlights: place.dishTags?.length ? place.dishTags : ['Chef Signature Dish', 'Wine Pairing'],
        vibeTag: isAnniversary ? '🍷 Romantic Candlelight' : idx % 2 === 0 ? '🔥 High Energy Vibe' : '✨ Artisanal Gastronomy',
        lat: place.lat || 35.6875,
        lng: place.lng || 139.6972,
        timeCode,
      };
    });

    const fallbackReel = {
      headline: isAnniversary
        ? `Anniversary Story: Magical Moments in ${trip.destination}`
        : isBirthday
        ? `Birthday Feast: Culinary Journey through ${trip.destination}`
        : `Culinary Journey through ${trip.destination}`,
      tagline: `${visitedPlaces.length} Iconic Stops • Custom Story Arc for "${occasionText}"`,
      occasionPrompt: occasionText,
      occasionBadge: badge,
      bgMusicMood: musicMood,
      slides,
    };

    return NextResponse.json({ success: true, method: 'smart-engine', reel: fallbackReel });
  } catch (error) {
    console.error('Error generating AI story reel:', error);
    return NextResponse.json({ error: 'Failed to generate culinary story reel' }, { status: 500 });
  }
}

