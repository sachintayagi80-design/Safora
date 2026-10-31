import { useState, useCallback, useMemo, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, OverlayView, Polyline, HeatmapLayer} from '@react-google-maps/api';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation } from 'lucide-react';
import { CITY_ZONES, INCIDENT_TYPES, RISK_COLOR, type Incident } from '@/data/incidents';

export interface RoutePoint { x: number; y: number; label: string }

interface MapViewProps {
  incidents: Incident[]; // This is now used as a fallback if the DB is empty
  height?: string;
  onMapClick?: (pos: { x: number; y: number }) => void;
  pin?: { x: number; y: number } | null;
  route?: { start: RoutePoint; end: RoutePoint } | null;
  selectedIncidentId?: string | null;
  onSelectIncident?: (id: string) => void;
  showZoneLabels?: boolean;
  showHeatmap?: boolean;
}

const LIBRARIES: ("visualization")[] = ['visualization'];

const MAP_BOUNDS = { north: 26.89, south: 26.75, west: 80.85, east: 81.05 };
const CENTER = { lat: 26.8467, lng: 80.9462 }; // Lucknow

function percentToLatLng(x: number, y: number) {
  return {
    lat: MAP_BOUNDS.north - (y / 100) * (MAP_BOUNDS.north - MAP_BOUNDS.south),
    lng: MAP_BOUNDS.west + (x / 100) * (MAP_BOUNDS.east - MAP_BOUNDS.west)
  };
}

function latLngToPercent(lat: number, lng: number) {
  const x = ((lng - MAP_BOUNDS.west) / (MAP_BOUNDS.east - MAP_BOUNDS.west)) * 100;
  const y = ((MAP_BOUNDS.north - lat) / (MAP_BOUNDS.north - MAP_BOUNDS.south)) * 100;
  return { x, y };
}

const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#182427" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#4b6b66" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#14201f" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#1a2c2b" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#162322" }] },
  { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#f3d19c" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#101817" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#4b6b66" }] },
  { featureType: "water", elementType: "labels.text.stroke", stylers: [{ color: "#17263c" }] }
];

export default function MapView({
  incidents: propIncidents, height = '100%', onMapClick, pin, route, selectedIncidentId, onSelectIncident, showZoneLabels = true, showHeatmap = false
}: MapViewProps) {
  
  const [dbIncidents, setDbIncidents] = useState<Incident[]>([]);

  // Automatically fetch live incidents from MongoDB via FastAPI
  useEffect(() => {
    fetch('http://localhost:8000/api/incidents')
      .then(res => res.json())
      .then(data => {
        if (data.incidents && data.incidents.length > 0) {
          // Add physical map coordinates based on the zone so they appear correctly
          const mappedIncidents = data.incidents.map((dbInc: any, index: number) => {
            const zone = CITY_ZONES.find(z => z.id === dbInc.zoneId);
            // Slight random offset so incidents in the same zone don't stack directly on top of each other
            const offsetX = (Math.random() - 0.5) * 5;
            const offsetY = (Math.random() - 0.5) * 5;
            
            return {
              id: dbInc._id || `db-inc-${index}`,
              type: dbInc.type || 'other',
              risk: dbInc.risk || 'low',
              zoneId: dbInc.zoneId,
              x: dbInc.x || (zone ? zone.x + offsetX : 50),
              y: dbInc.y || (zone ? zone.y + offsetY : 50),
              description: dbInc.description,
              timestamp: dbInc.timestamp
            };
          });
          setDbIncidents(mappedIncidents);
        }
      })
      .catch(err => console.error("Failed to fetch live map incidents:", err));
  }, []);

  // Use dynamic DB data if available, otherwise fall back to dummy props
  const displayIncidents = dbIncidents.length > 0 ? dbIncidents : propIncidents;

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    // Pulls from .env file for safety, falls back to your key if missing
    googleMapsApiKey: (import.meta as any).env.VITE_GOOGLE_MAPS_API_KEY || "AIzaSyDPSB2vQBBig0LBjiUyb6kKw6Q7ZrQYiHs",
    version: '3.64',
    libraries: LIBRARIES,
  });
  
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);

  const heatmapData = useMemo(() => {
    if (!isLoaded || !window.google) return [];
    return displayIncidents.map(inc => {
      const pos = percentToLatLng(inc.x, inc.y);
      return {
        location: new window.google.maps.LatLng(pos.lat, pos.lng),
        weight: inc.risk === 'high' ? 3 : inc.risk === 'medium' ? 2 : 1
      };
    });
  }, [displayIncidents, isLoaded]);

  const onLoad = useCallback(function callback(map: google.maps.Map) {
    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback(map: google.maps.Map) {
    setMap(null);
  }, []);

  function handleMapClick(e: google.maps.MapMouseEvent) {
    if (!onMapClick || !e.latLng) return;
    const { x, y } = latLngToPercent(e.latLng.lat(), e.latLng.lng());
    onMapClick({ x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 });
  }

  if (loadError) return <div className="flex items-center justify-center h-full w-full bg-red-900/20 text-red-400">Map failed to load</div>;
  if (!isLoaded) return <div className="w-full bg-[#182427] animate-pulse" style={{ height }} />;

  return (
    <div className="relative w-full" style={{ height }}>
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={CENTER}
        zoom={12}
        options={{
          styles: darkMapStyle,
          disableDefaultUI: true,
          zoomControl: true,
          gestureHandling: onMapClick ? 'greedy' : 'auto'
        }}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onClick={handleMapClick}
      >
        {/* Zone Halos & Labels */}
        {CITY_ZONES.map((z) => {
          const zoneIncidents = displayIncidents.filter((i) => i.zoneId === z.id);
          const highCount = zoneIncidents.filter((i) => i.risk === 'high').length;
          const risk = highCount >= 3 ? 'high' : highCount >= 1 ? 'medium' : z.baseRisk;
          
          return (
            <OverlayView
              key={z.id}
              position={percentToLatLng(z.x, z.y)}
              mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
            >
              <div 
                className="absolute -translate-x-1/2 -translate-y-1/2 cursor-default"
                onMouseEnter={() => setHoveredZone(z.id)} 
                onMouseLeave={() => setHoveredZone(null)}
              >
                <motion.div
                  className="rounded-full blur-2xl"
                  style={{ width: 90, height: 90, backgroundColor: RISK_COLOR[risk as keyof typeof RISK_COLOR] || RISK_COLOR.low, opacity: 0.16 }}
                  animate={{ opacity: [0.1, 0.22, 0.1] }} transition={{ duration: 3, repeat: Infinity }}
                />
                {showZoneLabels && (
                  <span className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-mono text-[9px] tracking-widest text-white/40 drop-shadow-md">
                    {z.name.toUpperCase()}
                  </span>
                )}
              </div>
            </OverlayView>
          );
        })}

        {/* Route Line */}
        {route && (
          <>
            <Polyline
              path={[percentToLatLng(route.start.x, route.start.y), percentToLatLng(route.end.x, route.end.y)]}
              options={{
                strokeColor: '#3b82f6',
                strokeOpacity: 0.8,
                strokeWeight: 3,
                icons: [{ icon: { path: 'M 0,-1 0,1', strokeOpacity: 1, scale: 2 }, offset: '0', repeat: '15px' }],
              }}
            />
            <OverlayView position={percentToLatLng(route.start.x, route.start.y)} mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}>
              <MapMarker color="#3b82f6" label={route.start.label} icon={<span className="h-2 w-2 rounded-full bg-white" />} />
            </OverlayView>
            <OverlayView position={percentToLatLng(route.end.x, route.end.y)} mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}>
              <MapMarker color="#3b82f6" label={route.end.label} icon={<Navigation className="h-3 w-3 text-white" />} />
            </OverlayView>
          </>
        )}

        {/* Incident Markers OR Heatmap */}
        {showHeatmap && isLoaded && heatmapData.length > 0 ? (
          <HeatmapLayer
            data={heatmapData}
            options={{
              radius: 40,
              opacity: 0.8,
              gradient: [
                'rgba(0, 255, 255, 0)',
                'rgba(0, 255, 255, 1)',
                'rgba(89, 255, 0, 1)',
                'rgba(191, 255, 0, 1)',
                'rgba(255, 255, 0, 1)',
                'rgba(255, 176, 32, 1)',
                'rgba(255, 77, 77, 1)',
                'rgba(255, 0, 0, 1)',
              ]
            }}
          />
        ) : (
          <AnimatePresence>
            {displayIncidents.map((inc) => {
              // Ensure we have a valid type fallback if the DB type string doesn't perfectly match the frontend enum
              const meta = INCIDENT_TYPES.find((t) => t.value.toLowerCase() === inc.type.toLowerCase()) || INCIDENT_TYPES[0];
              const selected = inc.id === selectedIncidentId;
              const riskColor = RISK_COLOR[inc.risk as keyof typeof RISK_COLOR] || RISK_COLOR.low;
              
              return (
                <OverlayView key={inc.id} position={percentToLatLng(inc.x, inc.y)} mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}>
                  <motion.button
                    initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
                    className="absolute -translate-x-1/2 -translate-y-1/2"
                    onClick={(e) => { e.stopPropagation(); onSelectIncident?.(inc.id); }}
                  >
                    <motion.span
                      className="absolute -inset-2.5 rounded-full"
                      style={{ backgroundColor: riskColor }}
                      animate={{ opacity: [0.35, 0.05, 0.35] }} transition={{ duration: 2, repeat: Infinity }}
                    />
                    <span
                      className={`relative flex h-5 w-5 items-center justify-center rounded-full text-[10px] ring-2 transition-transform ${selected ? 'scale-125 ring-white' : 'ring-[#182427]/60 hover:scale-110'}`}
                      style={{ backgroundColor: riskColor }}
                    >
                      {meta.emoji}
                    </span>
                  </motion.button>
                </OverlayView>
              );
            })}
          </AnimatePresence>
        )}

        {/* Drop Pin */}
        {pin && (
          <OverlayView position={percentToLatLng(pin.x, pin.y)} mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}>
            <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="absolute -translate-x-1/2 -translate-y-full z-20 pointer-events-none">
              <MapPin className="h-8 w-8 text-redbrand drop-shadow-lg" fill="#ff4d4d" fillOpacity={0.25} />
            </motion.div>
          </OverlayView>
        )}
      </GoogleMap>

      {hoveredZone && (
        <div className="pointer-events-none absolute left-3 top-3 z-30 rounded-lg border border-white/10 bg-black/70 px-3 py-1.5 font-mono text-[10px] text-white backdrop-blur-sm">
          {CITY_ZONES.find((z) => z.id === hoveredZone)?.name}
        </div>
      )}
    </div>
  );
}

function MapMarker({ color, label, icon }: { color: string; label: string; icon: React.ReactNode }) {
  return (
    <div className="absolute -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center pointer-events-none">
      <span className="flex h-6 w-6 items-center justify-center rounded-full ring-2 ring-white/80" style={{ backgroundColor: color }}>{icon}</span>
      <span className="mt-1 rounded bg-black/70 px-1.5 py-0.5 text-[9px] font-semibold text-white whitespace-nowrap">{label}</span>
    </div>
  );
}