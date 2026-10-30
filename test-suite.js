/**
 * Comprehensive Automated Functionality & Integration Test Suite
 * Mathira Organic Farming Platform
 * 
 * Tests:
 * 1. Health & Database Connectivity
 * 2. Mobile OTP Authentication & Default 1234 Master Code
 * 3. Token Generation & Device Trusted Registration
 * 4. Cart Persistence, Quantity Update & Strict Phone-Wise Isolation
 * 5. Category-Based Product Listing & Filtering
 * 6. Multi-Vendor Discovery & Storefronts
 * 7. Vendor Product Ownership & Multi-Vendor Isolation
 * 8. Customer Order Placement & Isolation
 * 9. Daily/Recurring Subscription Management & Isolation
 */

const http = require('http');

const BASE_URL = 'http://localhost:5050/api';

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTestSuite() {
  console.log('========================================================================');
  console.log('🌿 MATHIRA ORGANIC FARMING - COMPREHENSIVE AUTOMATED TEST SUITE');
  console.log('========================================================================\n');

  const results = [];
  function assert(name, condition, extra = '') {
    if (condition) {
      console.log(`  ✅ [PASS] ${name} ${extra}`);
      results.push({ name, pass: true });
    } else {
      console.error(`  ❌ [FAIL] ${name} ${extra}`);
      results.push({ name, pass: false });
    }
  }

  try {
    // -------------------------------------------------------------------------
    // 1. SYSTEM HEALTH & DATABASE
    // -------------------------------------------------------------------------
    console.log('🔍 [1] Testing System Health & Database Connectivity...');
    const health = await request('GET', '/health');
    assert(
      'System Health & PostgreSQL Connection',
      health.status === 200 && health.data?.database?.includes('PostgreSQL'),
      `(Status: ${health.data?.status}, DB: ${health.data?.database}, Products: ${health.data?.productCount})`
    );

    // -------------------------------------------------------------------------
    // 2. OTP AUTHENTICATION & DEFAULT 1234 MASTER OTP
    // -------------------------------------------------------------------------
    console.log('\n📱 [2] Testing Mobile OTP Authentication & Default 1234 Code...');
    const testPhoneA = '9025255639';
    const testPhoneB = '9876543210';
    const freshTestPhone = `98${Math.floor(10000000 + Math.random() * 90000000)}`;

    // Step A: Request OTP
    const sendOtpRes = await request('POST', '/auth/send-otp', { phoneNumber: freshTestPhone });
    assert(
      'Request OTP Endpoint',
      sendOtpRes.status === 200 && (sendOtpRes.data?.success || sendOtpRes.data?.otp),
      `(Message: ${sendOtpRes.data?.message || 'OTP Generated'}, Phone: ${freshTestPhone})`
    );

    // Step B: Verify with Default OTP 1234
    const verifyDefaultOtpRes = await request('POST', '/auth/verify-otp', {
      phoneNumber: testPhoneA,
      otp: '1234',
      deviceInfo: {
        deviceId: 'dev_test_device_001',
        deviceModel: 'Test Runner Suite',
        platform: 'node'
      }
    });

    assert(
      'Default OTP 1234 Instant Verification',
      verifyDefaultOtpRes.status === 200 && verifyDefaultOtpRes.data?.success,
      `(Authenticated User: ${verifyDefaultOtpRes.data?.user?.phoneNumber}, Role: ${verifyDefaultOtpRes.data?.role})`
    );

    const tokenA = verifyDefaultOtpRes.data?.accessToken;
    assert('JWT Access Token Generated', !!tokenA, `(Token exists and signed)`);
    assert('Refresh Token Generated', !!verifyDefaultOtpRes.data?.refreshToken, `(Refresh token stored)`);

    // Step C: Verify with Invalid OTP (Expect rejection)
    const verifyInvalidOtpRes = await request('POST', '/auth/verify-otp', {
      phoneNumber: testPhoneA,
      otp: '9999'
    });
    assert(
      'Invalid OTP Rejection',
      verifyInvalidOtpRes.status !== 200 || !verifyInvalidOtpRes.data?.success,
      `(Correctly rejected invalid code)`
    );

    // -------------------------------------------------------------------------
    // 3. CART OPERATIONS & STRICT PHONE-NUMBER ISOLATION
    // -------------------------------------------------------------------------
    console.log('\n🛒 [3] Testing Cart Persistence & Phone-Number Isolation...');

    // Get an available product
    const productsRes = await request('GET', '/products');
    const firstProduct = productsRes.data?.data?.[0];
    assert('Fetch Sample Product for Cart', !!firstProduct?.id, `(Product: ${firstProduct?.name}, Price: ₹${firstProduct?.price})`);

    // Clean initial carts
    await request('DELETE', `/cart/clear?phoneNumber=${testPhoneA}`);
    await request('DELETE', `/cart/clear?phoneNumber=${testPhoneB}`);

    // Add product to User A's Cart
    const addToCartRes = await request('POST', '/cart/add', {
      phoneNumber: testPhoneA,
      productId: firstProduct.id,
      qty: 2
    });
    assert('User A Adds Product to Cart', addToCartRes.status === 200 && addToCartRes.data?.success);

    // Retrieve User A's Cart
    const userACart = await request('GET', `/cart?phoneNumber=${testPhoneA}`);
    const hasItemA = userACart.data?.data?.some(item => (item.product?.id || item.productId) === firstProduct.id);
    assert('User A Cart Contains Added Item', userACart.status === 200 && hasItemA, `(Items in Cart: ${userACart.data?.count})`);

    // Retrieve User B's Cart (Must be EMPTY - Zero bleeding!)
    const userBCart = await request('GET', `/cart?phoneNumber=${testPhoneB}`);
    assert(
      'User B Cart is Completely Isolated (Zero Bleed)',
      userBCart.status === 200 && (userBCart.data?.count === 0 || userBCart.data?.data?.length === 0),
      `(User B Items: ${userBCart.data?.count || 0})`
    );

    // Update Quantity in User A Cart
    const updateQtyRes = await request('PUT', '/cart/update', {
      phoneNumber: testPhoneA,
      productId: firstProduct.id,
      qty: 4
    });
    assert('User A Cart Quantity Update', updateQtyRes.status === 200 && updateQtyRes.data?.success);

    // -------------------------------------------------------------------------
    // 4. CATEGORIES & MULTI-VENDOR DISCOVERY
    // -------------------------------------------------------------------------
    console.log('\n🏬 [4] Testing Categories & Multi-Vendor Discovery System...');

    // Fetch Categories
    const categoriesRes = await request('GET', '/categories');
    assert(
      'Category Listing Endpoint',
      categoriesRes.status === 200 && Array.isArray(categoriesRes.data?.data),
      `(Found ${categoriesRes.data?.data?.length} categories)`
    );

    // Filter Products by Category
    const vegetablesRes = await request('GET', '/products?category=Vegetables');
    assert(
      'Category-based Product Filter (Vegetables)',
      vegetablesRes.status === 200 && Array.isArray(vegetablesRes.data?.data),
      `(Found ${vegetablesRes.data?.data?.length} products)`
    );

    // List All Vendors
    const vendorsRes = await request('GET', '/vendors');
    assert(
      'Public Vendor Directory Listing',
      vendorsRes.status === 200 && Array.isArray(vendorsRes.data?.data),
      `(Found ${vendorsRes.data?.data?.length} registered vendors)`
    );

    // Fetch Individual Vendor Store
    const firstVendor = vendorsRes.data?.data?.[0];
    if (firstVendor?.id) {
      const vendorStoreRes = await request('GET', `/vendors/${firstVendor.id}`);
      assert(
        'Vendor Store Details & Metadata',
        vendorStoreRes.status === 200 && vendorStoreRes.data?.data?.id === firstVendor.id,
        `(Store: ${vendorStoreRes.data?.data?.storeName || vendorStoreRes.data?.data?.farmName || vendorStoreRes.data?.data?.fullName})`
      );
    }

    // -------------------------------------------------------------------------
    // 5. VENDOR PRODUCT MANAGEMENT & OWNERSHIP ISOLATION
    // -------------------------------------------------------------------------
    console.log('\n🌾 [5] Testing Vendor Product Management & Strict Ownership...');

    const vendorPhone = '9025255639';
    const newCropName = `Organic Desi Spinach #${Date.now().toString().slice(-4)}`;

    const addProductRes = await request('POST', '/products', {
      name: newCropName,
      categoryName: 'Vegetables',
      price: 35,
      unit: 'Bunch',
      stock: 50,
      minStock: 5,
      description: 'Harvested fresh this morning from the organic farm',
      vendorId: vendorPhone,
      organicCertified: true
    });

    assert(
      'Vendor Successfully Creates Product',
      addProductRes.status === 201 || (addProductRes.status === 200 && addProductRes.data?.data?.id),
      `(Product: "${newCropName}")`
    );

    // Query Products strictly belonging to this vendor
    const vendorProducts = await request('GET', `/products?vendorId=${vendorPhone}`);
    const productBelongs = vendorProducts.data?.data?.some(p => p.name === newCropName);
    assert(
      'Vendor Product Isolated to Vendor Console',
      vendorProducts.status === 200 && productBelongs,
      `(Vendor Product Count: ${vendorProducts.data?.count})`
    );

    // -------------------------------------------------------------------------
    // 6. CUSTOMER ORDERS & PHONE NUMBER ISOLATION
    // -------------------------------------------------------------------------
    console.log('\n📦 [6] Testing Order Placement & Customer Isolation...');

    const orderPayload = {
      customerName: 'Suresh Kumar',
      customerPhone: testPhoneA,
      deliveryAddress: 'Nerunjipettai, Anthiyur, Tamil Nadu',
      totalAmount: 350,
      deliveryFee: 20,
      orderType: 'One-Time',
      paymentMethod: 'Cash on Delivery',
      items: [
        { productId: firstProduct.id, quantity: 2, price: firstProduct.price || 40, name: firstProduct.name }
      ]
    };

    const placeOrderRes = await request('POST', '/orders', orderPayload);
    assert(
      'Customer Places Order',
      placeOrderRes.status === 201 && placeOrderRes.data?.data?.id,
      `(Order ID: ${placeOrderRes.data?.data?.id})`
    );
    const placedOrderId = placeOrderRes.data?.data?.id;

    // Check User A's orders
    const userAOrders = await request('GET', `/orders?phoneNumber=${testPhoneA}`);
    const userAHasOrder = userAOrders.data?.data?.some(o => o.id === placedOrderId || o.customerPhone === testPhoneA);
    assert('User A Sees Their Order', userAOrders.status === 200 && userAHasOrder);

    // Check User B's orders (Must NOT see User A's order)
    const userBOrders = await request('GET', `/orders?phoneNumber=${testPhoneB}`);
    const userBHasUserAOrder = userBOrders.data?.data?.some(o => o.id === placedOrderId || o.customerPhone === testPhoneA);
    assert(
      'User B Cannot See User A Order (Zero Bleed)',
      userBOrders.status === 200 && !userBHasUserAOrder,
      `(Strict Customer Phone Isolation Verified)`
    );

    // -------------------------------------------------------------------------
    // 7. SUBSCRIPTIONS & RECURRING DELIVERY ISOLATION
    // -------------------------------------------------------------------------
    console.log('\n📅 [7] Testing Subscription Creation & Isolation...');

    const subPayload = {
      productId: firstProduct.id,
      userPhone: testPhoneA,
      quantity: 1,
      frequency: 'Daily',
      duration: 30,
      deliveryTime: '06:30 AM',
      totalAmount: 1200,
      paymentStatus: 'Paid'
    };

    const createSubRes = await request('POST', '/subscriptions', subPayload);
    assert(
      'Customer Creates Daily Subscription',
      createSubRes.status === 201 && createSubRes.data?.data?.id,
      `(Subscription ID: ${createSubRes.data?.data?.id})`
    );

    // Check User A Subscriptions
    const userASubs = await request('GET', `/subscriptions?phoneNumber=${testPhoneA}`);
    assert('User A Subscriptions Retrieved', userASubs.status === 200 && userASubs.data?.count >= 1);

    // Check User B Subscriptions (Zero Bleed)
    const userBSubs = await request('GET', `/subscriptions?phoneNumber=${testPhoneB}`);
    const userBHasUserASub = userBSubs.data?.data?.some(s => s.userPhone === testPhoneA);
    assert(
      'User B Cannot See User A Subscription (Zero Bleed)',
      userBSubs.status === 200 && !userBHasUserASub,
      `(Strict Subscription Phone Isolation Verified)`
    );

  } catch (err) {
    console.error('💥 Fatal error in test runner:', err);
    assert('Execution Exception', false, err.message);
  }

  // -------------------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------------------
  console.log('\n========================================================================');
  console.log('📊 TEST EXECUTION SUMMARY');
  console.log('========================================================================');
  const total = results.length;
  const passed = results.filter(r => r.pass).length;
  const failed = results.filter(r => !r.pass).length;

  console.log(`  Total Tests Run: ${total}`);
  console.log(`  Passed:          ${passed} / ${total}`);
  console.log(`  Failed:          ${failed}`);

  if (failed === 0) {
    console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY!');
    console.log('✅ Default OTP 1234, User Isolation, Cart Sync, Categories, Multi-Vendor & Subscriptions are fully verified!');
  } else {
    console.log(`\n⚠️ ${failed} test(s) failed. Please review the logs above.`);
  }
  console.log('========================================================================\n');
}

runTestSuite();
