import React, { useEffect, useRef, useState, useMemo } from 'react';
import { AreaForecast, RegionWeather } from '../types/weather';
import { MapPin, Layers, RotateCcw, Compass, Droplets, Gauge } from 'lucide-react';
import type { Map as LeafletMap, TileLayer, LayerGroup } from 'leaflet';

interface SingaporeMapProps {
  currentLocation: string;
  areaForecasts: AreaForecast[];
  regionalWeather?: RegionWeather[];
  onSelectArea: (areaName: string) => void;
}

type OneMapStyle = 'Night' | 'Grey' | 'Default';

const REGION_BOUNDS: Record<string, { lat: number; lng: number; zoom: number }> = {
  North: { lat: 1.418, lng: 103.820, zoom: 12.8 },
  South: { lat: 1.285, lng: 103.835, zoom: 12.8 },
  East: { lat: 1.355, lng: 103.945, zoom: 12.8 },
  West: { lat: 1.345, lng: 103.710, zoom: 12.6 },
  Central: { lat: 1.350, lng: 103.840, zoom: 12.8 },
  All: { lat: 1.3521, lng: 103.8198, zoom: 11.5 },
};

export const SingaporeMap: React.FC<SingaporeMapProps> = ({
  currentLocation,
  areaForecasts,
  regionalWeather = [],
  onSelectArea,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const tileLayerRef = useRef<TileLayer | null>(null);
  const markersLayerRef = useRef<LayerGroup | null>(null);

  const [mapStyle, setMapStyle] = useState<OneMapStyle>('Night');
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [isMapReady, setIsMapReady] = useState<boolean>(false);

  // Filtered areas based on region
  const displayedAreas = useMemo(() => {
    if (selectedRegion === 'All') return areaForecasts;
    return areaForecasts.filter((a) => a.region === selectedRegion);
  }, [areaForecasts, selectedRegion]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    let isMounted = true;

    async function initMap() {
      const L = await import('leaflet');
      if (!isMounted || !mapContainerRef.current) return;

      const map = L.map(mapContainerRef.current, {
        center: [1.3521, 103.8198],
        zoom: 11.5,
        minZoom: 11,
        maxZoom: 18,
        zoomControl: false,
        attributionControl: true,
      });

      L.control.zoom({ position: 'topright' }).addTo(map);

      // SLA OneMap Tile Layer
      const tileUrl = `https://www.onemap.gov.sg/maps/tiles/${mapStyle}/{z}/{x}/{y}.png`;
      const tileLayer = L.tileLayer(tileUrl, {
        maxZoom: 18,
        minZoom: 11,
        attribution:
          '<span style="font-size:10px;">Map data &copy; <a href="https://www.onemap.gov.sg" target="_blank" rel="noopener" style="color:#38bdf8;">OneMap</a> | <a href="https://www.sla.gov.sg" target="_blank" rel="noopener" style="color:#38bdf8;">Singapore Land Authority</a></span>',
      }).addTo(map);

      const markersLayer = L.layerGroup().addTo(map);

      mapRef.current = map;
      tileLayerRef.current = tileLayer;
      markersLayerRef.current = markersLayer;
      setIsMapReady(true);
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update Tile Layer when style changes
  useEffect(() => {
    if (!mapRef.current || !tileLayerRef.current) return;

    import('leaflet').then((L) => {
      if (tileLayerRef.current && mapRef.current) {
        mapRef.current.removeLayer(tileLayerRef.current);
        const newTileUrl = `https://www.onemap.gov.sg/maps/tiles/${mapStyle}/{z}/{x}/{y}.png`;
        const newLayer = L.tileLayer(newTileUrl, {
          maxZoom: 18,
          minZoom: 11,
          attribution:
            '<span style="font-size:10px;">Map data &copy; <a href="https://www.onemap.gov.sg" target="_blank" rel="noopener" style="color:#38bdf8;">OneMap</a> | <a href="https://www.sla.gov.sg" target="_blank" rel="noopener" style="color:#38bdf8;">Singapore Land Authority</a></span>',
        }).addTo(mapRef.current);
        tileLayerRef.current = newLayer;
      }
    });
  }, [mapStyle]);

  // Update Markers
  useEffect(() => {
    if (!mapRef.current || !markersLayerRef.current || !isMapReady) return;

    import('leaflet').then((L) => {
      const markersLayer = markersLayerRef.current;
      if (!markersLayer || !mapRef.current) return;

      markersLayer.clearLayers();

      displayedAreas.forEach((area) => {
        if (!area.lat || !area.lng) return;

        const isSelected = currentLocation.toLowerCase().includes(area.area.toLowerCase());
        const isRain =
          area.condition.toLowerCase().includes('rain') || area.condition.toLowerCase().includes('shower');
        const isThunder = area.condition.toLowerCase().includes('thunder');

        const pinClass = isSelected
          ? 'bg-cyan-500 text-white ring-2 ring-cyan-200 font-bold scale-110 shadow-md shadow-cyan-500/40'
          : isThunder
          ? 'bg-[#082939] text-teal-300 border border-teal-500/80 hover:bg-teal-600 hover:text-white'
          : isRain
          ? 'bg-[#0a2335] text-cyan-200 border border-cyan-500/70 hover:bg-cyan-700 hover:text-white'
          : 'bg-[#0b2539] text-slate-100 border border-[#1b4d70] hover:bg-[#133752] hover:text-white';

        const customIcon = L.divIcon({
          className: 'leaflet-weather-marker',
          html: `
            <div style="transform: translate(-50%, -50%);" class="cursor-pointer group flex flex-col items-center select-none">
              <div class="px-2 py-0.5 rounded-full text-[10px] font-mono shadow-md whitespace-nowrap flex items-center gap-1 ${pinClass} transition-all">
                <span>${area.temperature || 31}°</span>
                <span class="text-[9px] font-sans font-normal opacity-90">${area.area}</span>
              </div>
            </div>
          `,
          iconSize: [0, 0],
        });

        const marker = L.marker([area.lat, area.lng], { icon: customIcon });

        const popupContent = `
          <div style="font-family: inherit; color: #f0f9ff; padding: 4px; min-width: 170px;">
            <div style="font-weight: 700; font-size: 13px; margin-bottom: 2px; color: #ffffff;">${area.area}</div>
            <div style="font-size: 11px; color: #94d2bd; margin-bottom: 6px;">${area.region || 'Singapore'} Region</div>
            <div style="display: flex; align-items: baseline; gap: 8px; margin-bottom: 8px;">
              <span style="font-size: 22px; font-weight: 800; font-family: monospace; color: #38bdf8;">${area.temperature || 31}°C</span>
              <span style="font-size: 11px; font-weight: 600; color: #bae6fd;">${area.condition}</span>
            </div>
            <button id="btn-${area.area.replace(/\s+/g, '-')}" style="width: 100%; background: linear-gradient(to right, #0284c7, #0d9488); color: white; border: none; border-radius: 6px; padding: 5px 8px; font-size: 11px; font-weight: 600; cursor: pointer; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
              Focus in Dashboard
            </button>
          </div>
        `;

        marker.bindPopup(popupContent, {
          closeButton: false,
          className: 'sea-breeze-popup',
        });

        marker.on('popupopen', () => {
          const btn = document.getElementById(`btn-${area.area.replace(/\s+/g, '-')}`);
          if (btn) {
            btn.onclick = () => {
              onSelectArea(area.area);
              mapRef.current?.closePopup();
            };
          }
        });

        markersLayer.addLayer(marker);
      });
    });
  }, [displayedAreas, currentLocation, isMapReady, onSelectArea]);

  // Handle Region Selection & Pan/Zoom
  const handleRegionClick = (region: string) => {
    setSelectedRegion(region);
    const bounds = REGION_BOUNDS[region] || REGION_BOUNDS.All;
    if (mapRef.current) {
      mapRef.current.flyTo([bounds.lat, bounds.lng], bounds.zoom, {
        duration: 1.2,
      });
    }
  };

  const resetView = () => {
    handleRegionClick('All');
  };

  return (
    <div className="bg-[#0a1e2d]/80 border border-[#163a54] rounded-2xl p-6 shadow-sm space-y-5">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-semibold text-cyan-50">
              Singapore Land Authority (OneMap) Regional Weather
            </h2>
          </div>
          <p className="text-xs text-cyan-200/70 mt-0.5">
            Official Singapore Land Authority (SLA) basemap featuring live localized weather conditions by region
          </p>
        </div>

        {/* SLA Basemap Style Switcher & Reset */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#0c2234] border border-[#194362] rounded-lg p-1 text-xs">
            <span className="text-[11px] text-cyan-300/70 px-2 flex items-center gap-1 hidden sm:flex">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              SLA Basemap:
            </span>
            {(['Night', 'Grey', 'Default'] as OneMapStyle[]).map((style) => (
              <button
                key={style}
                onClick={() => setMapStyle(style)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  mapStyle === style
                    ? 'bg-cyan-600 text-white shadow-xs'
                    : 'text-cyan-200/70 hover:text-white'
                }`}
              >
                {style}
              </button>
            ))}
          </div>

          <button
            onClick={resetView}
            className="p-2 rounded-lg bg-[#0c2234] hover:bg-[#12314a] border border-[#194362] text-cyan-200 hover:text-white transition-colors"
            title="Reset map view to whole Singapore"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Regional Weather Condition Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {/* All Singapore tab */}
        <button
          onClick={() => handleRegionClick('All')}
          className={`text-left p-3 rounded-xl border transition-all flex flex-col justify-between ${
            selectedRegion === 'All'
              ? 'bg-gradient-to-r from-cyan-600 to-teal-600 border-cyan-400 text-white shadow-sm ring-1 ring-cyan-300/40'
              : 'bg-[#091f30]/70 hover:bg-[#0c283e] border-[#153852] text-cyan-100'
          }`}
        >
          <div>
            <div className="text-[11px] uppercase tracking-wider font-semibold opacity-80 text-cyan-100">
              National
            </div>
            <div className="text-sm font-bold mt-0.5 truncate">All Singapore</div>
          </div>
          <div className="text-[11px] mt-2 opacity-80 text-cyan-200/80">
            {areaForecasts.length} Sensor Zones
          </div>
        </button>

        {/* 5 Specific Regions */}
        {regionalWeather.map((rw) => {
          const isSelected = selectedRegion === rw.region;
          return (
            <button
              key={rw.region}
              onClick={() => handleRegionClick(rw.region)}
              className={`text-left p-3 rounded-xl border transition-all flex flex-col justify-between ${
                isSelected
                  ? 'bg-gradient-to-r from-cyan-600 to-teal-600 border-cyan-400 text-white shadow-sm ring-1 ring-cyan-300/40'
                  : 'bg-[#091f30]/70 hover:bg-[#0c283e] border-[#153852] text-cyan-100'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-wider font-semibold opacity-80 text-cyan-100">
                    {rw.region}
                  </span>
                  <span className="text-xs font-mono font-bold text-cyan-50">{rw.temperature}°C</span>
                </div>
                <div className="text-xs font-medium mt-1 truncate text-cyan-100" title={rw.condition}>
                  {rw.condition}
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-cyan-400/20 text-[10px] flex items-center justify-between opacity-85 text-cyan-200/90">
                <span className="flex items-center gap-1">
                  <Gauge className="w-2.5 h-2.5 text-teal-300" />
                  <span>{rw.psi} PSI</span>
                </span>
                <span>{rw.areasCount} Towns</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Map Display Container */}
      <div className="relative rounded-xl overflow-hidden border border-[#173e5a] bg-[#061421] shadow-inner">
        <div ref={mapContainerRef} className="w-full h-[460px] z-10" />

        {/* Floating Legend / Quick Status */}
        <div className="absolute bottom-3 left-3 z-20 bg-[#091f30]/90 backdrop-blur-xs border border-[#194362] rounded-lg p-2.5 text-xs text-cyan-100 shadow-lg pointer-events-auto">
          <div className="text-[10px] font-semibold text-cyan-300 uppercase tracking-wider mb-1 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-cyan-400" />
            Showing: {selectedRegion === 'All' ? 'Whole Island' : `${selectedRegion} Region`} ({displayedAreas.length} stations)
          </div>
          <div className="text-[11px] text-cyan-200/70">
            Click any pin on the map to inspect township weather or focus dashboard.
          </div>
        </div>
      </div>
    </div>
  );
};
