/**
 * Vercel Serverless Function: /api/weather
 * Retrieves live Singapore weather data.
 */

import { handleWeatherRequest } from './_weatherCore.js';

export default async function handler(req, res) {
  return handleWeatherRequest(req, res);
}

export { handler as handleWeather };
