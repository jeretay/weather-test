import React from 'react';
import { ForecastPeriod } from '../types/weather';
import { getWeatherIcon } from '../utils/weatherIcons';
import { Calendar, Droplets } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface ForecastListProps {
  forecasts: ForecastPeriod[];
}

export const ForecastList: React.FC<ForecastListProps> = ({ forecasts }) => {
  const { isDark } = useTheme();

  if (!forecasts || forecasts.length === 0) {
    return null;
  }

  return (
    <div
      className={`border rounded-2xl p-6 transition-all duration-200 shadow-sm ${
        isDark ? 'bg-[#0a1e2d]/80 border-[#163a54]' : 'bg-white border-sky-100 shadow-sky-950/5'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className={`w-4 h-4 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
          <h2 className={`text-base font-semibold ${isDark ? 'text-cyan-50' : 'text-slate-900'}`}>
            Upcoming Forecast Periods
          </h2>
        </div>
        <div className={`text-xs ${isDark ? 'text-cyan-200/70' : 'text-slate-500'}`}>
          Diurnal forecast projection
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {forecasts.map((f, idx) => (
          <div
            key={idx}
            className={`border rounded-xl p-4 flex flex-col justify-between transition-colors shadow-xs ${
              isDark
                ? 'bg-[#0a1e2d]/90 hover:bg-[#0d273a] border-[#173e5a]'
                : 'bg-[#f0f7fb] hover:bg-[#e4eff6] border-sky-200'
            }`}
          >
            <div>
              <div
                className={`text-xs font-medium mb-2 truncate ${
                  isDark ? 'text-cyan-200/70' : 'text-slate-500'
                }`}
                title={f.period}
              >
                {f.period}
              </div>

              <div className="flex items-center gap-2.5 my-2">
                {getWeatherIcon(f.condition, 'w-6 h-6')}
                <div>
                  <div
                    className={`text-xl font-bold font-mono tabular-nums ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    {f.temperature}°C
                  </div>
                  <div className={`text-xs font-medium ${isDark ? 'text-cyan-100' : 'text-slate-700'}`}>
                    {f.condition}
                  </div>
                </div>
              </div>
            </div>

            <div
              className={`mt-3 pt-3 border-t text-xs flex items-center justify-between ${
                isDark ? 'border-[#173e5a] text-cyan-200/70' : 'border-sky-200/80 text-slate-500'
              }`}
            >
              <span className={`flex items-center gap-1 ${isDark ? 'text-cyan-200' : 'text-slate-700 font-medium'}`}>
                <Droplets className={`w-3 h-3 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
                <span className="font-mono tabular-nums">{f.humidity}%</span>
              </span>
              <span
                className={`text-[11px] truncate max-w-[100px] ${
                  isDark ? 'text-cyan-300/70' : 'text-slate-500'
                }`}
                title={f.summary}
              >
                {f.summary}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

