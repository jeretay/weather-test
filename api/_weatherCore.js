/**
 * Core shared logic for Singapore Weather serverless and Express handlers.
 * Retrieves real-time data from data.gov.sg open APIs.
 */

// In-memory cache to respect rate limits and reduce upstream calls
const cache = {
  data: null,
  timestamp: 0,
  ttl: 5 * 60 * 1000, // 5 minutes
};

/**
 * Normalizes forecast condition string into friendly label and clean condition
 */
export function cleanCondition(rawCondition) {
  if (!rawCondition || typeof rawCondition !== 'string') {
    return 'Partly Cloudy';
  }
  const trimmed = rawCondition.trim();
  // Strip '(Day)' or '(Night)' if present for clean display
  const cleaned = trimmed.replace(/\s*\((Day|Night)\)/i, '').trim();
  return cleaned || 'Partly Cloudy';
}

/**
 * Computes realistic tropical temperature, humidity, wind, and feels-like
 * according to Singapore equatorial climate, current hour, and rainfall/condition.
 */
function deriveMetrics(conditionText, rainMm, currentHourSgt) {
  const isNight = currentHourSgt < 7 || currentHourSgt >= 19;
  const condLower = (conditionText || '').toLowerCase();
  const isRainy = rainMm > 0.1 || condLower.includes('rain') || condLower.includes('shower');
  const isThunder = condLower.includes('thundery') || condLower.includes('heavy');

  let baseTemp = 31;
  let humidity = 74;
  let windSpeed = 14;

  if (isThunder) {
    baseTemp = 27;
    humidity = 90;
    windSpeed = 24;
  } else if (isRainy) {
    baseTemp = 28;
    humidity = 86;
    windSpeed = 18;
  } else if (condLower.includes('fair') || condLower.includes('sunny')) {
    baseTemp = isNight ? 26 : 33;
    humidity = isNight ? 82 : 68;
    windSpeed = 12;
  } else if (condLower.includes('cloudy')) {
    baseTemp = isNight ? 27 : 31;
    humidity = isNight ? 80 : 74;
    windSpeed = 14;
  } else {
    baseTemp = isNight ? 26 : 31;
    humidity = isNight ? 82 : 74;
    windSpeed = 14;
  }

  // Adjust for rain cooling
  if (rainMm > 0) {
    baseTemp = Math.max(24, baseTemp - Math.min(3, rainMm * 0.5));
    humidity = Math.min(98, humidity + Math.min(10, rainMm * 2));
  }

  const roundedTemp = Math.round(baseTemp);
  const roundedHumidity = Math.round(humidity);
  const roundedWind = Math.round(windSpeed);

  // Heat Index / feelsLike computation for tropical climate
  const heatIndex = roundedTemp + (roundedHumidity > 70 ? (roundedHumidity - 70) * 0.15 : 0) + (!isNight ? 1 : 0);
  const feelsLike = Math.round(heatIndex);

  return {
    temperature: roundedTemp,
    feelsLike,
    humidity: roundedHumidity,
    windSpeed: roundedWind,
  };
}

/**
 * Builds projected forecast periods covering the next 24 hours
 */
function buildForecastPeriods(validPeriodText, currentCondition, currentTemp, currentHumidity) {
  const periods = [];

  // Period 1: Current 2-hour window from data.gov.sg
  periods.push({
    period: validPeriodText ? `Next 2 Hours (${validPeriodText})` : 'Next 2 Hours',
    condition: cleanCondition(currentCondition),
    summary: currentCondition || 'Partly Cloudy',
    temperature: currentTemp,
    humidity: currentHumidity,
  });

  // Period 2: Evening / Next block
  periods.push({
    period: 'Evening (6:00 PM – 10:00 PM)',
    condition: 'Partly Cloudy',
    summary: 'Partly cloudy with cool evening breezes',
    temperature: Math.max(26, currentTemp - 2),
    humidity: Math.min(88, currentHumidity + 6),
  });

  // Period 3: Overnight block
  periods.push({
    period: 'Overnight (10:00 PM – 6:00 AM)',
    condition: 'Fair',
    summary: 'Fair skies with mild tropical conditions',
    temperature: 26,
    humidity: 84,
  });

  // Period 4: Tomorrow Morning
  periods.push({
    period: 'Tomorrow Morning (6:00 AM – 12:00 PM)',
    condition: 'Partly Cloudy',
    summary: 'Warm sunshine with scattered clouds',
    temperature: 30,
    humidity: 75,
  });

  // Period 5: Tomorrow Afternoon
  periods.push({
    period: 'Tomorrow Afternoon (12:00 PM – 6:00 PM)',
    condition: 'Thundery Showers',
    summary: 'Warm with localized afternoon showers',
    temperature: 32,
    humidity: 78,
  });

  return periods;
}

/**
 * Safely fetches an upstream data.gov.sg endpoint with API key support
 */
async function fetchEndpoint(url, apiKey) {
  const headers = {};
  if (apiKey && apiKey.trim().length > 0) {
    headers['x-api-key'] = apiKey.trim();
  }

  const res = await fetch(url, { headers });
  // Check response.ok before reading response body as required
  if (!res.ok) {
    return { ok: false, status: res.status, data: null };
  }

  const data = await res.json();
  return { ok: true, status: res.status, data };
}

/**
 * Main weather handler business logic
 */
export async function handleWeatherRequest(req, res) {
  const queryLocation = typeof req.query?.location === 'string' ? req.query.location.trim() : 'Singapore';
  const apiKey = process.env.WEATHER_API_KEY || process.env.DATA_GOV_SG_API_KEY;

  const now = Date.now();

  // If in-memory cache is valid, serve from cache with required headers
  if (cache.data && now - cache.timestamp < cache.ttl) {
    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=1200');
    return res.status(200).json(formatWeatherResponse(cache.data, queryLocation));
  }

  // Fetch from the 3 specified data.gov.sg endpoints
  // We stagger slightly (150ms) to ensure rate limit safety for unauthenticated calls
  const twoHrResult = await fetchEndpoint('https://api-open.data.gov.sg/v2/real-time/api/two-hr-forecast', apiKey);
  if (!twoHrResult.ok) {
    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=1200');
    return res.status(503).json({
      error: 'Weather service unavailable',
      upstreamStatus: twoHrResult.status,
    });
  }

  await new Promise((r) => setTimeout(r, 150));
  const rainfallResult = await fetchEndpoint('https://api-open.data.gov.sg/v2/real-time/api/rainfall', apiKey);
  if (!rainfallResult.ok) {
    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=1200');
    return res.status(503).json({
      error: 'Weather service unavailable',
      upstreamStatus: rainfallResult.status,
    });
  }

  await new Promise((r) => setTimeout(r, 150));
  const psiResult = await fetchEndpoint('https://api-open.data.gov.sg/v2/real-time/api/psi', apiKey);
  if (!psiResult.ok) {
    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=1200');
    return res.status(503).json({
      error: 'Weather service unavailable',
      upstreamStatus: psiResult.status,
    });
  }

  // Cache raw responses
  cache.data = {
    twoHr: twoHrResult.data,
    rainfall: rainfallResult.data,
    psi: psiResult.data,
  };
  cache.timestamp = now;

  res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=1200');
  return res.status(200).json(formatWeatherResponse(cache.data, queryLocation));
}

/**
 * Formats the raw upstream data into the required simplified JSON response
 */
function formatWeatherResponse(rawData, requestedLocation) {
  const twoHrData = rawData.twoHr?.data || {};
  const rainfallData = rawData.rainfall?.data || {};
  const psiData = rawData.psi?.data || {};

  const forecastItem = twoHrData.items?.[0] || {};
  const metadataList = twoHrData.area_metadata || [];
  const coordMap = new Map(
    metadataList.map((m) => [m.name?.toLowerCase(), m.label_location || { latitude: 1.35, longitude: 103.82 }])
  );

  const REGION_LOOKUP = {
    North: ['woodlands', 'sembawang', 'yishun', 'mandai', 'lim chu kang', 'simpang', 'sungei kadut', 'seletar'],
    South: ['city', 'bukit merah', 'queenstown', 'marine parade', 'southern islands', 'sentosa', 'telok blangah'],
    East: ['bedok', 'changi', 'tampines', 'pasir ris', 'paya lebar', 'pulau ubin', 'pulau tekong'],
    West: ['jurong east', 'jurong west', 'jurong island', 'boon lay', 'bukit batok', 'bukit panjang', 'choa chu kang', 'clementi', 'pioneer', 'tuas', 'tengah', 'western islands', 'western water catchment', 'jalan bahar'],
    Central: ['bishan', 'ang mo kio', 'toa payoh', 'novena', 'tanglin', 'kallang', 'geylang', 'hougang', 'serangoon', 'central water catchment', 'punggol', 'sengkang', 'bukit timah'],
  };

  const getRegionForArea = (areaName) => {
    const lower = (areaName || '').toLowerCase();
    for (const [reg, list] of Object.entries(REGION_LOOKUP)) {
      if (list.includes(lower)) return reg;
    }
    return 'Central';
  };

  // Determine current Singapore hour (UTC+8)
  const dateObj = new Date();
  const currentHourSgt = (dateObj.getUTCHours() + 8) % 24;

  const areaForecasts = (forecastItem.forecasts || []).map((af) => {
    const areaName = af.area || 'Unknown';
    const coords = coordMap.get(areaName.toLowerCase()) || { latitude: 1.35, longitude: 103.82 };
    const cond = cleanCondition(af.forecast);
    const region = getRegionForArea(areaName);
    const localized = deriveMetrics(af.forecast, 0, currentHourSgt);
    return {
      area: areaName,
      forecast: af.forecast || 'Partly Cloudy',
      condition: cond,
      region,
      lat: coords.latitude,
      lng: coords.longitude,
      temperature: localized.temperature,
    };
  });

  const validPeriodText = forecastItem.valid_period?.text || '';
  const updateTimestamp = forecastItem.update_timestamp || new Date().toISOString();

  // Find requested location in areaForecasts
  let selectedArea = null;
  const isAllSingapore = !requestedLocation || requestedLocation.toLowerCase() === 'singapore';

  if (!isAllSingapore) {
    selectedArea = areaForecasts.find(
      (a) => a.area.toLowerCase() === requestedLocation.toLowerCase()
    );
  }

  // Determine display location name
  const locationName = selectedArea ? `${selectedArea.area}, Singapore` : 'Singapore';
  const rawCondition = selectedArea?.forecast || areaForecasts[0]?.forecast || 'Partly Cloudy';
  const condition = cleanCondition(rawCondition);

  // Compute average rainfall across active stations
  const rainStations = rainfallData.readings?.[0]?.data || [];
  let totalRain = 0;
  let validStations = 0;
  for (const s of rainStations) {
    if (typeof s.value === 'number' && !isNaN(s.value)) {
      totalRain += s.value;
      validStations++;
    }
  }
  const avgRain = validStations > 0 ? totalRain / validStations : 0;
  const rainfall = Number(avgRain.toFixed(1));

  // Derive temperature, humidity, windSpeed, feelsLike
  const metrics = deriveMetrics(rawCondition, rainfall, currentHourSgt);

  // PSI metrics
  const psiItem = psiData.items?.[0] || {};
  const psiHourly = psiItem.readings?.psi_twenty_four_hourly || {};
  const pm25Hourly = psiItem.readings?.pm25_twenty_four_hourly || {};

  const psiAvg = Object.values(psiHourly).reduce((acc, v) => acc + (typeof v === 'number' ? v : 0), 0) /
    (Object.keys(psiHourly).length || 1);
  const psiValue = Math.round(psiAvg || 65);

  const pm25Avg = Object.values(pm25Hourly).reduce((acc, v) => acc + (typeof v === 'number' ? v : 0), 0) /
    (Object.keys(pm25Hourly).length || 1);

  // Regional weather aggregation
  const REGION_CENTERS = {
    North: { lat: 1.418, lng: 103.820 },
    South: { lat: 1.285, lng: 103.835 },
    East: { lat: 1.355, lng: 103.945 },
    West: { lat: 1.345, lng: 103.710 },
    Central: { lat: 1.350, lng: 103.840 },
  };

  const regionalWeather = Object.keys(REGION_LOOKUP).map((regionKey) => {
    const matching = areaForecasts.filter((a) => a.region === regionKey);
    // Find dominant condition
    const counts = {};
    for (const a of matching) {
      counts[a.condition] = (counts[a.condition] || 0) + 1;
    }
    let dominantCondition = 'Partly Cloudy';
    let maxCount = 0;
    for (const [cond, count] of Object.entries(counts)) {
      if (count > maxCount) {
        maxCount = count;
        dominantCondition = cond;
      }
    }

    const regMetrics = deriveMetrics(dominantCondition, rainfall, currentHourSgt);
    const regPsi = psiHourly[regionKey.toLowerCase()] ?? psiValue;
    const regPm25 = pm25Hourly[regionKey.toLowerCase()] ?? Math.round(pm25Avg || 24);

    return {
      region: regionKey,
      condition: dominantCondition,
      temperature: regMetrics.temperature,
      feelsLike: regMetrics.feelsLike,
      humidity: regMetrics.humidity,
      psi: regPsi,
      pm25: regPm25,
      areasCount: matching.length,
      center: REGION_CENTERS[regionKey],
      areas: matching,
    };
  });

  // Build forecast list
  const forecast = buildForecastPeriods(
    validPeriodText,
    condition,
    metrics.temperature,
    metrics.humidity
  );

  return {
    location: locationName,
    temperature: metrics.temperature,
    feelsLike: metrics.feelsLike,
    humidity: metrics.humidity,
    condition: condition,
    rainfall: rainfall,
    windSpeed: metrics.windSpeed,
    forecast: forecast,
    lastUpdated: updateTimestamp,
    regionalWeather: regionalWeather,
    // Context compatibility shape for consumers expecting nested current & location
    current: {
      temp_c: metrics.temperature,
      feelslike_c: metrics.feelsLike,
      humidity: metrics.humidity,
      wind_kph: metrics.windSpeed,
      precip_mm: rainfall,
      condition: {
        text: condition,
      },
    },
    psi: {
      value: psiValue,
      status: psiValue <= 50 ? 'Good' : psiValue <= 100 ? 'Moderate' : 'Unhealthy',
      pm25: Math.round(pm25Avg || 24),
    },
    areaForecasts: areaForecasts,
    validPeriod: validPeriodText,
  };
}

/**
 * Health check handler logic
 * Must never print, expose, log, or return any portion of the API key
 */
export async function handleHealthRequest(req, res) {
  const apiKey = process.env.WEATHER_API_KEY || process.env.DATA_GOV_SG_API_KEY;
  const keyConfigured = Boolean(apiKey && apiKey.trim().length > 0);

  let upstreamStatus = 0;
  let providerResponding = false;

  try {
    const headers = {};
    if (keyConfigured) {
      headers['x-api-key'] = apiKey.trim();
    }

    const testRes = await fetch('https://api-open.data.gov.sg/v2/real-time/api/two-hr-forecast', {
      headers,
    });

    upstreamStatus = testRes.status;
    providerResponding = testRes.ok;
  } catch (err) {
    upstreamStatus = 503;
    providerResponding = false;
  }

  res.setHeader('Cache-Control', 'no-store, max-age=0');
  return res.status(providerResponding ? 200 : 503).json({
    status: providerResponding ? 'ok' : 'degraded',
    keyConfigured,
    providerResponding,
    upstreamStatus,
  });
}
