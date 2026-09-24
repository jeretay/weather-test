import React from 'react';
import { WeatherData } from '../types/weather';
import { Thermometer, Droplets, Wind, CloudRain, Gauge, Activity } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface MetricsGridProps {
  data: WeatherData;
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({ data }) => {
  const { isDark } = useTheme();

  const metrics = [
    {
      label: 'Ambient Temperature',
      value: `${data.temperature}`,
      unit: '°C',
      subtext: `Normal tropical range (28°C - 33°C)`,
      icon: <Thermometer className={`w-4 h-4 ${isDark ? 'text-amber-400' : 'text-amber-500'}`} />,
    },
    {
      label: 'Feels Like',
      value: `${data.feelsLike}`,
      unit: '°C',
      subtext: `Humidity-adjusted heat index`,
      icon: <Activity className={`w-4 h-4 ${isDark ? 'text-teal-300' : 'text-teal-600'}`} />,
    },
    {
      label: 'Relative Humidity',
      value: `${data.humidity}`,
      unit: '%',
      subtext: data.humidity >= 85 ? 'High equatorial maritime moisture' : 'Comfortable sea breeze humidity',
      icon: <Droplets className={`w-4 h-4 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />,
    },
    {
      label: 'Wind Speed',
      value: `${data.windSpeed}`,
      unit: 'km/h',
      subtext: data.windSpeed > 20 ? 'Fresh offshore coastal wind' : 'Gentle sea breeze',
      icon: <Wind className={`w-4 h-4 ${isDark ? 'text-sky-300' : 'text-sky-600'}`} />,
    },
    {
      label: 'Rainfall Volume',
      value: `${data.rainfall}`,
      unit: 'mm',
      subtext: data.rainfall > 0 ? 'Sensor precipitation active' : 'Clear coastal conditions',
      icon: <CloudRain className={`w-4 h-4 ${isDark ? 'text-cyan-300' : 'text-cyan-600'}`} />,
    },
    {
      label: 'Air Quality (24h PSI)',
      value: `${data.psi?.value ?? 65}`,
      unit: 'PSI',
      subtext: `PM2.5: ${data.psi?.pm25 ?? 24} µg/m³ · ${data.psi?.status ?? 'Moderate'}`,
      icon: <Gauge className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {metrics.map((m, idx) => (
        <div
          key={idx}
          className={`rounded-xl p-4 flex flex-col justify-between transition-all duration-200 border shadow-xs ${
            isDark
              ? 'bg-[#0a1f2e]/80 border-[#163a54] hover:border-cyan-500/50'
              : 'bg-white border-sky-100 hover:border-sky-300 hover:shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-medium ${isDark ? 'text-cyan-200/70' : 'text-slate-500'}`}>
              {m.label}
            </span>
            {m.icon}
          </div>

          <div className="flex items-baseline gap-1 my-1">
            <span
              className={`text-2xl font-bold font-mono tabular-nums ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              {m.value}
            </span>
            <span className={`text-xs font-mono ${isDark ? 'text-cyan-300/70' : 'text-slate-400'}`}>
              {m.unit}
            </span>
          </div>

          <div className={`text-[11px] line-clamp-1 mt-1 ${isDark ? 'text-cyan-200/60' : 'text-slate-500'}`}>
            {m.subtext}
          </div>
        </div>
      ))}
    </div>
  );
};

