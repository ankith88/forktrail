import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { PhotoEXIFData, AIProcessedPhotoGroup } from '@/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const photos: PhotoEXIFData[] = body.photos || [];

    if (!photos.length) {
      return NextResponse.json({ error: 'No photo EXIF data provided' }, { status: 400 });
    }

    // 1. Sort photos chronologically by timestamp
    const sortedPhotos = [...photos].sort((a, b) => {
      const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
      const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      return timeA - timeB;
    });

    const apiKey = process.env.GEMINI_API_KEY;

    // 2. Try Gemini AI generation if API key is provided
    if (apiKey && apiKey !== 'your_gemini_api_key') {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `You are a culinary AI travel assistant for ForkTrail.
Analyze the following list of food photo metadata:
${JSON.stringify(sortedPhotos, null, 2)}

Instructions:
1. Group these photos into daily timeline chapters based on dates and time proximity.
2. For each day, suggest a chapter title (e.g., "Day 1: Tsukiji Morning & Shinjuku Night").
3. For each photo or photo group, auto-tag detected dishes (e.g., "Tonkotsu Tsukemen", "Pork Belly Chashu"), suggest a realistic venue name, category (Ramen, Izakaya, Sushi, Café, Fine Dining), rating (1-5), and vivid tasting notes.

Return ONLY a JSON array matching this structure:
[
  {
    "suggestedChapterTitle": "string",
    "date": "YYYY-MM-DD",
    "dayNumber": 1,
    "places": [
      {
        "suggestedVenueName": "string",
        "suggestedCategory": "string",
        "lat": 0.0,
        "lng": 0.0,
        "visitTime": "ISO string",
        "detectedDishes": ["string"],
        "suggestedTastingNotes": "string",
        "suggestedRating": 5,
        "photoUrls": ["string"]
      }
    ]
  }
]`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });

        const text = response.text || '';
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const aiChapters: AIProcessedPhotoGroup[] = JSON.parse(jsonMatch[0]);
          return NextResponse.json({ success: true, method: 'gemini-ai', chapters: aiChapters });
        }
      } catch (geminiError) {
        console.warn('Gemini API execution error, falling back to smart heuristic clustering:', geminiError);
      }
    }

    // 3. Fallback Smart Rule-Based Clustering Engine
    const dayGroups: Record<string, PhotoEXIFData[]> = {};
    for (const photo of sortedPhotos) {
      const dateStr = photo.timestamp
        ? new Date(photo.timestamp).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];
      if (!dayGroups[dateStr]) {
        dayGroups[dateStr] = [];
      }
      dayGroups[dateStr].push(photo);
    }

    const resultChapters: AIProcessedPhotoGroup[] = Object.keys(dayGroups).map((date, index) => {
      const dayPhotos = dayGroups[date];
      const dayNum = index + 1;

      // Group photos taken within 1 hour into the same venue visit
      const venueGroups: PhotoEXIFData[][] = [];
      let currentGroup: PhotoEXIFData[] = [];

      for (const p of dayPhotos) {
        if (!currentGroup.length) {
          currentGroup.push(p);
        } else {
          const lastTime = new Date(currentGroup[currentGroup.length - 1].timestamp || 0).getTime();
          const currTime = new Date(p.timestamp || 0).getTime();
          const diffMinutes = Math.abs(currTime - lastTime) / (1000 * 60);

          if (diffMinutes <= 60) {
            currentGroup.push(p);
          } else {
            venueGroups.push(currentGroup);
            currentGroup = [p];
          }
        }
      }
      if (currentGroup.length) {
        venueGroups.push(currentGroup);
      }

      const places = venueGroups.map((group, gIdx) => {
        const firstPhoto = group[0];
        const lowerName = firstPhoto.fileName.toLowerCase();

        let category = 'Culinary Gem';
        let venueName = `Dining Spot #${gIdx + 1}`;
        let dishes = ['Chef Specialty', 'Signature Dish'];

        if (lowerName.includes('ramen') || lowerName.includes('noodle') || lowerName.includes('soup')) {
          category = 'Ramen';
          venueName = 'Ichiran / Local Ramen Shop';
          dishes = ['Rich Tonkotsu Broth', 'Soft Boiled Ajitama', 'Crispy Nori'];
        } else if (lowerName.includes('sushi') || lowerName.includes('fish') || lowerName.includes('tuna')) {
          category = 'Sushi';
          venueName = 'Sushiko Outer Market';
          dishes = ['Fatty Tuna Nigiri', 'Hokkaido Sea Urchin', 'Fresh Wasabi'];
        } else if (lowerName.includes('coffee') || lowerName.includes('cafe') || lowerName.includes('latte')) {
          category = 'Café';
          venueName = 'Artisan Roastery';
          dishes = ['Single Origin Filter Coffee', 'Matcha Chiffon Cake'];
        } else if (lowerName.includes('pasta') || lowerName.includes('pizza') || lowerName.includes('truffle')) {
          category = 'Italian';
          venueName = 'Trattoria del Sole';
          dishes = ['Handmade Tagliolini', 'Fresh Black Truffle Shavings'];
        }

        return {
          suggestedVenueName: venueName,
          suggestedCategory: category,
          lat: firstPhoto.lat || 35.6875 + gIdx * 0.005,
          lng: firstPhoto.lng || 139.6972 + gIdx * 0.005,
          visitTime: firstPhoto.timestamp || new Date().toISOString(),
          detectedDishes: dishes,
          suggestedTastingNotes: `Captured incredible flavors with balanced seasonings. Crisp texture and remarkable presentation.`,
          suggestedRating: 5,
          photoUrls: group.map(g => g.previewUrl),
        };
      });

      return {
        suggestedChapterTitle: `Day ${dayNum}: Culinary Discoveries on ${date}`,
        date,
        dayNumber: dayNum,
        places,
      };
    });

    return NextResponse.json({ success: true, method: 'smart-heuristic', chapters: resultChapters });
  } catch (error) {
    console.error('Error in /api/process-photos:', error);
    return NextResponse.json({ error: 'Failed to process photo timeline' }, { status: 500 });
  }
}
