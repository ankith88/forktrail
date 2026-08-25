import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { SocialCaptions } from '@/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const venueName = body.venueName || body.placeName || 'Artisanal Dining Spot';
    const category = body.category || 'Culinary Gem';
    const rating = body.rating || 5;
    const tastingNotes = body.tastingNotes || body.reviewNotes || 'Exceptional depth of flavor, perfect seasoning balance, and vibrant atmosphere.';
    const recommendedDish = body.recommendedDish || (Array.isArray(body.dishTags) && body.dishTags.length > 0 ? body.dishTags.join(', ') : (typeof body.dishTags === 'string' ? body.dishTags : 'Signature House Specialty'));
    const city = body.city || body.destinationCity || 'Tokyo';

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey && apiKey !== 'your_gemini_api_key') {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `You are an elite food & travel writer AI for Palatero.
Synthesize the following venue details into 4 distinct customizable caption formats:

Venue Details:
- Name: ${venueName}
- Category: ${category}
- City/Location: ${city}
- Rating: ${rating}/5 stars
- Tasting Notes: ${tastingNotes}
- Must-Try Dish: ${recommendedDish}

Formats Required:
1. **instagram**: Aesthetic, snappy caption with line breaks, emojis, and relevant food/travel hashtags.
2. **twitter**: Punchy, recommendation-first micro-review strictly UNDER 280 characters with rating and key recommendation.
3. **substack**: Magazine-style, evocative narrative paragraph suited for a travel newsletter.
4. **bourdain**: Poetic, candid, raw travelogue prose in the distinctive voice of Anthony Bourdain (contemplative, gritty, deeply appreciative of authentic food culture).

Return ONLY a JSON object:
{
  "instagram": "string",
  "twitter": "string",
  "substack": "string",
  "bourdain": "string"
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: prompt,
        });

        const text = response.text || '';
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed: SocialCaptions = JSON.parse(jsonMatch[0]);
          return NextResponse.json({ success: true, captions: parsed });
        }
      } catch (err) {
        console.warn('Gemini Caption Generator error, using fallback template synthesis:', err);
      }
    }

    // Fallback Styled Captions Synthesis
    const fallbackCaptions: SocialCaptions = {
      instagram: `Found my new favorite spot in ${city}! ✨🍜\n\n${venueName} blew me away. ${tastingNotes}\n\n⭐ ${rating}/5 Stars\n📌 Must Order: ${recommendedDish}\n\n.#Palatero #TasteTheStory #${city}Eats #FoodieGram #Gastronomy #${category.replace(/\s+/g, '')}`,
      twitter: `If you're in ${city}, do not sleep on ${venueName}. ${rating}/5 ⭐. The ${recommendedDish} is mandatory. ${tastingNotes.slice(0, 100)}... #Palatero #TasteTheStory`,
      substack: `Tucked into the backstreets of ${city}, ${venueName} represents the pinnacle of modern ${category.toLowerCase()}. What strikes you first is the intention behind every detail. The ${recommendedDish} arrives with quiet confidence—${tastingNotes.toLowerCase()} It is the kind of culinary experience that stays with you long after the table is cleared.`,
      bourdain: `You don't just stumble upon a place like ${venueName}—you earn it. In a city as loud as ${city}, this counter serves food without pretense or performance. You bite into the ${recommendedDish}, and suddenly all the noise stops. Good food, cold drink, and the simple truth of craftsmanship. That's all that ever really mattered.`,
    };

    return NextResponse.json({ success: true, method: 'fallback', captions: fallbackCaptions });
  } catch (error) {
    console.error('Error in /api/ai/generate-captions:', error);
    return NextResponse.json({ error: 'Failed to generate social captions' }, { status: 500 });
  }
}
