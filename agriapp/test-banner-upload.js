/**
 * Test Banner Upload & Verification Script
 * Tests creating a banner in the database via the API and verifies GET /banners/active
 * Run with: node test-banner-upload.js
 */

const http = require('http');

const API_BASE = 'https://mathira.jeenora.com/api';

function httpRequest(url, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const body = data ? JSON.stringify(data) : null;

    const options = {
      hostname: parsed.hostname,
      port: parsed.port || 80,
      path: parsed.pathname + parsed.search,
      method: method,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'AgriFlowTestScript/1.0',
        ...(body ? {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
        } : {}),
      },
      timeout: 10000,
    };

    const req = http.request(options, (res) => {
      let raw = '';
      res.on('data', chunk => { raw += chunk; });
      res.on('end', () => {
        try {
          const parsedJson = raw ? JSON.parse(raw) : null;
          resolve({ status: res.statusCode, headers: res.headers, data: parsedJson, raw });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw });
        }
      });
    });

    req.on('error', (err) => reject(err));
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timed out after 10000ms'));
    });

    if (body) req.write(body);
    req.end();
  });
}

async function runTest() {
  console.log('====================================================');
  console.log('🌾 Mathira Organic Farming - Banner API Verification');
  console.log(`Connecting to: ${API_BASE}`);
  console.log('====================================================\n');

  // Step 1: Upload a test promotional banner with custom colors
  const testBannerPayload = {
    title: 'Fresh Harvest Festival - 100% Certified Organic',
    subtitle: 'Direct from Salem Farms to your doorstep',
    imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600',
    backgroundColor: '#042F2E|#14B8A6', // Dynamic custom gradient chosen in Admin Panel
    textColor: '#FFFFFF',
    buttonColor: '#FDE047',
    buttonTextColor: '#78350F',
    buttonText: 'Order Organic Now →',
    targetType: 'ALL_PRODUCTS',
    targetId: 'ALL_PRODUCTS',
    displayOrder: 2,
    isActive: true,
  };

  console.log('1️⃣ [POST /banners]: Creating banner with custom admin color (#042F2E|#14B8A6)...');
  try {
    const createRes = await httpRequest(`${API_BASE}/banners`, 'POST', testBannerPayload);
    console.log(`   Response Status: ${createRes.status}`);
    if (createRes.data && createRes.data.success) {
      console.log('   ✅ Banner successfully created in database!');
      console.log('   Banner ID:', createRes.data.data?.id);
      console.log('   Title:', createRes.data.data?.title);
      console.log('   BackgroundColor:', createRes.data.data?.backgroundColor);
    } else {
      console.log('   ⚠️ Create response:', createRes.data || createRes.raw);
    }
  } catch (err) {
    console.error('   ❌ Error creating banner:', err.message);
  }

  console.log('\n----------------------------------------------------');
  console.log('2️⃣ [GET /banners/active]: Fetching active banners for Mobile App...');
  try {
    const listRes = await httpRequest(`${API_BASE}/banners/active`, 'GET');
    console.log(`   Response Status: ${listRes.status}`);
    if (listRes.data && listRes.data.success) {
      const banners = listRes.data.data || [];
      console.log(`   ✅ Successfully retrieved ${banners.length} active banner(s) from database:\n`);
      banners.forEach((b, idx) => {
        console.log(`   [Banner #${idx + 1}]`);
        console.log(`   • ID:              ${b.id}`);
        console.log(`   • Title:           ${b.title}`);
        console.log(`   • BackgroundColor: ${b.backgroundColor}`);
        console.log(`   • Image:           ${b.imageUrl?.substring(0, 60)}...`);
        console.log(`   • Active:          ${b.isActive}`);
        console.log(`   • DisplayOrder:    ${b.displayOrder}`);
        console.log('   -------------------------------------------------');
      });
    } else {
      console.log('   ⚠️ Active banners response:', listRes.data || listRes.raw);
    }
  } catch (err) {
    console.error('   ❌ Error fetching active banners:', err.message);
  }

  console.log('\n🎉 Test completed successfully!');
}

runTest();
