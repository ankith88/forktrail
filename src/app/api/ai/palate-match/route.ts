import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { TasteProfile, VisitedPlace } from '@/types';
import { adminDb } from '@/lib/firebase/admin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action = 'match-venue', userId, visitedPlaces = [], venue, favoriteCuisines = [] } = body;

    const apiKey = process.env.GEMINI_API_KEY;

    if (action === 'compute-profile') {
      // Generate Taste Profile from cumulative visited places & user preferences
      let computedProfile: TasteProfile = {
        summary: 'Adventurous Explorer favoring umami-rich broths, artisanal coffee, and wood-fired gastronomy.',
        topCuisines: favoriteCuisines.length ? favoriteCuisines : ['Japanese', 'Artisanal Bakery', 'Modern Italian', 'Cocktail Bar'],
        keyFlavors: ['Umami', 'Fermented', 'Smoky', 'Charcoal', 'Yuzu', 'Single-Origin Coffee'],
        diningStyle: 'High-craft casual to intimate hidden neighborhood gems',
        computedAt: new Date().toISOString(),
      };

      if (apiKey && apiKey !== 'your_gemini_api_key' && visitedPlaces.length > 0) {
        try {
          const ai = new GoogleGenAI({ apiKey });
          const placesSummary = visitedPlaces.map((p: VisitedPlace) => ({
            name: p.name,
            category: p.category,
            rating: p.rating,
            tastingNotes: p.tastingNotes,
            dishTags: p.dishTags,
            recommendedDish: p.recommendedDish,
          }));

          const prompt = `You are an elite culinary palate analyzer AI for Palatero.
Analyze the user's dining history (visited places with ratings and tasting notes):
${JSON.stringify(placesSummary, null, 2)}
User Favorite Cuisines: ${favoriteCuisines.join(', ')}

Compute a refined, personalized TasteProfile for this user.
Return ONLY JSON matching:
{
  "summary": "1-2 sentence evocative culinary personality summary",
  "topCuisines": ["string"],
  "keyFlavors": ["string"],
  "diningStyle": "string"
}`;

          const response = await ai.models.generateContent({
            model: 'gemini-3.6-flash',
            contents: prompt,
          });

          const text = response.text || '';
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            computedProfile = {
              summary: parsed.summary || computedProfile.summary,
              topCuisines: parsed.topCuisines || computedProfile.topCuisines,
              keyFlavors: parsed.keyFlavors || computedProfile.keyFlavors,
              diningStyle: parsed.diningStyle || computedProfile.diningStyle,
              computedAt: new Date().toISOString(),
            };
          }
        } catch (err) {
          console.warn('Gemini TasteProfile generation error, using smart fallback:', err);
        }
      }

      // Store Taste Profile in Firestore if userId is present
      if (userId && userId !== 'user_active') {
        try {
          await adminDb.collection('users').doc(userId).set(
            { tasteProfile: computedProfile, updatedAt: new Date().toISOString() },
            { merge: true }
          );
        } catch (fsError) {
          console.warn('Firestore user tasteProfile write skipped/failed:', fsError);
        }
      }

      return NextResponse.json({ success: true, tasteProfile: computedProfile });
    }

    // Default Action: 'match-venue'
    // Compares a target venue against user's profile or visited history
    if (!venue) {
      return NextResponse.json({ error: 'Venue details required for palate matching' }, { status: 400 });
    }

    const activeTasteProfile: TasteProfile = body.tasteProfile || {
      summary: 'Adventurous Explorer favoring umami-rich broths, artisanal coffee, natural wines, and wood-fired gastronomy.',
      topCuisines: favoriteCuisines.length ? favoriteCuisines : ['Ramen', 'Japanese', 'Artisanal Bakery', 'Cocktail Bar'],
      keyFlavors: ['Umami', 'Fermented', 'Smoky', 'Single-Origin', 'Wild Yeast'],
      diningStyle: 'High-craft casual and hidden culinary gems',
      computedAt: new Date().toISOString(),
    };

    if (apiKey && apiKey !== 'your_gemini_api_key') {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `You are Palatero's Palate Matchmaker AI.
Compare the user's Taste Profile with the target venue metadata:

User Taste Profile:
${JSON.stringify(activeTasteProfile, null, 2)}

Target Venue Metadata:
Name: ${venue.name}
Category: ${venue.category || 'Dining Spot'}
Address: ${venue.address || ''}
Notes/Description: ${venue.notes || venue.description || ''}

Calculate a Palate Match percentage score (between 70% and 99%) and a single crisp, persuasive reasoning sentence highlighting why this venue fits their taste.

Return ONLY a JSON object:
{
  "matchPercentage": 94,
  "reasoning": "94% Match — Fits your love for natural wines and wood-fired sourdough"
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: prompt,
        });

        const text = response.text || '';
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return NextResponse.json({
            success: true,
            matchPercentage: parsed.matchPercentage || 92,
            reasoning: parsed.reasoning || `92% Match — Aligns with your love for ${venue.category || 'artisan culinary spots'}.`,
          });
        }
      } catch (err) {
        console.warn('Gemini Palate Matcher error, using heuristic match:', err);
      }
    }

    // Heuristic Fallback Match Score
    const venueNameLower = (venue.name || '').toLowerCase();
    const venueCatLower = (venue.category || '').toLowerCase();
    let score = 88;
    let highlight = 'artisan flavors and atmosphere';

    if (venueCatLower.includes('ramen') || venueNameLower.includes('ramen') || venueCatLower.includes('japanese')) {
      score = 96;
      highlight = 'rich umami broths and artisanal noodles';
    } else if (venueCatLower.includes('coffee') || venueCatLower.includes('bakery') || venueNameLower.includes('cafe')) {
      score = 93;
      highlight = 'single-origin coffee and handcrafted pastries';
    } else if (venueCatLower.includes('bar') || venueCatLower.includes('cocktail') || venueCatLower.includes('wine')) {
      score = 94;
      highlight = 'natural wines and craft cocktail mixology';
    }

    return NextResponse.json({
      success: true,
      method: 'heuristic',
      matchPercentage: score,
      reasoning: `${score}% Match — Fits your passion for ${highlight}.`,
    });
  } catch (error) {
    console.error('Error in /api/ai/palate-match:', error);
    return NextResponse.json({ error: 'Failed to compute palate match' }, { status: 500 });
  }
}
