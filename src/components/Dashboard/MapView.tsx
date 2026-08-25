'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF, PolylineF, InfoWindowF } from '@react-google-maps/api';
import { VisitedPlace, WishlistItem, TimelineChapter } from '@/types';
import { Star, MapPin, Heart, Utensils, Calendar, ExternalLink, CheckCircle2, ChevronRight, Compass, Navigation, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MapViewProps {
  visitedPlaces: VisitedPlace[];
  wishlistItems: WishlistItem[];
  chapters: TimelineChapter[];
  selectedPlaceId?: string | null;
  onSelectPlace?: (place: VisitedPlace | WishlistItem | null) => void;
  onConvertToVisited?: (item: WishlistItem) => void;
  activeDayFilter?: number | 'all';
  onSelectDayFilter?: (day: number | 'all') => void;
  onOpenVisitStory?: (visit: VisitedPlace) => void;
}

const defaultMapContainerStyle = {
  width: '100%',
  height: '100%',
};

// Default fallback city center (Sydney CBD) if geolocation unavailable and no places logged
const DEFAULT_CENTER = { lat: -33.8688, lng: 151.2093 };

// Warm light map style palette matching #FDF8F0 cream canvas
const warmMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#FDF8F0' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#FFFFFF' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#025259' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#025259' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#025259' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#E8F3EE' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#FFFFFF' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#E5DBCB' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#71717a' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#D4EBEA' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#025259' }] },
];

export function MapView({
  visitedPlaces,
  wishlistItems,
  chapters,
  selectedPlaceId,
  onSelectPlace,
  onConvertToVisited,
  activeDayFilter = 'all',
  onSelectDayFilter,
  onOpenVisitStory,
}: MapViewProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
  const isGoogleMapsReady = Boolean(apiKey && apiKey !== 'your_google_maps_api_key');

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: isGoogleMapsReady ? apiKey : '',
  });

  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [activeInfoWindow, setActiveInfoWindow] = useState<VisitedPlace | WishlistItem | null>(null);

  // Geolocation detector
  const requestUserLocation = () => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(coords);
          setIsLocating(false);
          if (mapInstance) {
            mapInstance.panTo(coords);
            mapInstance.setZoom(14);
          }
        },
        (error) => {
          console.warn('Geolocation error or permission denied:', error);
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    }
  };

  useEffect(() => {
    requestUserLocation();
  }, []);

  useEffect(() => {
    if (mapInstance && userLocation) {
      mapInstance.panTo(userLocation);
    }
  }, [mapInstance, userLocation]);

  // Filter visited places based on selected day chapter
  const filteredVisitedPlaces = useMemo(() => {
    if (activeDayFilter === 'all') return visitedPlaces;
    const chapter = chapters.find(c => c.dayNumber === activeDayFilter);
    if (!chapter) return visitedPlaces;
    return visitedPlaces.filter(p => p.chapterId === chapter.id);
  }, [visitedPlaces, activeDayFilter, chapters]);

  // Center map dynamically based on user location, places, or fallback city
  const center = useMemo(() => {
    if (userLocation) {
      return userLocation;
    }
    if (visitedPlaces.length > 0) {
      return { lat: visitedPlaces[0].lat, lng: visitedPlaces[0].lng };
    }
    if (wishlistItems.length > 0) {
      return { lat: wishlistItems[0].lat, lng: wishlistItems[0].lng };
    }
    return DEFAULT_CENTER;
  }, [userLocation, visitedPlaces, wishlistItems]);

  // Polyline routes connecting places chronologically per day
  const polylineRoutes = useMemo(() => {
    const routesByDay: Record<number, { lat: number; lng: number }[]> = {};

    chapters.forEach(chap => {
      const placesInChap = visitedPlaces
        .filter(p => p.chapterId === chap.id)
        .sort((a, b) => new Date(a.visitTime).getTime() - new Date(b.visitTime).getTime());
      
      if (placesInChap.length > 1) {
        routesByDay[chap.dayNumber] = placesInChap.map(p => ({ lat: p.lat, lng: p.lng }));
      }
    });

    return routesByDay;
  }, [chapters, visitedPlaces]);

  // Brand palette for day routes: Salmon (#ff947a), Pine (#025259), Muted Gold (#E3A857)
  const dayColors = ['#ff947a', '#025259', '#E3A857', '#03717b', '#f08368'];

  return (
    <div className="relative w-full h-full min-h-[450px] rounded-2xl overflow-hidden border border-[#025259]/20 bg-[#FFFFFF] shadow-xl flex flex-col">
      
      {/* Day Filter Route Controls (Top-Left Scrollable Pill Bar) */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 bg-[#FFFFFF]/95 backdrop-blur-md p-1.5 rounded-xl border border-[#025259]/15 shadow-md max-w-[calc(100%-1.5rem)] overflow-x-auto">
        <button
          onClick={() => onSelectDayFilter && onSelectDayFilter('all')}
          className={cn(
            "px-2.5 py-1 text-xs font-bold rounded-lg transition-all shrink-0",
            activeDayFilter === 'all'
              ? "bg-[#ff947a] text-[#025259] shadow-sm"
              : "text-[#025259] hover:bg-[#FDF8F0]"
          )}
        >
          All Days ({visitedPlaces.length})
        </button>
        {chapters.map((chap, idx) => (
          <button
            key={chap.id}
            onClick={() => onSelectDayFilter && onSelectDayFilter(chap.dayNumber)}
            className={cn(
              "px-2.5 py-1 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all shrink-0",
              activeDayFilter === chap.dayNumber
                ? "bg-[#025259] text-white shadow-sm"
                : "text-[#025259] hover:bg-[#FDF8F0]"
            )}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: dayColors[idx % dayColors.length] }}
            />
            Day {chap.dayNumber}
          </button>
        ))}

        <button
          onClick={requestUserLocation}
          disabled={isLocating}
          title="Center map on your current location"
          className={cn(
            "px-2.5 py-1 text-xs font-bold rounded-lg flex items-center gap-1 transition-all border shrink-0",
            userLocation
              ? "bg-[#025259] text-white border-[#025259] shadow-sm hover:bg-[#03717b]"
              : "bg-[#FFFFFF] text-[#025259] border-[#025259]/20 hover:bg-[#FAF3E7]"
          )}
        >
          <Navigation className={cn("h-3 w-3 text-[#ff947a]", isLocating && "animate-spin")} />
          <span>{isLocating ? 'Locating...' : 'My Location'}</span>
        </button>
      </div>

      {/* Map Legend Overlay (Positioned Bottom-Left to Avoid Top Controls Collision) */}
      <div className="absolute bottom-4 left-3 z-20 flex flex-wrap items-center gap-2.5 bg-[#FFFFFF]/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#025259]/15 text-xs text-[#025259] font-medium shadow-md">
        {userLocation && (
          <span className="flex items-center gap-1.5 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB] shadow-sm animate-ping" />
            Your Location
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff947a] shadow-sm" />
          Visited
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#025259] shadow-sm" />
          Want to Visit
        </span>
      </div>

      {/* Google Maps JS Render */}
      {isGoogleMapsReady && isLoaded ? (
        <GoogleMap
          mapContainerStyle={defaultMapContainerStyle}
          center={center}
          zoom={13}
          onLoad={(map) => setMapInstance(map)}
          options={{
            styles: warmMapStyle,
            disableDefaultUI: false,
            zoomControl: true,
          }}
        >
          {/* User Current Location Marker */}
          {userLocation && (
            <MarkerF
              key="user-current-location-2d"
              position={userLocation}
              title="Your Current Location"
              icon={{
                path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
                fillColor: '#2563EB',
                fillOpacity: 1,
                strokeColor: '#FFFFFF',
                strokeWeight: 2,
                scale: 2,
              }}
            />
          )}

          {/* Visited Places Markers (Salmon #ff947a) */}
          {filteredVisitedPlaces.map((place) => (
            <MarkerF
              key={`visited-${place.id}`}
              position={{ lat: place.lat, lng: place.lng }}
              onClick={() => {
                setActiveInfoWindow(place);
                onSelectPlace?.(place);
              }}
              icon={{
                path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
                fillColor: '#ff947a',
                fillOpacity: 1,
                strokeColor: '#025259',
                strokeWeight: 1.5,
                scale: 1.8,
              }}
            />
          ))}

          {/* Wishlist Markers (Deep Pine #025259) */}
          {wishlistItems.map((item) => (
            <MarkerF
              key={`wishlist-${item.id}`}
              position={{ lat: item.lat, lng: item.lng }}
              onClick={() => {
                setActiveInfoWindow(item);
                onSelectPlace?.(item);
              }}
              icon={{
                path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
                fillColor: '#025259',
                fillOpacity: 0.95,
                strokeColor: '#ff947a',
                strokeWeight: 1.5,
                scale: 1.6,
              }}
            />
          ))}

          {/* Day Polyline Routes */}
          {Object.entries(polylineRoutes).map(([dayNumStr, path]) => {
            const dayNum = parseInt(dayNumStr, 10);
            if (activeDayFilter !== 'all' && activeDayFilter !== dayNum) return null;
            return (
              <PolylineF
                key={`route-day-${dayNum}`}
                path={path}
                options={{
                  strokeColor: dayColors[(dayNum - 1) % dayColors.length],
                  strokeOpacity: 0.85,
                  strokeWeight: 4,
                  geodesic: true,
                }}
              />
            );
          })}

          {/* Info Window Card */}
          {activeInfoWindow && (
            <InfoWindowF
              position={{ lat: activeInfoWindow.lat, lng: activeInfoWindow.lng }}
              onCloseClick={() => setActiveInfoWindow(null)}
            >
              <div className="p-1 max-w-xs text-[#025259]">
                <h4 className="font-bold text-sm text-[#025259]">{activeInfoWindow.name}</h4>
                <p className="text-xs text-stone-600 truncate">{activeInfoWindow.address}</p>
                {'rating' in activeInfoWindow && (
                  <div className="flex items-center gap-1 mt-1 text-xs text-[#E3A857] font-semibold">
                    <Star className="w-3.5 h-3.5 fill-[#E3A857] text-[#E3A857]" />
                    <span>{activeInfoWindow.rating} / 5</span>
                    <span className="text-stone-500 font-normal">({(activeInfoWindow as VisitedPlace).category})</span>
                  </div>
                )}
                {'priority' in activeInfoWindow && (
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#025259]/10 text-[#025259]">
                      {(activeInfoWindow as WishlistItem).priority}
                    </span>
                    {onConvertToVisited && (
                      <button
                        onClick={() => {
                          onConvertToVisited(activeInfoWindow as WishlistItem);
                          setActiveInfoWindow(null);
                        }}
                        className="text-xs bg-[#ff947a] text-[#025259] font-bold px-2 py-1 rounded hover:bg-[#f08368] transition"
                      >
                        Mark Visited
                      </button>
                    )}
                  </div>
                )}
              </div>
            </InfoWindowF>
          )}
        </GoogleMap>
      ) : (
        /* Fallback Interactive Visual Map Canvas */
        <div className="relative w-full h-full min-h-[480px] bg-[#FDF8F0] p-6 flex flex-col justify-between overflow-hidden">
          
          {/* Top Info Bar */}
          <div className="z-10 mt-12 flex items-center justify-between bg-[#FFFFFF] border border-[#025259]/15 p-3 rounded-xl shadow-sm">
            <div className="flex items-center gap-2 text-xs text-[#025259] font-semibold">
              <Compass className="w-4 h-4 text-[#ff947a] animate-spin-slow" />
              <span>Interactive Map Dashboard</span>
            </div>
            <div className="text-[11px] text-[#025259] font-mono bg-[#E3A857]/20 px-2.5 py-1 rounded-md border border-[#E3A857]/40 font-bold">
              {filteredVisitedPlaces.length} Visited • {wishlistItems.length} Wishlist
            </div>
          </div>

          {/* Interactive Map Canvas Grid */}
          <div className="relative flex-1 my-4 rounded-xl bg-[#FAF3E7] border border-[#025259]/10 p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 overflow-y-auto">
            
            {filteredVisitedPlaces.length === 0 && wishlistItems.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-16 px-4 text-center space-y-3 my-auto">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ff947a]/20 text-[#ff947a]">
                  <MapPin className="h-6 w-6" />
                </div>
                <h3 className="font-serif font-bold text-lg text-[#025259]">No Places Logged Yet</h3>
                <p className="text-xs text-stone-600 max-w-sm">
                  Log a visit or add wishlist spots to display your culinary pins on the map!
                </p>
              </div>
            )}
            
            {/* Visited Place Cards */}
            {filteredVisitedPlaces.map((place) => (
              <div
                key={place.id}
                onClick={() => onSelectPlace?.(place)}
                className={cn(
                  "group relative cursor-pointer rounded-xl border p-3.5 transition-all duration-200 bg-[#FFFFFF] shadow-sm flex flex-col justify-between",
                  selectedPlaceId === place.id
                    ? "border-[#ff947a] ring-2 ring-[#ff947a]/30 shadow-md"
                    : "border-[#025259]/15 hover:border-[#ff947a]/60 hover:shadow-md"
                )}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#ff947a]/15 px-2 py-0.5 text-[10px] font-bold text-[#025259] border border-[#ff947a]/30">
                      <MapPin className="w-3 h-3 text-[#ff947a]" />
                      Day {chapters.find(c => c.id === place.chapterId)?.dayNumber || 1} • {place.category}
                    </span>
                    <div className="flex items-center gap-1 text-xs font-bold text-[#E3A857]">
                      <Star className="w-3 h-3 fill-[#E3A857] text-[#E3A857]" />
                      {place.rating}
                    </div>
                  </div>

                  <h3 className="mt-2 font-semibold text-[#025259] text-sm group-hover:text-[#ff947a] transition">
                    {place.name}
                  </h3>
                  <p className="text-xs text-stone-600 line-clamp-1 mt-0.5">{place.address}</p>

                  <div className="mt-2.5 flex flex-wrap gap-1">
                    {place.dishTags.slice(0, 2).map((dish, dIdx) => (
                      <span key={dIdx} className="text-[10px] bg-[#FDF8F0] text-[#025259] px-2 py-0.5 rounded-md border border-[#025259]/10">
                        #{dish}
                      </span>
                    ))}
                  </div>
                </div>

                {place.photoUrls?.[0] && (
                  <div className="mt-3 relative h-24 w-full rounded-lg overflow-hidden border border-stone-200">
                    <img
                      src={place.photoUrls[0]}
                      alt={place.name}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}

                {onOpenVisitStory && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenVisitStory(place);
                    }}
                    className={cn(
                      "mt-2.5 flex items-center justify-center gap-1.5 w-full rounded-lg py-1.5 text-xs font-bold transition shadow-xs",
                      place.story
                        ? "bg-[#025259] text-white hover:bg-[#025259]/90"
                        : "bg-[#FDF8F0] text-[#025259] border border-[#025259]/20 hover:bg-[#ff947a]/30"
                    )}
                  >
                    <BookOpen className="w-3.5 h-3.5 text-[#ff947a]" />
                    <span>{place.story ? 'Read Visit Story' : 'Write Visit Story'}</span>
                  </button>
                )}
              </div>
            ))}

            {/* Wishlist Cards */}
            {wishlistItems.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectPlace?.(item)}
                className={cn(
                  "group relative cursor-pointer rounded-xl border p-3.5 transition-all duration-200 bg-[#FFFFFF] shadow-sm flex flex-col justify-between border-[#025259]/20 hover:border-[#025259]/50 hover:shadow-md",
                  selectedPlaceId === item.id && "border-[#025259] ring-2 ring-[#025259]/20"
                )}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#025259]/10 px-2 py-0.5 text-[10px] font-bold text-[#025259] border border-[#025259]/20">
                      <Heart className="w-3 h-3 text-[#ff947a] fill-[#ff947a]/30" />
                      Wishlist • {item.priority}
                    </span>
                    <span className="text-[10px] font-mono text-stone-500">{item.category}</span>
                  </div>

                  <h3 className="mt-2 font-semibold text-[#025259] text-sm group-hover:text-[#ff947a] transition">
                    {item.name}
                  </h3>
                  <p className="text-xs text-stone-600 line-clamp-1 mt-0.5">{item.address}</p>
                  {item.notes && (
                    <p className="text-xs text-[#025259] italic mt-2 line-clamp-2 bg-[#FDF8F0] p-1.5 rounded border border-[#025259]/10">
                      "{item.notes}"
                    </p>
                  )}
                </div>

                {onConvertToVisited && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onConvertToVisited(item);
                    }}
                    className="mt-3 flex items-center justify-center gap-1.5 w-full rounded-lg bg-[#ff947a] py-1.5 text-xs font-bold text-[#025259] hover:bg-[#f08368] transition shadow-sm"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Convert to Visited
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Bottom Route Summary Footprint */}
          <div className="z-10 flex items-center justify-between text-xs text-[#025259] border-t border-[#025259]/15 pt-3 font-medium">
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ff947a] animate-pulse" />
              Trail Polyline active across {chapters.length} daily chapters
            </span>
            <span className="text-stone-500 hidden sm:inline">Click any venue card to inspect</span>
          </div>

        </div>
      )}
    </div>
  );
}
