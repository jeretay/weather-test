import React from 'react';
import { WeatherData } from '../types/weather';
import { getWeatherIcon } from '../utils/weatherIcons';
import { MapPin, Clock } from 'lucide-react';

interface WeatherHeroProps {
  data: WeatherData;
}

export const WeatherHero: React.FC<WeatherHeroProps> = ({ data }) => {
  // Format last updated time to local friendly format
  const formatTime = (isoString?: string) => {
    if (!isoString) return 'Just now';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return isoString;
    }
  };

  const isRainy = data.rainfall > 0 || data.condition.toLowerCase().includes('rain') || data.condition.toLowerCase().includes('shower');

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0d263b] via-[#091d2c] to-[#061421] border border-[#173e5a] p-6 md:p-8 text-cyan-50 shadow-xl">
      {/* Subtle ambient sea breeze background glow */}
      <div
        className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl opacity-20"
        style={{
          backgroundColor: isRainy ? '#0284c7' : '#14b8a6',
        }}
      />

      {/* Location and timestamp ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-cyan-200/70 mb-6">
        <div className="flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-medium text-cyan-100 text-sm tracking-wide">{data.location}</span>
          <span aria-hidden="true" className="text-cyan-900">·</span>
          <span className="text-cyan-300/80">Republic of Singapore</span>
        </div>

        <div className="flex items-center gap-2 text-cyan-200/70">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>Updated {formatTime(data.lastUpdated)} SGT</span>
          {data.validPeriod && (
            <>
              <span aria-hidden="true" className="text-cyan-900">·</span>
              <span className="text-cyan-200">Valid: {data.validPeriod}</span>
            </>
          )}
        </div>
      </div>

      {/* Main Temperature and Condition row */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-7 flex items-baseline gap-4">
          <div className="flex items-start">
            <span className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tighter font-mono tabular-nums text-white">
              {data.temperature}
            </span>
            <span className="text-3xl md:text-4xl font-light text-cyan-200/70 ml-1">°C</span>
          </div>

          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-1">
              {getWeatherIcon(data.condition, 'w-7 h-7')}
              <span className="text-xl md:text-2xl font-semibold text-cyan-50">
                {data.condition}
              </span>
            </div>
            <div className="text-sm text-cyan-200/70">
              Feels like <span className="text-cyan-100 font-mono font-medium">{data.feelsLike}°C</span>
            </div>
          </div>
        </div>

        {/* Quick summary highlights */}
        <div className="md:col-span-5 grid grid-cols-2 gap-3 pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-[#173e5a] md:pl-6">
          <div className="bg-[#0a1e2d]/80 rounded-xl p-3 border border-[#163a54]">
            <span className="text-xs text-cyan-200/70 block mb-1">Precipitation</span>
            <span className="text-lg font-semibold font-mono tabular-nums text-cyan-50">
              {data.rainfall} <span className="text-xs text-cyan-300/70 font-normal">mm</span>
            </span>
            <span className="text-xs text-cyan-200/60 block mt-0.5">
              {data.rainfall > 0 ? 'Active sea showers' : 'No rain detected'}
            </span>
          </div>

          <div className="bg-[#0a1e2d]/80 rounded-xl p-3 border border-[#163a54]">
            <span className="text-xs text-cyan-200/70 block mb-1">Air Quality</span>
            <span className="text-lg font-semibold font-mono tabular-nums text-cyan-50">
              {data.psi?.value ?? 65} <span className="text-xs text-cyan-300/70 font-normal">PSI</span>
            </span>
            <span className="text-xs text-teal-300 block mt-0.5">
              {data.psi?.status ?? 'Moderate'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
