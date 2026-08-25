import { Metadata } from 'next';
import { MOCK_TRIPS, MOCK_VISITED_PLACES } from '@/lib/mockData';
import { ReelViewer } from '@/components/Reel/ReelViewer';
import { ReelData } from '@/types';

interface ReelPageProps {
  params: Promise<{
    tripSlug: string;
  }>;
}

export async function generateMetadata({ params }: ReelPageProps): Promise<Metadata> {
  const { tripSlug } = await params;
  const trip = MOCK_TRIPS.find((t) => t.slug === tripSlug) || MOCK_TRIPS[0];

  return {
    title: `${trip.title} — AI Story Reel | Palatero`,
    description: `Watch the vertical AI Culinary Memory Reel for ${trip.title}`,
    openGraph: {
      title: `${trip.title} — AI Culinary Story Reel`,
      description: trip.summary,
      images: [trip.coverUrl],
    },
  };
}

export default async function ReelPage({ params }: ReelPageProps) {
  const { tripSlug } = await params;
  const trip = MOCK_TRIPS.find((t) => t.slug === tripSlug) || MOCK_TRIPS[0];
  const visitedPlaces = MOCK_VISITED_PLACES[trip.id] || [];

  const slides = visitedPlaces.map((place, idx) => ({
    venueName: place.name,
    category: place.category,
    rating: place.rating,
    photoUrl: place.photoUrls?.[0] || 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80',
    narrative: place.tastingNotes || `Unforgettable culinary stop in ${trip.destination}. Signature flavors paired with authentic local atmosphere.`,
    dishHighlights: place.dishTags.length ? place.dishTags : ['Signature Dish', 'Local Favorite'],
    vibeTag: idx % 2 === 0 ? '🔥 High Energy Izakaya' : '✨ Artisanal Gastronomy',
    lat: place.lat,
    lng: place.lng,
  }));

  const reelData: ReelData = {
    headline: `Culinary Journey: ${trip.title}`,
    tagline: trip.summary,
    slides,
  };

  return <ReelViewer tripTitle={trip.title} reelData={reelData} />;
}
