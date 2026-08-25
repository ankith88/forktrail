import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { VisitedPlace } from '@/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { visit, style = 'bourdain' } = body as { visit: VisitedPlace; style?: string };

    if (!visit || !visit.name) {
      return NextResponse.json({ error: 'Missing visit data for story generation' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    const stylePrompts: Record<string, string> = {
      bourdain: 'Gritty, evocative, poetic, Anthony Bourdain style travelogue narrative focusing on authentic flavor, human connection, street vibe, and cultural soul.',
      michelin: 'Refined, sophisticated Michelin Guide Inspector review style focusing on precision, technique, ingredient quality, flavor profile balance, and ambiance.',
      memoir: 'Warm, personal culinary travel memoir with emotional nostalgia, vivid sensory descriptions of taste and aroma, and memorable storytelling.',
      foodie_vlog: 'Vibrant, high-energy modern foodie blog post with engaging descriptions, dish highlights, rating commentary, and trendy culinary enthusiasm.',
      poetic: 'Sensory, atmospheric, poetic prose capturing the light, aromas, sounds, textures, and soul of the dining experience.',
    };

    const styleGuide = stylePrompts[style] || stylePrompts.bourdain;

    if (apiKey && apiKey !== 'your_gemini_api_key') {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `You are a master food writer and travel journalist.
Write an engaging 3 to 4 paragraph written story for a specific dining visit capture.

Style / Tone: ${styleGuide}

Visit Details:
- Venue Name: ${visit.name}
- Category / Cuisine: ${visit.category}
- Address / Location: ${visit.address}
- Date Visited: ${visit.localDate || visit.visitTime}
- Meal Period: ${visit.mealType || 'Dining'}
- Rating: ${visit.rating} / 5 Stars
- Occasion / Theme: ${visit.occasion || 'Culinary Discovery'} ${visit.celebrationReason ? `(${visit.celebrationReason})` : ''}
- Must-Order Dish: ${visit.recommendedDish || 'Chef Special'}
- Labeled Dishes: ${JSON.stringify(visit.photos?.map((p) => p.dishName).filter(Boolean) || visit.dishTags || [])}
- Raw Tasting Notes / Impressions: "${visit.tastingNotes || 'Delicious local gastronomy'}"

Instructions:
1. Write a captivating, immersive written story (around 200-300 words).
2. Incorporate sensory details (fragrance, texture, ambience, taste balance) and highlight the dishes tried.
3. WEAVE in the occasion or celebration if provided.
4. Do NOT include markdown code fences; output pure text formatted into 3-4 paragraphs separated by double line breaks.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: prompt,
        });

        const storyText = response.text?.trim();

        if (storyText) {
          return NextResponse.json({
            success: true,
            method: 'gemini-ai',
            story: storyText,
            style,
          });
        }
      } catch (geminiError) {
        console.warn('Gemini AI story generation error, using fallback narrative engine:', geminiError);
      }
    }

    // Smart Fallback Story Engine
    const dishList = (visit.photos?.map((p) => p.dishName).filter(Boolean) as string[]) || [];
    const mainDish = visit.recommendedDish || dishList[0] || 'the chef’s signature creation';
    const placeName = visit.name;
    const occasionStr = visit.celebrationReason
      ? `marking a special milestone: ${visit.celebrationReason}`
      : visit.occasion
      ? `on a ${visit.occasion.replace('_', ' ')} outing`
      : 'on a memorable culinary search';

    let fallbackStory = '';

    if (style === 'michelin') {
      fallbackStory = `At ${placeName}, the culinary execution stands out through meticulous attention to detail and harmonious flavor profiles. Stepping into the venue, one is immediately struck by the curated ambiance designed to elevate every sense.

The centerpiece of the visit was undoubtedly ${mainDish}. Each element on the plate displayed disciplined culinary technique, balancing acidity, richness, and textural contrast. ${
        visit.tastingNotes ? `Notes from our inspection: "${visit.tastingNotes}".` : 'The ingredients spoke of pristine quality and local provenance.'
      }

Scoring ${visit.rating} out of 5 stars, ${placeName} exemplifies high caliber ${visit.category.toLowerCase()} craftsmanship. A essential destination for discerning gourmands.`;
    } else if (style === 'memoir') {
      fallbackStory = `Some meals linger in memory long after the last bite, and our visit to ${placeName} ${occasionStr} was precisely one of those moments. The atmosphere hummed with warmth as dishes arrived at the table.

We ordered ${mainDish}, which delivered a rush of comforting aromas and vivid textures. ${
        visit.tastingNotes ? `As noted in our travel journal: "${visit.tastingNotes}".` : 'Every bite felt like a tribute to the craftsmanship of the kitchen.'
      }

Sitting around the table at ${placeName}, surrounded by laughter and extraordinary food, reminded us why we travel and log these culinary trails. Rated ${visit.rating}/5 stars.`;
    } else if (style === 'foodie_vlog') {
      fallbackStory = `If you're looking for an absolute must-visit spot, put ${placeName} at the top of your list! We visited for ${visit.mealType || 'a feast'} ${occasionStr}, and the food experience exceeded every expectation.

The absolute superstar of the table was ${mainDish}! The flavors were bold, delicious, and photo-ready. ${
        visit.tastingNotes ? `Here’s the breakdown: "${visit.tastingNotes}".` : 'The presentation was on point and the taste delivered 100%.'
      }

Giving ${placeName} a solid ${visit.rating}/5 stars! Make sure to save this spot for your next food crawl! 🍷🔥`;
    } else {
      // Bourdain default
      fallbackStory = `There is something sacred about sitting down at a venue like ${placeName}. It is not just about the fuel; it is about the story written in broth, spice, and heat. We arrived ${occasionStr}, pulled in by the promise of authentic ${visit.category}.

The kitchen delivered ${mainDish} with uncompromising passion. ${
        visit.tastingNotes ? `The sensory truth of the dish: "${visit.tastingNotes}".` : 'Complex, comforting, and deeply rooted in culinary tradition.'
      }

${placeName} earns its ${visit.rating}-star badge not through pretension, but through honesty on the plate. A culinary capture worth remembering.`;
    }

    return NextResponse.json({
      success: true,
      method: 'smart-engine',
      story: fallbackStory,
      style,
    });
  } catch (error) {
    console.error('Error generating visit story:', error);
    return NextResponse.json({ error: 'Failed to generate visit story' }, { status: 500 });
  }
}
