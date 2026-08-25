import { Metadata } from 'next';
import Link from 'next/link';
import { MOCK_USER, MOCK_TRIPS, MOCK_CHAPTERS, MOCK_VISITED_PLACES } from '@/lib/mockData';
import { Compass, Calendar, MapPin, Star, Utensils, Tag, Heart, Share2, ArrowLeft, Award, Globe } from 'lucide-react';
import { formatDate, calculateHaversineDistance } from '@/lib/utils';
import { MapView } from '@/components/Dashboard/MapView';
import { ShareButton } from '@/components/Blog/ShareButton';

interface BlogPageProps {
  params: Promise<{
    username: string;
    tripSlug: string;
  }>;
}

export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  const { username, tripSlug } = await params;
  const trip = MOCK_TRIPS.find((t) => t.slug === tripSlug) || MOCK_TRIPS[0];
  const user = MOCK_USER;

  const title = `${trip.title} — ${user.displayName}'s Food Diary | ForkTrail`;
  const description = trip.summary;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://forktrail.app/blog/${username}/${tripSlug}`,
      siteName: 'ForkTrail',
      images: [
        {
          url: trip.coverUrl,
          width: 1200,
          height: 630,
          alt: trip.title,
        },
      ],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [trip.coverUrl],
    },
  };
}

export default async function PublicBlogPage({ params }: BlogPageProps) {
  const { username, tripSlug } = await params;
  
  const user = MOCK_USER;
  const trip = MOCK_TRIPS.find((t) => t.slug === tripSlug) || MOCK_TRIPS[0];
  const chapters = MOCK_CHAPTERS[trip.id] || [];
  const visitedPlaces = MOCK_VISITED_PLACES[trip.id] || [];

  const totalPlaces = visitedPlaces.length;
  const topRated = visitedPlaces.filter((p) => p.rating === 5).length;
  
  const totalKmTraveled = visitedPlaces.reduce((acc, curr, idx, arr) => {
    if (idx === 0) return 0;
    const prev = arr[idx - 1];
    return acc + calculateHaversineDistance(prev.lat, prev.lng, curr.lat, curr.lng);
  }, 0);

  return (
    <div className="min-h-screen bg-[#FDF8F0] text-[#025259] font-sans selection:bg-[#ff947a] selection:text-[#025259]">
      
      {/* Blog Top Header Navigation (Deep Pine #025259) */}
      <nav className="sticky top-0 z-40 w-full border-b border-[#013b40] bg-[#025259] text-white shadow-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 text-xs font-semibold text-[#FAF3E7] hover:text-[#ff947a] transition">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>

          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ff947a] text-[#025259]">
              <Compass className="h-5 w-5 stroke-[2.5]" />
            </div>
            <span className="font-serif text-lg font-bold text-white">
              Fork<span className="text-[#ff947a]">Trail</span>
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <ShareButton title={trip.title} summary={trip.summary} />
          </div>
        </div>
      </nav>

      {/* Hero Magazine Cover Header */}
      <header className="relative w-full h-[500px] overflow-hidden">
        <img
          src={trip.coverUrl}
          alt={trip.title}
          className="absolute inset-0 h-full w-full object-cover filter brightness-[0.65] contrast-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#025259] via-[#025259]/60 to-transparent" />

        <div className="relative z-10 mx-auto flex h-full max-w-5xl flex-col justify-end px-4 sm:px-6 pb-12 space-y-4 text-white">
          <div className="flex items-center gap-2 text-xs text-[#E3A857] font-bold tracking-wider uppercase">
            <Globe className="h-4 w-4" />
            <span>{trip.destination} • Published Food Diary</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-serif font-extrabold text-white leading-tight">
            {trip.title}
          </h1>

          <p className="text-sm sm:text-base text-[#FAF3E7] max-w-3xl leading-relaxed">
            {trip.summary}
          </p>

          {/* Author Byline */}
          <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-[#03717b]">
            <div className="flex items-center gap-3">
              <img
                src={user.avatarUrl}
                alt={user.displayName}
                className="h-10 w-10 rounded-full border-2 border-[#ff947a] object-cover"
              />
              <div>
                <p className="text-xs font-bold text-white">{user.displayName}</p>
                <p className="text-[11px] text-[#FAF3E7]">@{user.username} • Culinary Traveler</p>
              </div>
            </div>

            <div className="ml-auto flex items-center gap-6 text-xs text-[#FAF3E7]">
              <div>
                <strong className="block text-[#ff947a] text-sm font-bold">{totalPlaces}</strong>
                <span className="text-[10px] text-[#FAF3E7] uppercase font-semibold">Venues</span>
              </div>
              <div>
                <strong className="block text-[#E3A857] text-sm font-bold">{topRated}</strong>
                <span className="text-[10px] text-[#FAF3E7] uppercase font-semibold">5-Star Eats</span>
              </div>
              <div>
                <strong className="block text-white text-sm font-bold">{totalKmTraveled} km</strong>
                <span className="text-[10px] text-[#FAF3E7] uppercase font-semibold">Trail Distance</span>
              </div>
            </div>
          </div>

        </div>
      </header>

      {/* Main Magazine Layout */}
      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-12 space-y-12">
        
        {/* Interactive Reader Route Map */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-serif font-bold text-xl text-[#025259]">Interactive Reader Route Map</h2>
            <span className="text-xs text-stone-600 font-medium">Chronological trail route across {chapters.length} days</span>
          </div>
          <div className="h-[420px]">
            <MapView
              visitedPlaces={visitedPlaces}
              wishlistItems={[]}
              chapters={chapters}
            />
          </div>
        </section>

        {/* Day-by-Day Magazine Story Timeline */}
        <section className="space-y-12">
          {chapters.map((chapter) => {
            const places = visitedPlaces.filter((p) => p.chapterId === chapter.id);

            return (
              <article key={chapter.id} className="space-y-6">
                
                {/* Chapter Day Header */}
                <div className="border-b border-[#025259]/20 pb-4">
                  <div className="flex items-center gap-3 text-[#025259] font-bold text-xs">
                    <span className="px-2.5 py-1 rounded-md bg-[#ff947a] text-[#025259]">
                      Day {chapter.dayNumber}
                    </span>
                    <span className="text-stone-600 font-medium">{formatDate(chapter.date)}</span>
                  </div>
                  <h3 className="font-serif font-bold text-2xl text-[#025259] mt-2">
                    {chapter.title}
                  </h3>
                  {chapter.notes && (
                    <p className="text-sm text-stone-700 italic mt-1 leading-relaxed">
                      "{chapter.notes}"
                    </p>
                  )}
                </div>

                {/* Place Tasting Stories */}
                <div className="space-y-8">
                  {places.map((place) => (
                    <div
                      key={place.id}
                      className="rounded-2xl border border-[#025259]/15 bg-[#FFFFFF] p-6 space-y-4 shadow-md hover:shadow-lg transition"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#025259] bg-[#025259]/10 px-2.5 py-0.5 rounded border border-[#025259]/20">
                              {place.category}
                            </span>
                            <div className="flex items-center gap-1 text-xs font-bold text-[#E3A857]">
                              <Star className="h-3.5 w-3.5 fill-[#E3A857] text-[#E3A857]" />
                              <span>{place.rating}.0 / 5</span>
                            </div>
                          </div>
                          <h4 className="font-serif font-bold text-xl text-[#025259] mt-1">
                            {place.name}
                          </h4>
                          <p className="text-xs text-stone-600 flex items-center gap-1 mt-0.5">
                            <MapPin className="h-3.5 w-3.5 text-[#ff947a]" />
                            <span>{place.address}</span>
                          </p>
                        </div>

                        {place.recommendedDish && (
                          <div className="self-start sm:self-auto rounded-xl bg-[#FDF8F0] border border-[#025259]/15 p-3 text-xs text-[#025259]">
                            <span className="block text-[10px] text-[#ff947a] uppercase font-bold tracking-wider">Top Recommendation</span>
                            <strong className="text-sm text-[#025259]">{place.recommendedDish}</strong>
                          </div>
                        )}
                      </div>

                      {/* Photo Grid */}
                      {place.photoUrls && place.photoUrls.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                          {place.photoUrls.map((url, pIdx) => (
                            <div key={pIdx} className="relative h-64 rounded-xl overflow-hidden border border-stone-200 shadow-sm">
                              <img
                                src={url}
                                alt={`${place.name} photograph ${pIdx + 1}`}
                                className="h-full w-full object-cover hover:scale-105 transition duration-300"
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Tasting Journal Notes */}
                      {place.tastingNotes && (
                        <div className="bg-[#FAF3E7] p-4 rounded-xl border border-[#025259]/10 space-y-1">
                          <span className="text-[10px] text-[#025259] uppercase tracking-widest font-bold">Tasting Notes</span>
                          <p className="text-sm text-[#025259] italic leading-relaxed">
                            "{place.tastingNotes}"
                          </p>
                        </div>
                      )}

                      {/* Dish Tags */}
                      {place.dishTags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {place.dishTags.map((tag, tIdx) => (
                            <span key={tIdx} className="text-xs bg-[#FDF8F0] text-[#025259] px-2.5 py-1 rounded-md border border-[#025259]/15 font-medium">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

              </article>
            );
          })}
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-[#013b40] bg-[#025259] py-12 text-center text-xs text-[#FAF3E7] space-y-3">
        <div className="flex justify-center items-center gap-2">
          <Compass className="h-5 w-5 text-[#ff947a]" />
          <span className="font-serif font-bold text-base text-white">ForkTrail</span>
        </div>
        <p>Published by @{user.username} on ForkTrail — Culinary Travel Diary & Food Blogging Platform</p>
      </footer>

    </div>
  );
}
