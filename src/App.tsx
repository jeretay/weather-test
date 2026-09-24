import { useState, useEffect, useCallback } from 'react';
import { WeatherData, HealthData } from './types/weather';
import { WeatherHero } from './components/WeatherHero';
import { MetricsGrid } from './components/MetricsGrid';
import { SingaporeMap } from './components/SingaporeMap';
import { ForecastList } from './components/ForecastList';
import { AreaSelector } from './components/AreaSelector';
import { HealthStatusModal } from './components/HealthStatusModal';
import { ThemeToggle } from './components/ThemeToggle';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { RefreshCw, AlertCircle, Activity, Sparkles } from 'lucide-react';

const REFRESH_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

function WeatherApp() {
  const { isDark } = useTheme();
  const [selectedLocation, setSelectedLocation] = useState<string>('Singapore');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date>(new Date());
  const [nextRefreshSeconds, setNextRefreshSeconds] = useState<number>(600);

  // Health check state
  const [healthModalOpen, setHealthModalOpen] = useState<boolean>(false);
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [healthLoading, setHealthLoading] = useState<boolean>(false);

  // Fetch weather from serverless API route
  const fetchWeather = useCallback(async (location = 'Singapore') => {
    setLoading(true);
    setError(null);
    try {
      const url = `/api/weather?location=${encodeURIComponent(location)}`;
      const res = await fetch(url);

      if (!res.ok) {
        throw new Error('Weather data temporarily unavailable');
      }

      const data: WeatherData = await res.json();

      // Guardrail validation: never emit NaN or null temperatures or undefined conditions
      if (
        data.temperature === null ||
        isNaN(data.temperature) ||
        !data.condition
      ) {
        throw new Error('Weather data temporarily unavailable');
      }

      setWeather(data);
      setLastRefreshedAt(new Date());
      setNextRefreshSeconds(600);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Weather data temporarily unavailable';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch health status
  const fetchHealth = useCallback(async () => {
    setHealthLoading(true);
    try {
      const res = await fetch('/api/health');
      const data: HealthData = await res.json();
      setHealthData(data);
    } catch {
      setHealthData({
        status: 'error',
        keyConfigured: false,
        providerResponding: false,
        upstreamStatus: 503,
      });
    } finally {
      setHealthLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchWeather(selectedLocation);
  }, [fetchWeather, selectedLocation]);

  // Auto-refresh interval (every 10 minutes)
  useEffect(() => {
    const timer = setInterval(() => {
      fetchWeather(selectedLocation);
    }, REFRESH_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [fetchWeather, selectedLocation]);

  // Countdown timer for next 10-minute refresh
  useEffect(() => {
    const secondTimer = setInterval(() => {
      setNextRefreshSeconds((prev) => (prev > 0 ? prev - 1 : 600));
    }, 1000);

    return () => clearInterval(secondTimer);
  }, []);

  const handleSelectArea = (areaName: string) => {
    setSelectedLocation(areaName);
  };

  const handleOpenHealth = () => {
    setHealthModalOpen(true);
    fetchHealth();
  };

  const minutesRemaining = Math.floor(nextRefreshSeconds / 60);
  const secondsRemaining = nextRefreshSeconds % 60;
  const timeFormatted = `${minutesRemaining}:${secondsRemaining < 10 ? '0' : ''}${secondsRemaining}`;

  return (
    <div
      className={`min-h-screen flex flex-col justify-between transition-colors duration-200 ${
        isDark
          ? 'bg-[#06131e] text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200'
          : 'bg-[#f0f7fb] text-slate-800 selection:bg-cyan-500/30 selection:text-cyan-900'
      }`}
    >
      {/* Top Bar Contract: 3 zones */}
      <header
        className={`border-b sticky top-0 z-40 backdrop-blur-md transition-colors duration-200 ${
          isDark
            ? 'border-[#14354c] bg-[#071624]/90'
            : 'border-sky-200/80 bg-white/90 shadow-xs'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-2">
            <span
              className={`text-lg font-bold tracking-tight flex items-center gap-2 ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              <Sparkles className={`w-4 h-4 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
              Singapore Live Weather
            </span>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav
            className={`hidden md:flex items-center gap-6 text-xs font-medium ${
              isDark ? 'text-cyan-200/70' : 'text-slate-500'
            }`}
          >
            <button
              onClick={() => setSelectedLocation('Singapore')}
              className={`transition-colors ${
                selectedLocation.toLowerCase() === 'singapore'
                  ? isDark
                    ? 'text-cyan-400 font-semibold'
                    : 'text-cyan-600 font-semibold'
                  : isDark
                  ? 'hover:text-white'
                  : 'hover:text-slate-900'
              }`}
            >
              National Overview
            </button>
            <a
              href="#map"
              className={isDark ? 'hover:text-white transition-colors' : 'hover:text-slate-900 transition-colors'}
            >
              SLA Live Map
            </a>
            <a
              href="#areas"
              className={isDark ? 'hover:text-white transition-colors' : 'hover:text-slate-900 transition-colors'}
            >
              Area Explorer
            </a>
            <a
              href="#forecasts"
              className={isDark ? 'hover:text-white transition-colors' : 'hover:text-slate-900 transition-colors'}
            >
              24-Hour Outlook
            </a>
            <button
              onClick={handleOpenHealth}
              className={`flex items-center gap-1.5 transition-colors ${
                isDark ? 'hover:text-white' : 'hover:text-slate-900'
              }`}
            >
              <Activity className={`w-3.5 h-3.5 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
              <span>System Health</span>
            </button>
          </nav>

          {/* Zone 3: Primary Actions + Theme Toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div
              className={`hidden lg:flex items-center gap-1.5 text-xs font-mono ${
                isDark ? 'text-cyan-200/70' : 'text-slate-500'
              }`}
            >
              <span className={`w-2 h-2 rounded-full animate-pulse ${isDark ? 'bg-teal-400' : 'bg-teal-500'}`} />
              <span>Auto-refresh: {timeFormatted}</span>
            </div>

            {/* Theme Toggle Button */}
            <ThemeToggle />

            {/* Refresh Button */}
            <button
              onClick={() => fetchWeather(selectedLocation)}
              disabled={loading}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors flex items-center gap-1.5 disabled:opacity-50 ${
                isDark
                  ? 'text-cyan-100 bg-[#0c2436] hover:bg-[#12344d] active:bg-[#174262] border-[#194362]'
                  : 'text-slate-700 bg-white hover:bg-sky-50 active:bg-sky-100 border-sky-200 shadow-xs'
              }`}
              title="Refresh weather data now"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${
                  loading ? (isDark ? 'animate-spin text-cyan-400' : 'animate-spin text-cyan-600') : ''
                }`}
              />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        {/* Loading skeleton state */}
        {loading && !weather && (
          <div className="space-y-6 animate-pulse">
            <div
              className={`h-64 rounded-2xl border ${
                isDark ? 'bg-[#091f30] border-[#143750]' : 'bg-slate-200/70 border-slate-300'
              }`}
            />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className={`h-24 rounded-xl border ${
                    isDark ? 'bg-[#091f30] border-[#143750]' : 'bg-slate-200/70 border-slate-300'
                  }`}
                />
              ))}
            </div>
            <div
              className={`h-44 rounded-2xl border ${
                isDark ? 'bg-[#091f30] border-[#143750]' : 'bg-slate-200/70 border-slate-300'
              }`}
            />
          </div>
        )}

        {/* Error state */}
        {error && (
          <div
            className={`rounded-2xl p-6 text-center space-y-3 shadow-lg border ${
              isDark ? 'bg-[#19111c]/80 border-rose-950/80' : 'bg-rose-50/90 border-rose-200'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto border ${
                isDark
                  ? 'bg-rose-950/60 border-rose-900/60 text-rose-400'
                  : 'bg-rose-100 border-rose-300 text-rose-600'
              }`}
            >
              <AlertCircle className="w-5 h-5" />
            </div>
            <h3 className={`text-base font-semibold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
              Weather data temporarily unavailable
            </h3>
            <p className={`text-xs max-w-md mx-auto ${isDark ? 'text-cyan-200/70' : 'text-slate-600'}`}>
              We were unable to retrieve the latest readings from the Singapore weather service.
              Please check back shortly or verify service status.
            </p>
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                onClick={() => fetchWeather(selectedLocation)}
                className="px-4 py-2 text-xs font-medium rounded-lg bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white transition-colors"
              >
                Retry Loading
              </button>
              <button
                onClick={handleOpenHealth}
                className={`px-4 py-2 text-xs font-medium rounded-lg border transition-colors ${
                  isDark
                    ? 'bg-[#0c2436] hover:bg-[#12344d] text-cyan-200 border-[#194362]'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-xs'
                }`}
              >
                Check System Health
              </button>
            </div>
          </div>
        )}

        {/* Live Weather Content */}
        {weather && (
          <div className="space-y-6">
            {/* Primary Hero Banner */}
            <WeatherHero data={weather} />

            {/* Weather Metrics Grid */}
            <MetricsGrid data={weather} />

            {/* Singapore Land Authority (OneMap) Regional Weather Map */}
            {weather.areaForecasts && weather.areaForecasts.length > 0 && (
              <div id="map">
                <SingaporeMap
                  currentLocation={weather.location}
                  areaForecasts={weather.areaForecasts}
                  regionalWeather={weather.regionalWeather}
                  onSelectArea={handleSelectArea}
                />
              </div>
            )}

            {/* Upcoming Forecast Cards */}
            <div id="forecasts">
              <ForecastList forecasts={weather.forecast} />
            </div>

            {/* Singapore Area Explorer */}
            {weather.areaForecasts && weather.areaForecasts.length > 0 && (
              <div id="areas">
                <AreaSelector
                  currentLocation={weather.location}
                  areas={weather.areaForecasts}
                  onSelectArea={handleSelectArea}
                />
              </div>
            )}
          </div>
        )}
      </main>

      {/* Mandatory Footer */}
      <footer
        className={`border-t py-6 mt-12 transition-colors duration-200 ${
          isDark
            ? 'border-[#14354c] bg-[#06131e]/90 text-cyan-300/60'
            : 'border-sky-200 bg-white/80 text-slate-500'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs space-y-2">
          <p className="max-w-3xl mx-auto leading-relaxed">
            Weather information is provided for informational purposes only. This website is an independent project and is not affiliated with, endorsed by, or operated by any government agency or weather provider.
          </p>
          <div className={`text-[11px] ${isDark ? 'text-cyan-400/40' : 'text-slate-400'}`}>
            Automated refresh every 10 minutes · Last synced: {lastRefreshedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
        </div>
      </footer>

      {/* Health check modal */}
      <HealthStatusModal
        isOpen={healthModalOpen}
        onClose={() => setHealthModalOpen(false)}
        health={healthData}
        isLoading={healthLoading}
        onRefresh={fetchHealth}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <WeatherApp />
    </ThemeProvider>
  );
}
