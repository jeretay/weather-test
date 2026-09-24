import React, { useState } from 'react';
import { AreaForecast } from '../types/weather';
import { getWeatherIcon } from '../utils/weatherIcons';
import { Search, MapPin, Check } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

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
  const { isDark } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAreas = areas.filter((a) =>
    a.area.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  return (
    <div
      className={`border rounded-2xl p-6 transition-all duration-200 shadow-sm ${
        isDark ? 'bg-[#0a1e2d]/80 border-[#163a54]' : 'bg-white border-sky-100 shadow-sky-950/5'
      }`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className={`w-4 h-4 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
            <h2 className={`text-base font-semibold ${isDark ? 'text-cyan-50' : 'text-slate-900'}`}>
              Singapore Area Explorer
            </h2>
          </div>
          <p className={`text-xs mt-0.5 ${isDark ? 'text-cyan-200/70' : 'text-slate-500'}`}>
            Select a specific Singapore township to view localized weather sensor data
          </p>
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-64">
          <Search
            className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none ${
              isDark ? 'text-cyan-400/70' : 'text-slate-400'
            }`}
          />
          <input
            type="text"
            placeholder="Search town or district..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full rounded-lg pl-9 pr-3 py-1.5 text-xs transition-colors focus:outline-none focus:ring-1 focus:ring-cyan-500 ${
              isDark
                ? 'bg-[#0c2234] border border-[#194362] text-cyan-50 placeholder-cyan-300/40 focus:border-cyan-400'
                : 'bg-[#f0f7fb] border border-sky-200 text-slate-800 placeholder-slate-400 focus:border-cyan-500'
            }`}
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
                  : isDark
                  ? 'bg-[#0c2234] text-cyan-200/80 hover:bg-[#123048] hover:text-white border border-[#194362]'
                  : 'bg-[#f0f7fb] text-slate-700 hover:bg-[#e2eef6] hover:text-slate-950 border border-sky-200'
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
                    ? isDark
                      ? 'bg-[#0e2e44] border-cyan-400 text-white ring-1 ring-cyan-400/60 shadow-xs'
                      : 'bg-sky-50 border-cyan-600 text-slate-900 ring-1 ring-cyan-500/50 shadow-xs'
                    : isDark
                    ? 'bg-[#091f30]/60 hover:bg-[#0d273c] border-[#153852] text-cyan-100'
                    : 'bg-[#f0f7fb] hover:bg-[#e4eff6] border-sky-200 text-slate-800'
                }`}
              >
                <div className="text-xs font-medium truncate w-full" title={item.area}>
                  {item.area}
                </div>
                <div className="flex items-center gap-1.5 mt-2">
                  {getWeatherIcon(item.forecast, 'w-4 h-4')}
                  <span
                    className={`text-[11px] truncate ${
                      isSelected
                        ? isDark
                          ? 'text-cyan-200'
                          : 'text-slate-700 font-medium'
                        : isDark
                        ? 'text-cyan-300/70'
                        : 'text-slate-500'
                    }`}
                  >
                    {item.condition}
                  </span>
                </div>
              </button>
            );
          })
        ) : (
          <div className={`col-span-full py-6 text-center text-xs ${isDark ? 'text-cyan-200/60' : 'text-slate-500'}`}>
            No areas matching &ldquo;{searchTerm}&rdquo;
          </div>
        )}
      </div>
    </div>
  );
};

