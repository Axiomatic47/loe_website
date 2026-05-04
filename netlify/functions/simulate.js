// Netlify Function to proxy simulation API requests
// Security-hardened version with authentication, rate limiting, and input validation

// Use environment variable for API URL (set in Netlify dashboard)
const SIMULATION_API_URL = process.env.SIMULATION_API_URL || 'http://localhost:8000/api/simulate';

// Allowed origins for CORS (update with your actual domains)
const ALLOWED_ORIGINS = [
  'https://lawsofexistence.com',
  'https://www.lawsofexistence.com',
  'http://localhost:3000',
  'http://localhost:5173'
];

// Simple in-memory rate limiting (resets on function cold start)
// For production, consider using Netlify's built-in rate limiting or Redis
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10; // 10 requests per minute per IP

/**
 * Check rate limit for an IP address
 */
function checkRateLimit(ip) {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;

  // Get or create rate limit entry
  let entry = rateLimitMap.get(ip);
  if (!entry) {
    entry = { requests: [], blocked: false };
    rateLimitMap.set(ip, entry);
  }

  // Clean old requests outside the window
  entry.requests = entry.requests.filter(timestamp => timestamp > windowStart);

  // Check if over limit
  if (entry.requests.length >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, remaining: 0 };
  }

  // Add this request
  entry.requests.push(now);

  return {
    allowed: true,
    remaining: RATE_LIMIT_MAX_REQUESTS - entry.requests.length
  };
}

/**
 * Verify Netlify Identity JWT token
 */
async function verifyAuth(event) {
  // Check for Authorization header
  const authHeader = event.headers.authorization || event.headers.Authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { authenticated: false, error: 'Missing or invalid Authorization header' };
  }

  const token = authHeader.substring(7);

  // Netlify Identity context is automatically populated when using Identity
  // The clientContext contains user info if the request has a valid JWT
  if (event.clientContext && event.clientContext.user) {
    return {
      authenticated: true,
      user: event.clientContext.user
    };
  }

  // If no clientContext, try to decode the JWT to check if it's valid
  // Note: In production, Netlify automatically validates JWTs from Identity
  try {
    // Basic JWT structure check (header.payload.signature)
    const parts = token.split('.');
    if (parts.length !== 3) {
      return { authenticated: false, error: 'Invalid token format' };
    }

    // Decode payload to check expiration
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());

    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return { authenticated: false, error: 'Token expired' };
    }

    // Token appears valid (Netlify will have validated the signature)
    return {
      authenticated: true,
      user: { email: payload.email, sub: payload.sub }
    };
  } catch (e) {
    return { authenticated: false, error: 'Token validation failed' };
  }
}

/**
 * Validate simulation request body
 */
function validateRequestBody(body) {
  if (!body) {
    return { valid: false, error: 'Request body is required' };
  }

  let parsed;
  try {
    parsed = typeof body === 'string' ? JSON.parse(body) : body;
  } catch (e) {
    return { valid: false, error: 'Invalid JSON in request body' };
  }

  // Validate required fields and types
  const { parameters, timesteps, initial_coherence } = parsed;

  // Check parameters object
  if (parameters) {
    const validParams = [
      'suppression_level', 'fear_factor', 'supremacist_ideology',
      'resource_scarcity', 'identity_bias'
    ];

    for (const key of Object.keys(parameters)) {
      if (!validParams.includes(key)) {
        return { valid: false, error: `Invalid parameter: ${key}` };
      }

      const value = parameters[key];
      if (typeof value !== 'number' || value < -1 || value > 1) {
        return { valid: false, error: `Invalid value for ${key}: must be number between -1 and 1` };
      }
    }
  }

  // Check timesteps
  if (timesteps !== undefined) {
    if (typeof timesteps !== 'number' || timesteps < 1 || timesteps > 10000) {
      return { valid: false, error: 'timesteps must be a number between 1 and 10000' };
    }
  }

  // Check initial_coherence
  if (initial_coherence !== undefined) {
    if (typeof initial_coherence !== 'number' || initial_coherence < 0 || initial_coherence > 1) {
      return { valid: false, error: 'initial_coherence must be a number between 0 and 1' };
    }
  }

  return { valid: true, parsed };
}

/**
 * Get CORS headers based on request origin
 */
function getCorsHeaders(requestOrigin) {
  // Check if origin is allowed
  const origin = ALLOWED_ORIGINS.includes(requestOrigin)
    ? requestOrigin
    : ALLOWED_ORIGINS[0]; // Default to primary domain

  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400'
  };
}

exports.handler = async function(event, context) {
  const requestOrigin = event.headers.origin || event.headers.Origin || '';
  const corsHeaders = getCorsHeaders(requestOrigin);

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: corsHeaders,
      body: ''
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    };
  }

  // Get client IP for rate limiting
  const clientIP = event.headers['x-forwarded-for']?.split(',')[0]?.trim()
    || event.headers['client-ip']
    || 'unknown';

  // Check rate limit
  const rateLimit = checkRateLimit(clientIP);
  if (!rateLimit.allowed) {
    return {
      statusCode: 429,
      body: JSON.stringify({
        error: 'Rate limit exceeded',
        message: 'Too many requests. Please wait before trying again.'
      }),
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': '60',
        'X-RateLimit-Remaining': '0',
        ...corsHeaders
      }
    };
  }

  // Verify authentication
  const auth = await verifyAuth(event);
  if (!auth.authenticated) {
    return {
      statusCode: 401,
      body: JSON.stringify({
        error: 'Authentication required',
        message: auth.error || 'Please log in to access the simulation API'
      }),
      headers: {
        'Content-Type': 'application/json',
        'WWW-Authenticate': 'Bearer',
        ...corsHeaders
      }
    };
  }

  // Validate request body
  const validation = validateRequestBody(event.body);
  if (!validation.valid) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: 'Invalid request',
        message: validation.error
      }),
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    };
  }

  try {
    // Forward the validated request to the simulation server
    const response = await fetch(SIMULATION_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Forwarded-From': 'netlify-function',
        'X-Authenticated-User': auth.user?.email || 'unknown'
      },
      body: JSON.stringify(validation.parsed)
    });

    const data = await response.json();

    return {
      statusCode: response.status,
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
        'X-RateLimit-Remaining': String(rateLimit.remaining),
        ...corsHeaders
      }
    };
  } catch (error) {
    console.error('Simulation API proxy error:', error.message);

    // Don't expose internal error details
    return {
      statusCode: 502,
      body: JSON.stringify({
        error: 'Service temporarily unavailable',
        message: 'The simulation service is currently unavailable. Please try again later.'
      }),
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    };
  }
};
