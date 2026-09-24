import React from 'react';
import {
  Cloud,
  CloudLightning,
  CloudRain,
  CloudSun,
  Sun,
  Wind,
} from 'lucide-react';

export function getWeatherIcon(condition: string, className = 'w-6 h-6') {
  const cond = (condition || '').toLowerCase();

  if (cond.includes('thunder') || cond.includes('lightning')) {
    return <CloudLightning className={`${className} text-teal-300`} />;
  }
  if (cond.includes('rain') || cond.includes('shower') || cond.includes('drizzle')) {
    return <CloudRain className={`${className} text-cyan-300`} />;
  }
  if (cond.includes('fair') || cond.includes('sunny') || cond.includes('clear')) {
    return <Sun className={`${className} text-amber-300`} />;
  }
  if (cond.includes('cloudy') || cond.includes('overcast')) {
    if (cond.includes('partly')) {
      return <CloudSun className={`${className} text-sky-300`} />;
    }
    return <Cloud className={`${className} text-slate-300`} />;
  }
  if (cond.includes('hazy') || cond.includes('mist') || cond.includes('fog') || cond.includes('wind')) {
    return <Wind className={`${className} text-teal-300`} />;
  }

  return <CloudSun className={`${className} text-cyan-200`} />;
}
