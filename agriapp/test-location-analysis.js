/**
 * Location Analysis Test Script for Mathira Organic Farming
 * Run with: node test-location-analysis.js [latitude] [longitude]
 * Example:  node test-location-analysis.js 11.6643 78.1460
 * Or simply: node test-location-analysis.js (auto-detects public network coordinates)
 */

const https = require('https');
const http = require('http');

// Farm & Vendor Hubs for Distance Analysis
const HUBS = [
  { name: 'Salem Farm Hub, Tamil Nadu', lat: 11.6643, lng: 78.1460, radiusKm: 35 },
  { name: 'Dharmapuri Central Hub, Tamil Nadu', lat: 12.1211, lng: 78.1582, radiusKm: 30 },
  { name: 'Indiranagar Hub, Bengaluru', lat: 12.9784, lng: 77.6408, radiusKm: 25 },
  { name: 'Koramangala Hub, Bengaluru', lat: 12.9352, lng: 77.6245, radiusKm: 25 },
  { name: 'Whitefield Hub, Bengaluru', lat: 12.9698, lng: 77.7500, radiusKm: 20 },
];

// Helper: HTTP/HTTPS GET request
function fetchJson(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, { headers: { 'User-Agent': 'MathiraLocationAnalyzer/1.0', ...headers } }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Failed to parse JSON from ${url}: ${data.substring(0, 100)}`));
        }
      });
    });
    req.on('error', reject);
    req.setTimeout(8000, () => {
      req.destroy();
      reject(new Error(`Request timeout for ${url}`));
    });
  });
}

// Haversine Great-Circle Distance Calculation (in kilometers)
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Calculate approximate delivery charge based on distance
function estimateDeliveryCharge(distanceKm) {
  if (distanceKm <= 5) return 0; // Free delivery within 5 km
  if (distanceKm <= 15) return 30; // ₹30 base charge
  if (distanceKm <= 30) return 30 + Math.round((distanceKm - 15) * 5); // + ₹5/km
  return null; // Beyond standard delivery zone
}

async function runAnalysis() {
  console.log('\n=============================================================');
  console.log('    MATHIRA ORGANIC FARMING — GPS & LOCATION ANALYZER       ');
  console.log('=============================================================\n');

  let lat, lng;
  const args = process.argv.slice(2);

  if (args.length >= 2 && !isNaN(parseFloat(args[0])) && !isNaN(parseFloat(args[1]))) {
    lat = parseFloat(args[0]);
    lng = parseFloat(args[1]);
    console.log(`[Input Source]: Manual Coordinates provided via CLI arguments`);
  } else {
    console.log('[Detecting]: Querying network/IP location provider...');
    try {
      const ipData = await fetchJson('http://ip-api.com/json/');
      if (ipData && ipData.status === 'success') {
        lat = ipData.lat;
        lng = ipData.lon;
        console.log(`[Input Source]: IP Geolocation (${ipData.city}, ${ipData.regionName}, ${ipData.country})`);
        console.log(`[ISP / Host]:   ${ipData.isp} (IP: ${ipData.query})`);
      } else {
        throw new Error('IP Geolocation service returned non-success');
      }
    } catch (e) {
      console.warn(`[Warning]: Could not auto-detect IP coordinates (${e.message}). Falling back to Salem Hub coordinates for demonstration.`);
      lat = 11.6643;
      lng = 78.1460;
    }
  }

  console.log('\n--- 1. COORDINATES & GEOGRAPHIC DATA ---');
  console.log(`Latitude:           ${lat.toFixed(6)}°`);
  console.log(`Longitude:          ${lng.toFixed(6)}°`);
  console.log(`Hemisphere:         ${lat >= 0 ? 'Northern' : 'Southern'} | ${lng >= 0 ? 'Eastern' : 'Western'}`);
  console.log(`GeoURI format:      geo:${lat.toFixed(6)},${lng.toFixed(6)}`);
  console.log(`Google Maps Link:   https://maps.google.com/?q=${lat},${lng}`);
  console.log(`OpenStreetMap Link: https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`);

  console.log('\n--- 2. REVERSE GEOCODING (OSM NOMINATIM) ---');
  try {
    const osmUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`;
    console.log(`Querying: ${osmUrl}`);
    const osmData = await fetchJson(osmUrl);

    if (osmData && osmData.address) {
      const addr = osmData.address;
      const locality = addr.suburb || addr.neighbourhood || addr.residential || addr.village || addr.hamlet || '';
      const city = addr.city || addr.town || addr.county || addr.state_district || '';
      const state = addr.state || '';
      const country = addr.country || '';
      const pincode = addr.postcode || '';

      console.log(`Full Display Name:  ${osmData.display_name}`);
      console.log(`Locality / Area:    ${locality || '(Not specified)'}`);
      console.log(`City / Town:        ${city || '(Not specified)'}`);
      console.log(`District:           ${addr.state_district || addr.county || '(Not specified)'}`);
      console.log(`State / Province:   ${state || '(Not specified)'}`);
      console.log(`Postal Code / PIN:  ${pincode || '(Not specified)'}`);
      console.log(`Country:            ${country} (${addr.country_code ? addr.country_code.toUpperCase() : ''})`);

      const parts = [locality, city, state].filter(Boolean);
      const appAreaLabel = parts.length > 0 ? parts.join(', ') : (city || state || 'Location detected');
      console.log(`\n=> App Formatted Label: "${appAreaLabel}"`);
    } else {
      console.log('No reverse geocode address structure returned.');
    }
  } catch (err) {
    console.error(`Reverse Geocode Error: ${err.message}`);
  }

  console.log('\n--- 3. VENDOR & HUB PROXIMITY ANALYSIS ---');
  console.log('Hub / Farm Location                    Distance (km)   Status             Delivery Estimate');
  console.log('-----------------------------------------------------------------------------------------');

  let closestHub = null;
  let minDistance = Infinity;

  for (const hub of HUBS) {
    const dist = calculateHaversineDistance(lat, lng, hub.lat, hub.lng);
    const isDeliverable = dist <= hub.radiusKm;
    const estCharge = isDeliverable ? estimateDeliveryCharge(dist) : null;

    if (dist < minDistance) {
      minDistance = dist;
      closestHub = hub;
    }

    const nameCol = hub.name.padEnd(38, ' ');
    const distCol = `${dist.toFixed(2)} km`.padEnd(16, ' ');
    const statusCol = (isDeliverable ? '✓ WITHIN ZONE' : '✗ OUT OF ZONE').padEnd(19, ' ');
    const feeCol = isDeliverable ? (estCharge === 0 ? 'FREE DELIVERY' : `₹${estCharge}`) : 'Unavailable';

    console.log(`${nameCol}${distCol}${statusCol}${feeCol}`);
  }

  console.log('-----------------------------------------------------------------------------------------');
  if (closestHub) {
    console.log(`Nearest Hub: ${closestHub.name} (${minDistance.toFixed(2)} km away)`);
    if (minDistance <= closestHub.radiusKm) {
      console.log(`✓ Eligible for same-day direct farm delivery from ${closestHub.name}!`);
    } else {
      console.log(`Notice: Location is beyond the ${closestHub.radiusKm} km delivery radius of the nearest hub.`);
    }
  }

  console.log('\n=============================================================\n');
}

runAnalysis().catch(err => {
  console.error('Fatal Analysis Error:', err);
});
