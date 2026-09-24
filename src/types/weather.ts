export interface ForecastPeriod {
  period: string;
  condition: string;
  summary: string;
  temperature: number;
  humidity: number;
}

export interface AreaForecast {
  area: string;
  forecast: string;
  condition: string;
  region?: 'North' | 'South' | 'East' | 'West' | 'Central';
  lat?: number;
  lng?: number;
  temperature?: number;
}

export interface RegionWeather {
  region: 'North' | 'South' | 'East' | 'West' | 'Central';
  condition: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  psi: number;
  pm25: number;
  areasCount: number;
  center: {
    lat: number;
    lng: number;
  };
  areas: AreaForecast[];
}

export interface PsiInfo {
  value: number;
  status: string;
  pm25: number;
}

export interface WeatherData {
  location: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  condition: string;
  rainfall: number;
  windSpeed: number;
  forecast: ForecastPeriod[];
  lastUpdated: string;
  current?: {
    temp_c: number;
    feelslike_c?: number;
    humidity: number;
    wind_kph: number;
    precip_mm?: number;
    condition: {
      text: string;
    };
  };
  psi?: PsiInfo;
  areaForecasts?: AreaForecast[];
  regionalWeather?: RegionWeather[];
  validPeriod?: string;
}

export interface HealthData {
  status: string;
  keyConfigured: boolean;
  providerResponding: boolean;
  upstreamStatus: number;
  timestamp?: string;
}
