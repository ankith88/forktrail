'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF, PolylineF, InfoWindowF } from '@react-google-maps/api';
import { VisitedPlace, WishlistItem, TimelineChapter } from '@/types';
import { Star, MapPin, Heart, Utensils, Calendar, ExternalLink, CheckCircle2, RotateCw, Eye, Sparkles, Sliders, Layers, Navigation } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Map3DViewProps {
  visitedPlaces: VisitedPlace[];
  wishlistItems: WishlistItem[];
  chapters: TimelineChapter[];
  selectedPlaceId?: string | null;
  onSelectPlace?: (place: VisitedPlace | WishlistItem | null) => void;
  onConvertToVisited?: (item: WishlistItem) => void;
}

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

// Default fallback city center (Sydney CBD) if geolocation unavailable and no places logged
const DEFAULT_CENTER = { lat: -33.8688, lng: 151.2093 };

// Vector map style tailored to ForkTrail's #FDF8F0 Warm Cream & #025259 Deep Pine palette
const map3DVectorStyle = [
  { elementType: 'geometry', stylers: [{ color: '#FDF8F0' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#FFFFFF' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#025259' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#025259' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#025259' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#E4F0EC' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#FFFFFF' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#EADFCF' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#025259' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#CEE8E5' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#025259' }] },
];

export function Map3DView({
  visitedPlaces,
  wishlistItems,
  chapters,
  selectedPlaceId,
  onSelectPlace,
  onConvertToVisited,
}: Map3DViewProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
  const isGoogleMapsReady = Boolean(apiKey && apiKey !== 'your_google_maps_api_key');

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: isGoogleMapsReady ? apiKey : '',
  });

  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'visited' | 'wishlist'>('all');
  const [is3DMode, setIs3DMode] = useState(true);
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const [tiltAngle, setTiltAngle] = useState(55); // 55° 3D perspective pitch
  const [heading, setHeading] = useState(0);

  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  const [activeInfoWindow, setActiveInfoWindow] = useState<VisitedPlace | WishlistItem | null>(null);

  // Rotation interval ref
  const rotationRef = useRef<NodeJS.Timeout | null>(null);

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

  // Request user location on mount
  useEffect(() => {
    requestUserLocation();
  }, []);

  // Pan map when mapInstance or userLocation becomes available
  useEffect(() => {
    if (mapInstance && userLocation) {
      mapInstance.panTo(userLocation);
    }
  }, [mapInstance, userLocation]);

  // Filter items based on activeFilter
  const displayVisited = useMemo(() => {
    if (activeFilter === 'wishlist') return [];
    return visitedPlaces;
  }, [visitedPlaces, activeFilter]);

  const displayWishlist = useMemo(() => {
    if (activeFilter === 'visited') return [];
    return wishlistItems;
  }, [wishlistItems, activeFilter]);

  // Center map prioritizing user location, then first place, or default city center
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

  // Auto rotation 3D effect
  useEffect(() => {
    if (isAutoRotating && mapInstance) {
      rotationRef.current = setInterval(() => {
        setHeading((prev) => {
          const nextHeading = (prev + 1) % 360;
          if (mapInstance && typeof mapInstance.setHeading === 'function') {
            mapInstance.setHeading(nextHeading);
          }
          return nextHeading;
        });
      }, 100);
    } else {
      if (rotationRef.current) clearInterval(rotationRef.current);
    }

    return () => {
      if (rotationRef.current) clearInterval(rotationRef.current);
    };
  }, [isAutoRotating, mapInstance]);

  // Handle marker click with 3D camera fly-to choreography
  const handleMarkerClick = (place: VisitedPlace | WishlistItem) => {
    setActiveInfoWindow(place);
    onSelectPlace?.(place);

    if (mapInstance) {
      mapInstance.panTo({ lat: place.lat, lng: place.lng });
      mapInstance.setZoom(16);
      if (typeof mapInstance.setTilt === 'function') {
        mapInstance.setTilt(tiltAngle);
      }
    }
  };

  // Toggle 3D Perspective Mode
  const toggle3DMode = () => {
    const new3D = !is3DMode;
    setIs3DMode(new3D);
    const newTilt = new3D ? 55 : 0;
    setTiltAngle(newTilt);

    if (mapInstance && typeof mapInstance.setTilt === 'function') {
      mapInstance.setTilt(newTilt);
    }
  };

  // Chronological day polyline routes
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

  const dayColors = ['#ff947a', '#025259', '#E3A857', '#03717b', '#f08368'];

  return (
    <div className="relative w-full h-full min-h-[500px] rounded-3xl overflow-hidden border border-[#025259]/20 bg-[#FDF8F0] shadow-2xl flex flex-col">
      
      {/* 3D Top Floating Control Bar */}
      <div className="absolute top-4 left-4 z-30 pointer-events-auto flex flex-wrap items-center gap-2 bg-[#FFFFFF]/95 backdrop-blur-md p-2 rounded-2xl border border-[#025259]/15 shadow-xl max-w-[calc(100%-2rem)]">
        
        {/* Filter Buttons */}
        <div className="flex items-center gap-1 bg-[#FAF3E7] p-1 rounded-xl border border-[#025259]/10">
          <button
            onClick={() => setActiveFilter('all')}
            className={cn(
              "px-3 py-1 text-xs font-bold rounded-lg transition-all",
              activeFilter === 'all'
                ? "bg-[#ff947a] text-[#025259] shadow-sm"
                : "text-[#025259] hover:bg-[#FDF8F0]"
            )}
          >
            All ({visitedPlaces.length + wishlistItems.length})
          </button>
          <button
            onClick={() => setActiveFilter('visited')}
            className={cn(
              "px-3 py-1 text-xs font-bold rounded-lg transition-all",
              activeFilter === 'visited'
                ? "bg-[#025259] text-white shadow-sm"
                : "text-[#025259] hover:bg-[#FDF8F0]"
            )}
          >
            Visited ({visitedPlaces.length})
          </button>
          <button
            onClick={() => setActiveFilter('wishlist')}
            className={cn(
              "px-3 py-1 text-xs font-bold rounded-lg transition-all",
              activeFilter === 'wishlist'
                ? "bg-[#E3A857] text-[#025259] shadow-sm"
                : "text-[#025259] hover:bg-[#FDF8F0]"
            )}
          >
            Wishlist ({wishlistItems.length})
          </button>
        </div>

        {/* 3D Camera Tilt Toggle */}
        <button
          onClick={toggle3DMode}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border transition-all",
            is3DMode
              ? "bg-[#025259] text-white border-[#025259] shadow-md"
              : "bg-[#FFFFFF] text-[#025259] border-[#025259]/20 hover:bg-[#FAF3E7]"
          )}
        >
          <Layers className="h-3.5 w-3.5 text-[#ff947a]" />
          <span>{is3DMode ? '3D Tilt 55°' : '2D Overhead'}</span>
        </button>

        {/* Auto Orbit Rotation Toggle */}
        <button
          onClick={() => setIsAutoRotating(!isAutoRotating)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border transition-all",
            isAutoRotating
              ? "bg-[#ff947a] text-[#025259] border-[#ff947a] shadow-md animate-pulse"
              : "bg-[#FFFFFF] text-[#025259] border-[#025259]/20 hover:bg-[#FAF3E7]"
          )}
        >
          <RotateCw className={cn("h-3.5 w-3.5", isAutoRotating && "animate-spin")} />
          <span>{isAutoRotating ? 'Orbiting 360°' : 'Auto Orbit'}</span>
        </button>

        {/* Center on My Location Button */}
        <button
          onClick={requestUserLocation}
          disabled={isLocating}
          title="Center map on your current location"
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border transition-all",
            userLocation
              ? "bg-[#025259] text-white border-[#025259] shadow-md hover:bg-[#03717b]"
              : "bg-[#FFFFFF] text-[#025259] border-[#025259]/20 hover:bg-[#FAF3E7]"
          )}
        >
          <Navigation className={cn("h-3.5 w-3.5 text-[#ff947a]", isLocating && "animate-spin")} />
          <span>{isLocating ? 'Locating...' : 'My Location'}</span>
        </button>

      </div>

      {/* 3D Legend Bar */}
      <div className="absolute top-4 right-4 z-20 hidden md:flex items-center gap-3 bg-[#FFFFFF]/95 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-[#025259]/15 text-xs text-[#025259] font-bold shadow-md">
        {userLocation && (
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#2563EB] shadow-sm animate-ping" />
            Your Location
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#ff947a] shadow-sm animate-pulse" />
          Visited 3D Pin
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#025259] shadow-sm" />
          Wishlist 3D Pin
        </span>
      </div>

      {/* Google Maps WebGL 3D Render */}
      {isGoogleMapsReady && isLoaded ? (
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={13}
          onLoad={(map) => {
            setMapInstance(map);
            if (typeof map.setTilt === 'function') map.setTilt(tiltAngle);
          }}
          options={{
            styles: map3DVectorStyle,
            disableDefaultUI: false,
            zoomControl: true,
            heading,
            tilt: tiltAngle,
          }}
        >
          {/* User Current Location Pin (Vibrant Blue Pulse Marker) */}
          {userLocation && (
            <MarkerF
              key="user-current-location-3d"
              position={userLocation}
              title="Your Current Location"
              icon={{
                path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
                fillColor: '#2563EB',
                fillOpacity: 1,
                strokeColor: '#FFFFFF',
                strokeWeight: 2.5,
                scale: 2.2,
              }}
            />
          )}

          {/* Visited Places 3D Pin Markers */}
          {displayVisited.map((place) => (
            <MarkerF
              key={`visited-3d-${place.id}`}
              position={{ lat: place.lat, lng: place.lng }}
              onClick={() => handleMarkerClick(place)}
              icon={{
                path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
                fillColor: '#ff947a',
                fillOpacity: 1,
                strokeColor: '#025259',
                strokeWeight: 2,
                scale: 1.9,
              }}
            />
          ))}

          {/* Wishlist 3D Translucent Pins */}
          {displayWishlist.map((item) => (
            <MarkerF
              key={`wishlist-3d-${item.id}`}
              position={{ lat: item.lat, lng: item.lng }}
              onClick={() => handleMarkerClick(item)}
              icon={{
                path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
                fillColor: '#025259',
                fillOpacity: 0.95,
                strokeColor: '#ff947a',
                strokeWeight: 1.8,
                scale: 1.7,
              }}
            />
          ))}

          {/* Animated 3D Multi-Segment Routes */}
          {Object.entries(polylineRoutes).map(([dayNumStr, path]) => {
            const dayNum = parseInt(dayNumStr, 10);
            return (
              <PolylineF
                key={`3d-route-day-${dayNum}`}
                path={path}
                options={{
                  strokeColor: dayColors[(dayNum - 1) % dayColors.length],
                  strokeOpacity: 0.9,
                  strokeWeight: 5,
                  geodesic: true,
                }}
              />
            );
          })}

          {/* Floating Glassmorphism 3D Info Popover */}
          {activeInfoWindow && (
            <InfoWindowF
              position={{ lat: activeInfoWindow.lat, lng: activeInfoWindow.lng }}
              onCloseClick={() => setActiveInfoWindow(null)}
            >
              <div className="p-1 max-w-xs text-[#025259] bg-[#FFFFFF]">
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
        /* Fallback Interactive 3D Canvas Visualizer */
        <div className="relative w-full h-full min-h-[500px] bg-[#FDF8F0] p-6 flex flex-col justify-between overflow-hidden">
          
          {/* Top 3D Indicator */}
          <div className="z-10 mt-14 flex items-center justify-between bg-[#FFFFFF] border border-[#025259]/15 p-3 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 text-xs text-[#025259] font-bold">
              <Sparkles className="w-4 h-4 text-[#ff947a] animate-spin-slow" />
              <span>3D WebGL Vector Map Mode ({is3DMode ? '55° Tilt Perspective' : '2D Flat'})</span>
            </div>
            <div className="text-[11px] text-[#025259] font-mono bg-[#E3A857]/20 px-2.5 py-1 rounded-lg border border-[#E3A857]/40 font-bold">
              {displayVisited.length} Visited Nodes • {displayWishlist.length} Wishlist Nodes
            </div>
          </div>

          {/* Interactive 3D Perspective Card Nodes */}
          <div className="relative flex-1 my-4 rounded-2xl bg-[#FAF3E7] border border-[#025259]/10 p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 overflow-y-auto transform-gpu transition-all">
            
            {displayVisited.length === 0 && displayWishlist.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-16 px-4 text-center space-y-3 my-auto">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ff947a]/20 text-[#ff947a]">
                  <MapPin className="h-6 w-6" />
                </div>
                <h3 className="font-serif font-bold text-lg text-[#025259]">No Places Logged Yet</h3>
                <p className="text-xs text-stone-600 max-w-sm">
                  Your 3D map is clean! Start a new food trip or log a dining visit on your dashboard to see your 3D pins come to life.
                </p>
              </div>
            )}
            
            {displayVisited.map((place) => (
              <div
                key={place.id}
                onClick={() => handleMarkerClick(place)}
                className={cn(
                  "group relative cursor-pointer rounded-2xl border p-4 transition-all duration-300 bg-[#FFFFFF] shadow-sm flex flex-col justify-between transform hover:-translate-y-1 hover:shadow-xl",
                  selectedPlaceId === place.id
                    ? "border-[#ff947a] ring-2 ring-[#ff947a]/40 shadow-lg"
                    : "border-[#025259]/15 hover:border-[#ff947a]"
                )}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#ff947a]/20 px-2.5 py-0.5 text-[10px] font-bold text-[#025259] border border-[#ff947a]/40">
                      <MapPin className="w-3 h-3 text-[#ff947a]" />
                      Day {chapters.find(c => c.id === place.chapterId)?.dayNumber || 1} • {place.category}
                    </span>
                    <div className="flex items-center gap-1 text-xs font-bold text-[#E3A857]">
                      <Star className="w-3.5 h-3.5 fill-[#E3A857] text-[#E3A857]" />
                      {place.rating}
                    </div>
                  </div>

                  <h3 className="mt-2.5 font-serif font-bold text-[#025259] text-base group-hover:text-[#ff947a] transition">
                    {place.name}
                  </h3>
                  <p className="text-xs text-stone-600 line-clamp-1 mt-0.5">{place.address}</p>
                </div>

                {place.photoUrls?.[0] && (
                  <div className="mt-3 relative h-28 w-full rounded-xl overflow-hidden border border-stone-200 shadow-sm">
                    <img
                      src={place.photoUrls[0]}
                      alt={place.name}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
              </div>
            ))}

            {displayWishlist.map((item) => (
              <div
                key={item.id}
                onClick={() => handleMarkerClick(item)}
                className={cn(
                  "group relative cursor-pointer rounded-2xl border p-4 transition-all duration-300 bg-[#FFFFFF] shadow-sm flex flex-col justify-between transform hover:-translate-y-1 hover:shadow-xl border-[#025259]/20 hover:border-[#025259]",
                  selectedPlaceId === item.id && "border-[#025259] ring-2 ring-[#025259]/20"
                )}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#025259]/10 px-2.5 py-0.5 text-[10px] font-bold text-[#025259] border border-[#025259]/20">
                      <Heart className="w-3 h-3 text-[#ff947a] fill-[#ff947a]/30" />
                      Wishlist • {item.priority}
                    </span>
                  </div>

                  <h3 className="mt-2.5 font-serif font-bold text-[#025259] text-base group-hover:text-[#ff947a] transition">
                    {item.name}
                  </h3>
                  <p className="text-xs text-stone-600 line-clamp-1 mt-0.5">{item.address}</p>
                  {item.notes && (
                    <p className="text-xs text-[#025259] italic mt-2 line-clamp-2 bg-[#FDF8F0] p-2 rounded-lg border border-[#025259]/10">
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
                    className="mt-3 flex items-center justify-center gap-1.5 w-full rounded-xl bg-[#ff947a] py-2 text-xs font-bold text-[#025259] hover:bg-[#f08368] transition shadow"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Convert to Visited
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Bottom Controls Footprint */}
          <div className="z-10 flex items-center justify-between text-xs text-[#025259] border-t border-[#025259]/15 pt-3 font-semibold">
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ff947a] animate-ping" />
              3D WebGL Camera Tilt: {tiltAngle}° | Orbit Heading: {heading}°
            </span>
            <span className="text-stone-600 hidden sm:inline">Click any 3D node to fly camera to location</span>
          </div>

        </div>
      )}
    </div>
  );
}
