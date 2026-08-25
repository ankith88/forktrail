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

    const occasionText = occasionPrompt || (visitedPlaces[0]?.celebrationReason ? `${visitedPlaces[0].occasion || 'Celebration'}: ${visitedPlaces[0].celebrationReason}` : visitedPlaces[0]?.occasion || 'Culinary Discovery Tour');

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey && apiKey !== 'your_gemini_api_key') {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `You are an elite culinary storyteller and travel video editor for Palatero.
Synthesize the following culinary travel data, user occasion theme, labeled food photos, and celebration details into a 30-second vertical social media story reel:

Occasion / Celebration Theme: "${occasionText}"
Trip / Location: ${trip.destination}

Logged Visited Venues & Food Photos (including dish names, tasting notes, occasion):
${JSON.stringify(visitedPlaces, null, 2)}

Instructions:
1. Create a 30-second story reel script customized for this specific occasion ("${occasionText}").
2. Create a punchy overall Reel Headline and Tagline tailored to the occasion (e.g. for an Anniversary: "5 Years of Love & Fine Dining", for Birthday: "Ultimate Birthday Feast").
3. Assign an occasion badge (e.g. "🥂 Anniversary Celebration", "🎂 Birthday Feast", "✨ Date Night", "🍜 Foodie Exploration").
4. Pick background music mood: "romantic", "festive", "chill", or "luxury".
5. For each photo/dish stop, include the dishName (if specified in photo or recommendedDish) and write an emotional micro-story narrative (2-3 sentences max) capturing sensory flavors, atmosphere, and the occasion vibe.
6. List 2-3 specific dish highlights for each slide.

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
      "dishName": "string",
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

    // Smart Fallback Culinary Story Reel Engine based on occasion prompt & photos
    const firstPlace = visitedPlaces[0] || {};
    const occStr = (occasionText + ' ' + (firstPlace.occasion || '') + ' ' + (firstPlace.celebrationReason || '')).toLowerCase();
    const isAnniversary = occStr.includes('anniversary') || occStr.includes('love') || occStr.includes('date');
    const isBirthday = occStr.includes('birthday') || occStr.includes('party') || occStr.includes('celebrat');

    let badge = '✨ Culinary Exploration';
    let musicMood: 'romantic' | 'festive' | 'chill' | 'luxury' = 'luxury';
    if (isAnniversary) {
      badge = '🥂 Anniversary Candlelight Special';
      musicMood = 'romantic';
    } else if (isBirthday) {
      badge = '🎂 Birthday Culinary Feast';
      musicMood = 'festive';
    }

    // Flatten photos across visited places into slides
    const rawSlides: any[] = [];
    visitedPlaces.forEach((place: any) => {
      const placePhotos = place.photos?.length
        ? place.photos
        : (place.photoUrls || []).map((url: string) => ({ url, dishName: place.recommendedDish || 'Chef Special' }));

      if (!placePhotos.length) {
        placePhotos.push({
          url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80',
          dishName: place.recommendedDish || 'Chef Special',
        });
      }

      placePhotos.forEach((photoObj: any) => {
        rawSlides.push({
          venueName: place.name,
          category: place.category || 'Fine Dining',
          rating: place.rating || 5,
          photoUrl: photoObj.url || photoObj,
          dishName: photoObj.dishName || place.recommendedDish || 'Signature Dish',
          tastingNotes: place.tastingNotes,
          celebrationReason: place.celebrationReason,
          dishTags: place.dishTags,
          lat: place.lat || 35.6875,
          lng: place.lng || 139.6972,
        });
      });
    });

    const slides = rawSlides.slice(0, 6).map((item: any, idx: number) => {
      const timeCode = `00:${String((idx + 1) * 5).padStart(2, '0')}`;
      let narrative = item.tastingNotes;

      if (!narrative) {
        if (item.celebrationReason) {
          narrative = `Celebrating at ${item.venueName}! "${item.celebrationReason}" - savoring ${item.dishName || 'extraordinary flavors'}.`;
        } else if (isAnniversary) {
          narrative = `Toast to unforgettable memories at ${item.venueName}. Featuring ${item.dishName || 'signature delicacies'} with candlelight elegance.`;
        } else if (isBirthday) {
          narrative = `Birthday feast in full swing at ${item.venueName}! Highlighting ${item.dishName || 'legendary creations'}.`;
        } else {
          narrative = `An unforgettable stop at ${item.venueName} savoring ${item.dishName || 'artisanal flavors'}.`;
        }
      }

      return {
        venueName: item.venueName,
        category: item.category,
        rating: item.rating,
        photoUrl: item.photoUrl,
        dishName: item.dishName,
        narrative,
        dishHighlights: item.dishTags?.length ? item.dishTags : [item.dishName, 'Chef Specialty'],
        vibeTag: isAnniversary ? '🍷 Romantic Candlelight' : idx % 2 === 0 ? '🔥 High Energy Vibe' : '✨ Artisanal Gastronomy',
        lat: item.lat,
        lng: item.lng,
        timeCode,
      };
    });

    const fallbackReel = {
      headline: firstPlace.celebrationReason
        ? `${firstPlace.name}: ${firstPlace.celebrationReason}`
        : isAnniversary
        ? `Anniversary Story: Magical Moments in ${trip.destination || 'Tokyo'}`
        : isBirthday
        ? `Birthday Feast: Culinary Journey through ${trip.destination || 'Tokyo'}`
        : `Culinary Journey through ${trip.destination || 'Tokyo'}`,
      tagline: `${slides.length} Labeled Dish Slides • Custom Story Arc for "${occasionText}"`,
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

