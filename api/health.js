/**
 * Vercel Serverless Function: /api/health
 * Reports weather API key configuration and provider health status.
 * Never prints, exposes, logs, or returns any portion of the API key.
 */

import { handleHealthRequest } from './_weatherCore.js';

export default async function handler(req, res) {
  return handleHealthRequest(req, res);
}

export { handler as handleHealth };
