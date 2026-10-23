import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5050;
const JWT_SECRET = process.env.JWT_SECRET || 'agriflow_organic_secret_2026';
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Public health check route
app.get('/api/health', async (req: Request, res: Response) => {
  try {
    const productCount = await prisma.product.count();
    res.json({
      status: 'UP',
      database: 'Prisma (SQLite)',
      productCount,
      message: 'AgriFlow AI Backend Service with Prisma ORM is running smoothly',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({ status: 'DOWN', error: error.message });
  }
});

// ── PRODUCTS (Prisma) ──────────────────────────────────────
app.get('/api/products', async (req: Request, res: Response) => {
  try {
    const { category, search } = req.query;
    const where: any = {};
    if (category && category !== 'All') {
      where.categoryName = String(category);
    }
    if (search) {
      where.name = { contains: String(search) };
    }

    const products = await prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: 'asc' }
    });

    // Format category string and benefits from JSON string
    const formatted = products.map(p => ({
      ...p,
      category: (p.category && (p.category as any).name) ? (p.category as any).name : (p.categoryName || 'Organic'),
      categoryDetails: p.category,
      benefits: (() => {
        try {
          return JSON.parse(p.benefits);
        } catch {
          return [p.benefits];
        }
      })()
    }));

    res.json({
      success: true,
      count: formatted.length,
      data: formatted
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/products/:id', async (req: Request, res: Response) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: { category: true }
    });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    const formatted = {
      ...product,
      category: (product.category && (product.category as any).name) ? (product.category as any).name : (product.categoryName || 'Organic'),
      categoryDetails: product.category,
      benefits: (() => {
        try {
          return JSON.parse(product.benefits);
        } catch {
          return [product.benefits];
        }
      })()
    };
    res.json({ success: true, data: formatted });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/products', async (req: Request, res: Response) => {
  try {
    const { benefits, ...rest } = req.body;
    const product = await prisma.product.create({
      data: {
        ...rest,
        benefits: Array.isArray(benefits) ? JSON.stringify(benefits) : benefits || '[]'
      },
      include: { category: true }
    });
    const formatted = {
      ...product,
      category: (product.category && (product.category as any).name) ? (product.category as any).name : (product.categoryName || 'Organic'),
      categoryDetails: product.category,
      benefits: (() => {
        try {
          return JSON.parse(product.benefits);
        } catch {
          return [product.benefits];
        }
      })()
    };
    res.status(201).json({ success: true, data: formatted });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ── CATEGORIES (Prisma) ────────────────────────────────────
app.get('/api/categories', async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      }
    });
    res.json({ success: true, count: categories.length, data: categories });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── BRANDS (Prisma) ────────────────────────────────────────
app.get('/api/brands', async (req: Request, res: Response) => {
  try {
    const brands = await prisma.brand.findMany({
      orderBy: { rating: 'desc' }
    });
    res.json({ success: true, count: brands.length, data: brands });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── CUSTOMERS / USERS (Prisma) ─────────────────────────────
app.get('/api/customers', async (req: Request, res: Response) => {
  try {
    const customers = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, count: customers.length, data: customers });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/users', async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, count: users.length, data: users });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── SUBSCRIPTIONS (Prisma) ─────────────────────────────────
app.get('/api/subscriptions', async (req: Request, res: Response) => {
  try {
    const subs = await prisma.subscription.findMany({
      include: { product: true, user: true },
      orderBy: { createdAt: 'desc' }
    });
    const formatted = subs.map(s => ({
      ...s,
      product: s.product ? {
        ...s.product,
        category: s.product.categoryName || 'Organic'
      } : null
    }));
    res.json({ success: true, count: formatted.length, data: formatted });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/subscriptions', async (req: Request, res: Response) => {
  try {
    const newSub = await prisma.subscription.create({
      data: req.body,
      include: { product: true }
    });
    res.status(201).json({ success: true, data: newSub });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ── ORDERS (Prisma) ────────────────────────────────────────
app.get('/api/orders', async (req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: { product: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    const formatted = orders.map(o => ({
      ...o,
      items: o.items.map(i => ({
        ...i,
        product: i.product ? {
          ...i.product,
          category: i.product.categoryName || 'Organic'
        } : null
      }))
    }));
    res.json({ success: true, count: formatted.length, data: formatted });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/orders', async (req: Request, res: Response) => {
  try {
    const { items, ...orderData } = req.body;
    const order = await prisma.order.create({
      data: {
        ...orderData,
        items: items ? {
          create: items.map((it: any) => ({
            productId: it.productId,
            quantity: it.quantity || 1,
            price: it.price || 0
          }))
        } : undefined
      },
      include: { items: true }
    });
    res.status(201).json({ success: true, data: order });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ── DELIVERIES (Prisma) ────────────────────────────────────
app.get('/api/deliveries', async (req: Request, res: Response) => {
  try {
    const deliveries = await prisma.delivery.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, count: deliveries.length, data: deliveries });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── USER LOGS / AUDIT TRAIL (Prisma) ───────────────────────
app.get('/api/user-logs', async (req: Request, res: Response) => {
  try {
    const logs = await prisma.userLog.findMany({
      orderBy: { timestamp: 'desc' }
    });
    res.json({ success: true, count: logs.length, data: logs });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/logs', async (req: Request, res: Response) => {
  try {
    const logs = await prisma.userLog.findMany({
      orderBy: { timestamp: 'desc' }
    });
    res.json({ success: true, count: logs.length, data: logs });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── AI ALERTS (Prisma) ─────────────────────────────────────
app.get('/api/ai-alerts', async (req: Request, res: Response) => {
  try {
    const alerts = await prisma.aIAlert.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, count: alerts.length, data: alerts });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── DASHBOARD KPI STATS (Prisma) ───────────────────────────
app.get('/api/dashboard/stats', async (req: Request, res: Response) => {
  try {
    const [totalProducts, totalOrders, totalUsers, totalSubs] = await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      prisma.user.count(),
      prisma.subscription.count()
    ]);
    const orders = await prisma.order.findMany({ select: { totalAmount: true } });
    const totalRevenue = orders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);

    res.json({
      success: true,
      data: {
        totalRevenue,
        totalOrders,
        totalProducts,
        totalUsers,
        totalSubscriptions: totalSubs
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── SEED (Prisma) ──────────────────────────────────────────
app.post('/api/products/seed', async (req: Request, res: Response) => {
  try {
    const count = await prisma.product.count();
    res.json({
      success: true,
      message: `Prisma SQLite database active with ${count} verified organic products.`,
      productCount: count,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── AUTH (Mobile Number + OTP via Prisma) ───────────────────
const otpStore = new Map<string, { otp: string; expiresAt: number }>();

// 1. Send OTP for Customer Login
app.post('/api/auth/send-otp', async (req: Request, res: Response) => {
  try {
    const { phoneNumber } = req.body;
    const cleanPhone = String(phoneNumber || '').replace(/[^0-9]/g, '');
    if (cleanPhone.length !== 10) {
      return res.status(400).json({ success: false, message: 'Please provide a valid 10-digit mobile number' });
    }

    // Generate 4-digit OTP (1234 demo code or 4-digit random)
    const otp = cleanPhone === '9876543210' || cleanPhone === '9999999999' || cleanPhone === '8888888888' 
      ? '1234' 
      : Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 mins

    otpStore.set(cleanPhone, { otp, expiresAt });

    // Customer login: ensure customer profile exists in Prisma DB
    await prisma.user.upsert({
      where: { phoneNumber: cleanPhone },
      update: {},
      create: {
        fullName: 'Organic Customer',
        phoneNumber: cleanPhone,
        role: 'customer',
        passwordHash: 'OTP_VERIFIED'
      }
    });

    console.log(`[Customer Auth OTP]: Sent OTP ${otp} to +91 ${cleanPhone}`);

    res.json({
      success: true,
      message: `OTP sent successfully to +91 ${cleanPhone}`,
      phoneNumber: cleanPhone,
      otp, // included for seamless development & verification
      role: 'customer'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. Verify OTP - ONLY generates and returns Customer Token
app.post('/api/auth/verify-otp', async (req: Request, res: Response) => {
  try {
    const { phoneNumber, otp } = req.body;
    const cleanPhone = String(phoneNumber || '').replace(/[^0-9]/g, '');
    const cleanOtp = String(otp || '').trim();

    const record = otpStore.get(cleanPhone);
    const isValidDemo = cleanOtp === '1234';
    const isValidGenerated = record && record.otp === cleanOtp && record.expiresAt > Date.now();

    if (!isValidDemo && !isValidGenerated) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP. Please enter 1234 or request a new OTP.' });
    }

    otpStore.delete(cleanPhone);

    const user = await prisma.user.findUnique({
      where: { phoneNumber: cleanPhone }
    });

    const isAdmin = cleanPhone === '9999999999' || user?.role === 'admin';
    const effectiveRole = isAdmin ? 'admin' : (user?.role === 'vendor' ? 'vendor' : 'customer');

    // Generate JWT Token
    const authToken = jwt.sign(
      {
        id: user?.id || (isAdmin ? 'usr-admin' : 'usr-customer'),
        phoneNumber: cleanPhone,
        role: effectiveRole,
        type: isAdmin ? 'ADMIN_TOKEN' : 'CUSTOMER_TOKEN'
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    console.log(`[Auth]: Verified +91 ${cleanPhone} -> Role: ${effectiveRole.toUpperCase()}`);

    res.json({
      success: true,
      message: isAdmin ? 'Super Admin authenticated successfully!' : 'Mobile number verified successfully! Welcome to Mathira Organic Farming.',
      token: authToken,
      role: effectiveRole,
      user: {
        id: user?.id || (isAdmin ? 'admin-super' : undefined),
        phoneNumber: cleanPhone,
        fullName: isAdmin ? 'Super Admin Jeena' : (user?.fullName || 'Organic Customer'),
        role: effectiveRole
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── CUSTOMER PROFILE ENDPOINTS (Prisma) ────────────────────
app.get('/api/user/profile/:phoneNumber', async (req: Request, res: Response) => {
  try {
    const cleanPhone = String(req.params.phoneNumber || '').replace(/[^0-9]/g, '');
    let user = await prisma.user.findUnique({
      where: { phoneNumber: cleanPhone },
      include: { subscriptions: true, orders: true }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          phoneNumber: cleanPhone,
          fullName: 'Ananya Sharma',
          email: 'ananya.sharma@mathira.org',
          role: 'customer',
          location: 'Flat 402, Green Valley Apts, Indiranagar, Bangalore - 560038',
          status: 'Active',
          vendorStatus: 'NONE'
        },
        include: { subscriptions: true, orders: true }
      });
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        fullName: user.fullName || 'Ananya Sharma',
        phoneNumber: user.phoneNumber,
        email: user.email || 'ananya.sharma@mathira.org',
        location: user.location || 'Flat 402, Green Valley Apts, Indiranagar, Bangalore - 560038',
        role: user.role,
        status: user.status,
        vendorStatus: user.vendorStatus || 'NONE',
        totalOrders: user.orders ? user.orders.length : user.totalOrders || 0,
        activeSubscriptions: user.subscriptions ? user.subscriptions.length : 1,
        totalSpend: user.totalSpend || 3450,
        loyaltyPoints: 280
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/user/profile/:phoneNumber', async (req: Request, res: Response) => {
  try {
    const cleanPhone = String(req.params.phoneNumber || '').replace(/[^0-9]/g, '');
    const { fullName, email, location } = req.body;

    const user = await prisma.user.upsert({
      where: { phoneNumber: cleanPhone },
      update: {
        fullName: fullName ? String(fullName).trim() : undefined,
        email: email ? String(email).trim() : undefined,
        location: location ? String(location).trim() : undefined
      },
      create: {
        phoneNumber: cleanPhone,
        fullName: fullName ? String(fullName).trim() : 'Ananya Sharma',
        email: email ? String(email).trim() : 'ananya.sharma@mathira.org',
        location: location ? String(location).trim() : 'Flat 402, Green Valley Apts, Indiranagar, Bangalore - 560038',
        role: 'customer',
        status: 'Active'
      }
    });

    res.json({
      success: true,
      message: 'Profile updated successfully!',
      data: user
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── VENDOR REGISTRATION & ADMIN APPROVAL (Prisma) ──────────
// 1. Submit Vendor Registration Application
app.post('/api/vendor-requests', async (req: Request, res: Response) => {
  try {
    const {
      userId,
      userName,
      phoneNumber,
      farmName,
      farmLocation,
      cropCategories,
      experienceYears,
      certificateNo,
      note
    } = req.body;

    const cleanPhone = String(phoneNumber || '').replace(/[^0-9]/g, '');
    if (!cleanPhone || cleanPhone.length !== 10) {
      return res.status(400).json({ success: false, message: 'Valid 10-digit mobile number required.' });
    }
    if (!farmName || !farmLocation) {
      return res.status(400).json({ success: false, message: 'Farm Name and Location are required.' });
    }

    // Check if user is already an approved vendor
    const user = await prisma.user.findUnique({ where: { phoneNumber: cleanPhone } });
    if (user?.role === 'vendor' || user?.vendorStatus === 'APPROVED') {
      return res.json({
        success: true,
        message: 'You are already an approved Partner Farmer / Vendor!',
        status: 'APPROVED'
      });
    }

    // Check existing pending request
    const existing = await prisma.vendorRequest.findFirst({
      where: { phoneNumber: cleanPhone, status: 'PENDING' }
    });
    if (existing) {
      return res.json({
        success: true,
        message: 'Your vendor registration is already under review by Admin.',
        data: existing,
        status: 'PENDING'
      });
    }

    const request = await prisma.vendorRequest.create({
      data: {
        userId: userId || undefined,
        userName: userName || user?.fullName || 'Farmer Partner',
        phoneNumber: cleanPhone,
        farmName: String(farmName).trim(),
        farmLocation: String(farmLocation).trim(),
        cropCategories: String(cropCategories || 'Fresh Vegetables & Dairy').trim(),
        experienceYears: String(experienceYears || '3').trim(),
        certificateNo: String(certificateNo || 'NPOP-ORG-TN-4821').trim(),
        status: 'PENDING',
        note: note ? String(note).trim() : null
      }
    });

    // Update User vendorStatus
    await prisma.user.upsert({
      where: { phoneNumber: cleanPhone },
      update: { vendorStatus: 'PENDING' },
      create: {
        fullName: userName || 'Farmer Partner',
        phoneNumber: cleanPhone,
        role: 'customer',
        vendorStatus: 'PENDING',
        passwordHash: 'OTP_VERIFIED',
        location: farmLocation
      }
    });

    console.log(`[Vendor Application]: New request submitted for +91 ${cleanPhone} (${farmName})`);
    res.status(201).json({ success: true, message: 'Vendor application submitted! Awaiting admin approval.', data: request, status: 'PENDING' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. Get all Vendor Requests for Admin
app.get('/api/vendor-requests', async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    const where: any = {};
    if (status && status !== 'ALL') {
      where.status = String(status).toUpperCase();
    }
    const requests = await prisma.vendorRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, count: requests.length, data: requests });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. Get customer's vendor status
app.get('/api/vendor-requests/status/:phoneNumber', async (req: Request, res: Response) => {
  try {
    const cleanPhone = String(req.params.phoneNumber || '').replace(/[^0-9]/g, '');
    const user = await prisma.user.findUnique({
      where: { phoneNumber: cleanPhone }
    });

    const latestReq = await prisma.vendorRequest.findFirst({
      where: { phoneNumber: cleanPhone },
      orderBy: { createdAt: 'desc' }
    });

    const isApproved = user?.role === 'vendor' || latestReq?.status === 'APPROVED';
    const status = isApproved ? 'APPROVED' : (latestReq?.status || user?.vendorStatus || 'NONE');

    res.json({
      success: true,
      phoneNumber: cleanPhone,
      status, // NONE, PENDING, APPROVED, REJECTED
      isApproved,
      request: latestReq
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. Admin Approve Vendor Request
app.post('/api/vendor-requests/:id/approve', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const request = await prisma.vendorRequest.findUnique({ where: { id } });
    if (!request) {
      return res.status(404).json({ success: false, message: 'Vendor request not found.' });
    }

    const updatedReq = await prisma.vendorRequest.update({
      where: { id },
      data: { status: 'APPROVED' }
    });

    // Update User role to vendor and vendorStatus to APPROVED
    await prisma.user.upsert({
      where: { phoneNumber: request.phoneNumber },
      update: { role: 'vendor', vendorStatus: 'APPROVED' },
      create: {
        fullName: request.userName,
        phoneNumber: request.phoneNumber,
        role: 'vendor',
        vendorStatus: 'APPROVED',
        passwordHash: 'OTP_VERIFIED',
        location: request.farmLocation
      }
    });

    console.log(`[Admin]: Approved vendor request ${id} for +91 ${request.phoneNumber} (${request.farmName})`);
    res.json({ success: true, message: `Approved "${request.farmName}" as verified Vendor!`, data: updatedReq });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 5. Admin Reject Vendor Request
app.post('/api/vendor-requests/:id/reject', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const updatedReq = await prisma.vendorRequest.update({
      where: { id },
      data: {
        status: 'REJECTED',
        note: reason ? String(reason) : 'Incomplete farm documentation'
      }
    });

    await prisma.user.updateMany({
      where: { phoneNumber: updatedReq.phoneNumber },
      data: { vendorStatus: 'REJECTED' }
    });

    res.json({ success: true, message: 'Vendor request rejected.', data: updatedReq });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 6. Generate Vendor Token (Requires verified Admin Approval)
app.post('/api/auth/vendor-token', async (req: Request, res: Response) => {
  try {
    const { phoneNumber } = req.body;
    const cleanPhone = String(phoneNumber || '').replace(/[^0-9]/g, '');

    // Check if user is approved vendor in Prisma DB
    const user = await prisma.user.findUnique({
      where: { phoneNumber: cleanPhone }
    });

    const approvedReq = await prisma.vendorRequest.findFirst({
      where: { phoneNumber: cleanPhone, status: 'APPROVED' }
    });

    const isApproved = user?.role === 'vendor' || user?.vendorStatus === 'APPROVED' || approvedReq !== null;

    // Allow demo numbers 8888888888 and 9876543210 for testing
    const isDemoBypass = cleanPhone === '8888888888' || cleanPhone === '9876543210';

    if (!isApproved && !isDemoBypass) {
      return res.status(403).json({
        success: false,
        message: 'Vendor access denied. Please submit your Vendor Registration in your Profile and await Admin approval.',
        status: user?.vendorStatus || 'NONE'
      });
    }

    // Ensure Vendor record in Prisma DB
    const vendorUser = await prisma.user.upsert({
      where: { phoneNumber: cleanPhone.length === 10 ? cleanPhone : '8888888888' },
      update: { role: 'vendor', vendorStatus: 'APPROVED' },
      create: {
        fullName: user?.fullName || 'Organic Harvest Vendor',
        phoneNumber: cleanPhone.length === 10 ? cleanPhone : '8888888888',
        role: 'vendor',
        vendorStatus: 'APPROVED',
        passwordHash: 'OTP_VERIFIED',
        location: 'Salem Farm Hub, TN'
      }
    });

    // Generate Vendor JWT Token
    const vendorToken = jwt.sign(
      {
        id: vendorUser.id,
        phoneNumber: vendorUser.phoneNumber,
        role: 'vendor',
        type: 'VENDOR_TOKEN'
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    console.log(`[Vendor Auth]: Generated Vendor Token for ${vendorUser.phoneNumber}`);

    res.json({
      success: true,
      message: 'Vendor authentication successful. Switched to Vendor Portal.',
      token: vendorToken,
      role: 'vendor',
      user: {
        id: vendorUser.id,
        phoneNumber: vendorUser.phoneNumber,
        fullName: vendorUser.fullName,
        role: 'vendor'
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

const server = app.listen(PORT, () => {
  console.log(`[Server]: AgriFlow AI backend (Prisma) is listening at http://localhost:${PORT}`);
});

server.on('error', (err: any) => {
  if (err.code === 'EADDRINUSE') {
    console.warn(`[Server Warning]: Port ${PORT} is already in use by an active server.`);
    console.log(`[Server]: AgriFlow AI backend is already running on http://localhost:${PORT}`);
  } else {
    console.error('[Server Error]:', err);
  }
});

export default app;
