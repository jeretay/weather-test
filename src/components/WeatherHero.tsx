import React from 'react';
import { WeatherData } from '../types/weather';
import { getWeatherIcon } from '../utils/weatherIcons';
import { MapPin, Clock } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface WeatherHeroProps {
  data: WeatherData;
}

export const WeatherHero: React.FC<WeatherHeroProps> = ({ data }) => {
  const { isDark } = useTheme();

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
    <div
      className={`relative overflow-hidden rounded-2xl border p-6 md:p-8 transition-colors duration-200 shadow-xl ${
        isDark
          ? 'bg-gradient-to-br from-[#0d263b] via-[#091d2c] to-[#061421] border-[#173e5a] text-cyan-50'
          : 'bg-gradient-to-br from-[#ffffff] via-[#f1f9fe] to-[#e0f2fe] border-[#bae6fd] text-slate-900 shadow-sky-950/5'
      }`}
    >
      {/* Subtle ambient sea breeze background glow */}
      <div
        className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl opacity-20"
        style={{
          backgroundColor: isRainy ? (isDark ? '#0284c7' : '#38bdf8') : (isDark ? '#14b8a6' : '#2dd4bf'),
        }}
      />

      {/* Location and timestamp ribbon */}
      <div
        className={`flex flex-wrap items-center justify-between gap-3 text-xs mb-6 ${
          isDark ? 'text-cyan-200/70' : 'text-slate-500'
        }`}
      >
        <div className="flex items-center gap-2">
          <MapPin className={`w-3.5 h-3.5 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
          <span className={`font-semibold text-sm tracking-wide ${isDark ? 'text-cyan-100' : 'text-slate-800'}`}>
            {data.location}
          </span>
          <span aria-hidden="true" className={isDark ? 'text-cyan-900' : 'text-slate-300'}>
            ·
          </span>
          <span className={isDark ? 'text-cyan-300/80' : 'text-slate-600'}>
            Republic of Singapore
          </span>
        </div>

        <div className={`flex items-center gap-2 ${isDark ? 'text-cyan-200/70' : 'text-slate-500'}`}>
          <Clock className={`w-3.5 h-3.5 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
          <span>Updated {formatTime(data.lastUpdated)} SGT</span>
          {data.validPeriod && (
            <>
              <span aria-hidden="true" className={isDark ? 'text-cyan-900' : 'text-slate-300'}>
                ·
              </span>
              <span className={isDark ? 'text-cyan-200' : 'text-slate-700 font-medium'}>
                Valid: {data.validPeriod}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Main Temperature and Condition row */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-7 flex items-baseline gap-4">
          <div className="flex items-start">
            <span
              className={`text-6xl md:text-7xl lg:text-8xl font-bold tracking-tighter font-mono tabular-nums ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              {data.temperature}
            </span>
            <span className={`text-3xl md:text-4xl font-light ml-1 ${isDark ? 'text-cyan-200/70' : 'text-slate-400'}`}>
              °C
            </span>
          </div>

          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-1">
              {getWeatherIcon(data.condition, 'w-7 h-7')}
              <span className={`text-xl md:text-2xl font-semibold ${isDark ? 'text-cyan-50' : 'text-slate-900'}`}>
                {data.condition}
              </span>
            </div>
            <div className={`text-sm ${isDark ? 'text-cyan-200/70' : 'text-slate-600'}`}>
              Feels like{' '}
              <span className={`font-mono font-medium ${isDark ? 'text-cyan-100' : 'text-slate-900'}`}>
                {data.feelsLike}°C
              </span>
            </div>
          </div>
        </div>

        {/* Quick summary highlights */}
        <div
          className={`md:col-span-5 grid grid-cols-2 gap-3 pt-4 md:pt-0 border-t md:border-t-0 md:border-l md:pl-6 ${
            isDark ? 'border-[#173e5a]' : 'border-sky-200'
          }`}
        >
          <div
            className={`rounded-xl p-3 border transition-colors ${
              isDark
                ? 'bg-[#0a1e2d]/80 border-[#163a54]'
                : 'bg-white/90 border-sky-100 shadow-xs'
            }`}
          >
            <span className={`text-xs block mb-1 ${isDark ? 'text-cyan-200/70' : 'text-slate-500'}`}>
              Precipitation
            </span>
            <span
              className={`text-lg font-semibold font-mono tabular-nums ${
                isDark ? 'text-cyan-50' : 'text-slate-900'
              }`}
            >
              {data.rainfall}{' '}
              <span className={`text-xs font-normal ${isDark ? 'text-cyan-300/70' : 'text-slate-400'}`}>
                mm
              </span>
            </span>
            <span className={`text-xs block mt-0.5 ${isDark ? 'text-cyan-200/60' : 'text-slate-500'}`}>
              {data.rainfall > 0 ? 'Active sea showers' : 'No rain detected'}
            </span>
          </div>

          <div
            className={`rounded-xl p-3 border transition-colors ${
              isDark
                ? 'bg-[#0a1e2d]/80 border-[#163a54]'
                : 'bg-white/90 border-sky-100 shadow-xs'
            }`}
          >
            <span className={`text-xs block mb-1 ${isDark ? 'text-cyan-200/70' : 'text-slate-500'}`}>
              Air Quality
            </span>
            <span
              className={`text-lg font-semibold font-mono tabular-nums ${
                isDark ? 'text-cyan-50' : 'text-slate-900'
              }`}
            >
              {data.psi?.value ?? 65}{' '}
              <span className={`text-xs font-normal ${isDark ? 'text-cyan-300/70' : 'text-slate-400'}`}>
                PSI
              </span>
            </span>
            <span className={`text-xs block mt-0.5 font-medium ${isDark ? 'text-teal-300' : 'text-teal-700'}`}>
              {data.psi?.status ?? 'Moderate'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

