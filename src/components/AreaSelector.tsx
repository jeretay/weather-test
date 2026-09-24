import React, { useState } from 'react';
import { AreaForecast } from '../types/weather';
import { getWeatherIcon } from '../utils/weatherIcons';
import { Search, MapPin, Check } from 'lucide-react';

interface AreaSelectorProps {
  currentLocation: string;
  areas: AreaForecast[];
  onSelectArea: (areaName: string) => void;
}

const POPULAR_AREAS = ['Singapore', 'City', 'Bedok', 'Jurong East', 'Ang Mo Kio', 'Woodlands', 'Tampines', 'Sentosa'];

export const AreaSelector: React.FC<AreaSelectorProps> = ({
  currentLocation,
  areas,
  onSelectArea,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAreas = areas.filter((a) =>
    a.area.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  return (
    <div className="bg-[#0a1e2d]/80 border border-[#163a54] rounded-2xl p-6 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-cyan-400" />
            <h2 className="text-base font-semibold text-cyan-50">Singapore Area Explorer</h2>
          </div>
          <p className="text-xs text-cyan-200/70 mt-0.5">
            Select a specific Singapore township to view localized weather sensor data
          </p>
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400/70 pointer-events-none" />
          <input
            type="text"
            placeholder="Search town or district..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0c2234] border border-[#194362] rounded-lg pl-9 pr-3 py-1.5 text-xs text-cyan-50 placeholder-cyan-300/40 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
          />
        </div>
      </div>

      {/* Quick filter buttons */}
      <div className="flex flex-wrap items-center gap-1.5 mb-4">
        {POPULAR_AREAS.map((area) => {
          const isActive =
            area === 'Singapore'
              ? currentLocation.toLowerCase() === 'singapore'
              : currentLocation.toLowerCase().includes(area.toLowerCase());

          return (
            <button
              key={area}
              onClick={() => onSelectArea(area)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-sm ring-1 ring-cyan-400/40'
                  : 'bg-[#0c2234] text-cyan-200/80 hover:bg-[#123048] hover:text-white border border-[#194362]'
              }`}
            >
              {isActive && <Check className="w-3 h-3 text-cyan-200" />}
              {area}
            </button>
          );
        })}
      </div>

      {/* Grid of township cards */}
      <div className="max-h-64 overflow-y-auto pr-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
        {filteredAreas.length > 0 ? (
          filteredAreas.map((item) => {
            const isSelected = currentLocation.toLowerCase().includes(item.area.toLowerCase());
            return (
              <button
                key={item.area}
                onClick={() => onSelectArea(item.area)}
                className={`text-left p-2.5 rounded-xl border transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#0e2e44] border-cyan-400 text-white ring-1 ring-cyan-400/60 shadow-xs'
                    : 'bg-[#091f30]/60 hover:bg-[#0d273c] border-[#153852] text-cyan-100'
                }`}
              >
                <div className="text-xs font-medium truncate w-full" title={item.area}>
                  {item.area}
                </div>
                <div className="flex items-center gap-1.5 mt-2">
                  {getWeatherIcon(item.forecast, 'w-4 h-4')}
                  <span className="text-[11px] text-cyan-300/70 truncate">
                    {item.condition}
                  </span>
                </div>
              </button>
            );
          })
        ) : (
          <div className="col-span-full py-6 text-center text-xs text-cyan-200/60">
            No areas matching &ldquo;{searchTerm}&rdquo;
          </div>
        )}
      </div>
    </div>
  );
};
