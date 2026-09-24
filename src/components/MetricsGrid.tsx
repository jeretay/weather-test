import React from 'react';
import { WeatherData } from '../types/weather';
import { Thermometer, Droplets, Wind, CloudRain, Gauge, Activity } from 'lucide-react';

interface MetricsGridProps {
  data: WeatherData;
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({ data }) => {
  const metrics = [
    {
      label: 'Ambient Temperature',
      value: `${data.temperature}`,
      unit: '°C',
      subtext: `Normal tropical range (28°C - 33°C)`,
      icon: <Thermometer className="w-4 h-4 text-amber-400" />,
    },
    {
      label: 'Feels Like',
      value: `${data.feelsLike}`,
      unit: '°C',
      subtext: `Humidity-adjusted heat index`,
      icon: <Activity className="w-4 h-4 text-teal-300" />,
    },
    {
      label: 'Relative Humidity',
      value: `${data.humidity}`,
      unit: '%',
      subtext: data.humidity >= 85 ? 'High equatorial maritime moisture' : 'Comfortable sea breeze humidity',
      icon: <Droplets className="w-4 h-4 text-cyan-400" />,
    },
    {
      label: 'Wind Speed',
      value: `${data.windSpeed}`,
      unit: 'km/h',
      subtext: data.windSpeed > 20 ? 'Fresh offshore coastal wind' : 'Gentle sea breeze',
      icon: <Wind className="w-4 h-4 text-sky-300" />,
    },
    {
      label: 'Rainfall Volume',
      value: `${data.rainfall}`,
      unit: 'mm',
      subtext: data.rainfall > 0 ? 'Sensor precipitation active' : 'Clear coastal conditions',
      icon: <CloudRain className="w-4 h-4 text-cyan-300" />,
    },
    {
      label: 'Air Quality (24h PSI)',
      value: `${data.psi?.value ?? 65}`,
      unit: 'PSI',
      subtext: `PM2.5: ${data.psi?.pm25 ?? 24} µg/m³ · ${data.psi?.status ?? 'Moderate'}`,
      icon: <Gauge className="w-4 h-4 text-emerald-400" />,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {metrics.map((m, idx) => (
        <div
          key={idx}
          className="bg-[#0a1f2e]/80 border border-[#163a54] rounded-xl p-4 flex flex-col justify-between hover:border-cyan-500/50 transition-colors shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-cyan-200/70">{m.label}</span>
            {m.icon}
          </div>

          <div className="flex items-baseline gap-1 my-1">
            <span className="text-2xl font-bold font-mono tabular-nums text-white">
              {m.value}
            </span>
            <span className="text-xs font-mono text-cyan-300/70">{m.unit}</span>
          </div>

          <div className="text-[11px] text-cyan-200/60 line-clamp-1 mt-1">
            {m.subtext}
          </div>
        </div>
      ))}
    </div>
  );
};
