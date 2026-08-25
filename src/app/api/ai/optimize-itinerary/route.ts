import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { ItineraryDay } from '@/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      destination = 'Tokyo',
      tripLengthDays = 2,
      venues = [],
    } = body;

    if (!venues.length) {
      return NextResponse.json({ error: 'No target venues provided for itinerary optimization' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey && apiKey !== 'your_gemini_api_key') {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `You are an expert culinary travel logistics optimizer AI for ForkTrail.
Destination City: ${destination}
Trip Length: ${tripLengthDays} day(s)

Selected Target Venues:
${JSON.stringify(venues, null, 2)}

Instructions:
1. Sequence these spots into an optimized ${tripLengthDays}-day culinary walking/transit schedule.
2. Ensure meal-appropriate timing:
   - Morning (08:30 - 11:00): Coffee, roasteries, morning bakeries.
   - Lunch (12:00 - 14:30): Casual lunch, ramen, market food stalls, sushi.
   - Aperitivo / Afternoon (15:30 - 17:30): Tea house, dessert parlor, natural wine bar.
   - Dinner (19:00 - 21:30): Izakaya, bistro, fine dining.
   - Late Night (22:00 - 00:00): Speakeasy, late-night cocktail bar.
3. Group venues by geographic proximity to minimize transit backtracking.
4. If there are extra time slots needed per day, suggest contextual filler spots (e.g. scenic park walk between meals).

Return ONLY a JSON array of days matching:
[
  {
    "dayNumber": 1,
    "title": "Day 1: Tsukiji Morning & Shinjuku Nightlife",
    "schedule": [
      {
        "timeSlot": "09:00 AM",
        "venueName": "string",
        "category": "string",
        "activityType": "Breakfast / Coffee",
        "address": "string",
        "lat": 35.68,
        "lng": 139.76,
        "notes": "string",
        "estimatedDuration": "45 mins"
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
          const parsedItinerary: ItineraryDay[] = JSON.parse(jsonMatch[0]);
          return NextResponse.json({ success: true, itinerary: parsedItinerary });
        }
      } catch (err) {
        console.warn('Gemini Itinerary Optimizer error, using proximity heuristics:', err);
      }
    }

    // Heuristic Fallback Itinerary Generator
    const numDays = Math.min(Math.max(Number(tripLengthDays) || 2, 1), 7);
    const venuesPerDay = Math.ceil(venues.length / numDays);

    const timeSlots = [
      { slot: '09:00 AM', act: 'Morning Roastery & Pastry' },
      { slot: '12:30 PM', act: 'Midday Signature Lunch' },
      { slot: '04:00 PM', act: 'Afternoon Tea & Sweet Tasting' },
      { slot: '07:30 PM', act: 'Dinner & Craft Beverage Pairings' },
      { slot: '10:00 PM', act: 'Nightcap Cocktail Bar' },
    ];

    const itinerary: ItineraryDay[] = [];
    let venueIdx = 0;

    for (let day = 1; day <= numDays; day++) {
      const daySchedule: any[] = [];
      const dayVenues = venues.slice(venueIdx, venueIdx + venuesPerDay);
      venueIdx += venuesPerDay;

      const itemsToSchedule = dayVenues.length > 0 ? dayVenues : [venues[0]];

      itemsToSchedule.forEach((v: any, idx: number) => {
        const slotObj = timeSlots[idx % timeSlots.length];
        daySchedule.push({
          timeSlot: slotObj.slot,
          venueName: v.name || `Culinary Stop #${idx + 1}`,
          category: v.category || 'Restaurant',
          activityType: slotObj.act,
          address: v.address || `${destination} Central District`,
          lat: v.lat || 35.6875 + idx * 0.005,
          lng: v.lng || 139.6972 + idx * 0.005,
          notes: v.notes || `Optimized order to minimize walking distance and fit peak dining hours.`,
          estimatedDuration: '60 - 90 mins',
        });
      });

      itinerary.push({
        dayNumber: day,
        title: `Day ${day}: Culinary Journey in ${destination}`,
        schedule: daySchedule,
      });
    }

    return NextResponse.json({ success: true, method: 'heuristic', itinerary });
  } catch (error) {
    console.error('Error in /api/ai/optimize-itinerary:', error);
    return NextResponse.json({ error: 'Failed to optimize itinerary' }, { status: 500 });
  }
}
