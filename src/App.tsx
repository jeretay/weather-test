import { useState, useEffect, useCallback } from 'react';
import { WeatherData, HealthData } from './types/weather';
import { WeatherHero } from './components/WeatherHero';
import { MetricsGrid } from './components/MetricsGrid';
import { SingaporeMap } from './components/SingaporeMap';
import { ForecastList } from './components/ForecastList';
import { AreaSelector } from './components/AreaSelector';
import { HealthStatusModal } from './components/HealthStatusModal';
import { RefreshCw, AlertCircle, Activity, Sparkles } from 'lucide-react';

const REFRESH_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

export default function App() {
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
    <div className="min-h-screen bg-[#06131e] text-slate-100 flex flex-col justify-between selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Bar Contract: 3 zones */}
      <header className="border-b border-[#14354c] bg-[#071624]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Singapore Live Weather
            </span>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-cyan-200/70">
            <button
              onClick={() => setSelectedLocation('Singapore')}
              className={`hover:text-white transition-colors ${
                selectedLocation.toLowerCase() === 'singapore' ? 'text-cyan-400 font-semibold' : ''
              }`}
            >
              National Overview
            </button>
            <a href="#map" className="hover:text-white transition-colors">
              SLA Live Map
            </a>
            <a href="#areas" className="hover:text-white transition-colors">
              Area Explorer
            </a>
            <a href="#forecasts" className="hover:text-white transition-colors">
              24-Hour Outlook
            </a>
            <button
              onClick={handleOpenHealth}
              className="hover:text-white transition-colors flex items-center gap-1.5"
            >
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>System Health</span>
            </button>
          </nav>

          {/* Zone 3: Primary Actions */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-cyan-200/70 font-mono">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              <span>Auto-refresh: {timeFormatted}</span>
            </div>

            <button
              onClick={() => fetchWeather(selectedLocation)}
              disabled={loading}
              className="px-3 py-1.5 text-xs font-medium text-cyan-100 bg-[#0c2436] hover:bg-[#12344d] active:bg-[#174262] rounded-lg border border-[#194362] transition-colors flex items-center gap-1.5 disabled:opacity-50"
              title="Refresh weather data now"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        {/* Loading skeleton state */}
        {loading && !weather && (
          <div className="space-y-6 animate-pulse">
            <div className="h-64 rounded-2xl bg-[#091f30] border border-[#143750]" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-24 rounded-xl bg-[#091f30] border border-[#143750]" />
              ))}
            </div>
            <div className="h-44 rounded-2xl bg-[#091f30] border border-[#143750]" />
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="rounded-2xl bg-[#19111c]/80 border border-rose-950/80 p-6 text-center space-y-3 shadow-lg">
            <div className="w-10 h-10 rounded-full bg-rose-950/60 border border-rose-900/60 flex items-center justify-center mx-auto text-rose-400">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-slate-100">
              Weather data temporarily unavailable
            </h3>
            <p className="text-xs text-cyan-200/70 max-w-md mx-auto">
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
                className="px-4 py-2 text-xs font-medium rounded-lg bg-[#0c2436] hover:bg-[#12344d] text-cyan-200 border border-[#194362] transition-colors"
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
      <footer className="border-t border-[#14354c] bg-[#06131e]/90 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-cyan-300/60 space-y-2">
          <p className="max-w-3xl mx-auto leading-relaxed">
            Weather information is provided for informational purposes only. This website is an independent project and is not affiliated with, endorsed by, or operated by any government agency or weather provider.
          </p>
          <div className="text-[11px] text-cyan-400/40">
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
