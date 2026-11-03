import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { prisma } from '../config/db';
import { ProductService } from '../services/product.service';

const REVIEWS_FILE = path.join(__dirname, '../data/reviews.json');

const getStoredReviews = (): Record<string, any[]> => {
  try {
    if (fs.existsSync(REVIEWS_FILE)) {
      const data = fs.readFileSync(REVIEWS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading reviews file:', err);
  }
  return {};
};

const saveStoredReviews = (reviews: Record<string, any[]>) => {
  try {
    fs.mkdirSync(path.dirname(REVIEWS_FILE), { recursive: true });
    fs.writeFileSync(REVIEWS_FILE, JSON.stringify(reviews, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving reviews file:', err);
  }
};

export class CustomerController {
  /**
   * Helper to format product with complete vendor and discount details
   */
  private static formatCustomerProduct(p: any) {
    if (!p) return null;
    const vendor = p.vendor;
    const originalPrice = p.originalPrice || (p.price ? Math.round(p.price * 1.25) : p.price);
    const discountPercentage = originalPrice > p.price
      ? Math.round(((originalPrice - p.price) / originalPrice) * 100)
      : 0;

    let benefitsList: string[] = [];
    try {
      benefitsList = typeof p.benefits === 'string' ? JSON.parse(p.benefits) : (p.benefits || []);
    } catch {
      benefitsList = p.benefits ? [p.benefits] : [];
    }

    return {
      id: p.id,
      vendorProductId: p.id,
      name: p.name,
      category: p.category?.name || p.categoryName || 'Organic',
      categoryId: p.category?.id || null,
      categoryDetails: p.category ? {
        id: p.category.id,
        name: p.category.name,
        emoji: p.category.emoji,
        imageUrl: p.category.imageUrl,
      } : null,
      brand: p.brand || vendor?.businessName || 'Certified Organic',
      price: p.price,
      originalPrice,
      discountBadge: discountPercentage > 0 ? `${discountPercentage}% OFF` : (p.discountBadge || null),
      discountPercentage,
      unit: p.unit || 'Kg',
      rating: p.rating || 4.8,
      stock: p.stock !== undefined ? p.stock : 100,
      isAvailable: (p.stock !== undefined ? p.stock : 100) > 0 && p.isActive !== false,
      availabilityStart: p.availabilityStart || '06:00 AM',
      availabilityEnd: p.availabilityEnd || '09:00 PM',
      description: p.description || '',
      benefits: benefitsList,
      imageUrl: p.imageUrl,
      vendorId: p.vendorId || vendor?.id || null,
      vendorName: vendor?.businessName || p.brand || 'Partner Farm',
      vendorRating: vendor?.rating || 4.8,
      vendorAddress: vendor?.address || '',
      vendorPhone: vendor?.phoneNumber || '',
      vendor: vendor ? {
        id: vendor.id,
        businessName: vendor.businessName,
        ownerName: vendor.ownerName,
        phoneNumber: vendor.phoneNumber,
        address: vendor.address,
        rating: vendor.rating || 4.8,
        status: vendor.status || 'ACTIVE',
        deliveryRadiusKm: vendor.deliveryRadiusKm || 15.0,
      } : null,
      subscriptionAllowed: p.subscriptionAllowed !== false,
      oneTimeAllowed: p.oneTimeAllowed !== false,
      organicCertified: p.organicCertified !== false,
      subscriptionSettings: p.subscriptionSettings || null,
      createdAt: p.createdAt,
    };
  }

  /**
   * GET /api/customer/categories
   * Return dynamic active categories with product count
   */
  public static async getCategories(req: Request, res: Response) {
    try {
      const categories = await prisma.category.findMany({
        where: { isActive: true },
        orderBy: { displayOrder: 'asc' },
        include: {
          _count: {
            select: { products: { where: { isActive: true } } },
          },
        },
      });

      const formatted = categories.map((cat) => ({
        id: cat.id,
        categoryId: cat.id,
        name: cat.name,
        emoji: cat.emoji || '🌱',
        description: cat.description || '',
        imageUrl: cat.imageUrl,
        displayOrder: cat.displayOrder,
        isActive: cat.isActive,
        productCount: cat._count?.products || 0,
      }));

      return res.json({
        success: true,
        count: formatted.length,
        data: formatted,
      });
    } catch (error: any) {
      console.error('[CustomerController.getCategories] Error:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * GET /api/customer/categories/:categoryId
   * Return single category details by UUID or Name
   */
  public static async getCategoryById(req: Request, res: Response) {
    try {
      const { categoryId } = req.params;
      const category = await prisma.category.findFirst({
        where: {
          OR: [
            { id: categoryId },
            { name: { equals: categoryId, mode: 'insensitive' } },
          ],
        },
        include: {
          _count: {
            select: { products: { where: { isActive: true } } },
          },
        },
      });

      if (!category) {
        return res.status(404).json({ success: false, error: 'Category not found.' });
      }

      return res.json({
        success: true,
        data: {
          id: category.id,
          categoryId: category.id,
          name: category.name,
          emoji: category.emoji || '🌱',
          description: category.description || '',
          imageUrl: category.imageUrl,
          displayOrder: category.displayOrder,
          isActive: category.isActive,
          productCount: category._count?.products || 0,
        },
      });
    } catch (error: any) {
      console.error('[CustomerController.getCategoryById] Error:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * GET /api/customer/categories/:categoryId/vendors
   * Vendor Discovery: Vendors offering products in this category
   */
  public static async getCategoryVendors(req: Request, res: Response) {
    try {
      const { categoryId } = req.params;

      // Find matching category by ID or name
      const category = await prisma.category.findFirst({
        where: {
          OR: [
            { id: categoryId },
            { name: { equals: categoryId, mode: 'insensitive' } },
          ],
        },
      });

      const catName = category ? category.name : categoryId;

      // Find active vendors that have products in this category
      const vendors = await prisma.vendor.findMany({
        where: {
          status: 'ACTIVE',
          products: {
            some: {
              categoryName: { equals: catName, mode: 'insensitive' },
              isActive: true,
            },
          },
        },
        include: {
          products: {
            where: {
              categoryName: { equals: catName, mode: 'insensitive' },
              isActive: true,
            },
            take: 4,
            select: {
              id: true,
              name: true,
              price: true,
              unit: true,
              imageUrl: true,
            },
          },
        },
        orderBy: { rating: 'desc' },
      });

      const formatted = vendors.map((v) => ({
        id: v.id,
        vendorId: v.id,
        businessName: v.businessName,
        ownerName: v.ownerName,
        phoneNumber: v.phoneNumber,
        address: v.address,
        rating: v.rating || 4.8,
        deliveryRadiusKm: v.deliveryRadiusKm || 15.0,
        deliveryEstimate: '30–45 mins',
        morningDelivery: 'Tomorrow 06:30 AM',
        minimumOrder: 100,
        isServiceable: true,
        productCount: v.products.length,
        sampleProducts: v.products,
      }));

      return res.json({
        success: true,
        category: category ? { id: category.id, name: category.name, emoji: category.emoji } : null,
        count: formatted.length,
        data: formatted,
      });
    } catch (error: any) {
      console.error('[CustomerController.getCategoryVendors] Error:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * GET /api/customer/products
   * Amazon / Flipkart Style Product Listing with Server-Side Pagination, Filtering & Sorting
   */
  public static async getProducts(req: Request, res: Response) {
    try {
      const {
        categoryId,
        vendorId,
        minPrice,
        maxPrice,
        rating,
        discount,
        availability,
        subscriptionAvailable,
        deliverySlot,
        sortBy = 'recommended',
        search,
        page = '1',
        pageSize = '10',
      } = req.query;

      const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
      const limit = Math.min(50, Math.max(1, parseInt(String(pageSize), 10) || 10));
      const skip = (pageNum - 1) * limit;

      const where: any = {
        isActive: true,
      };

      // 1. Category Filter (by UUID or name)
      if (categoryId && categoryId !== 'All' && categoryId !== 'all') {
        const cat = await prisma.category.findFirst({
          where: {
            OR: [
              { id: String(categoryId) },
              { name: { equals: String(categoryId), mode: 'insensitive' } },
            ],
          },
        });
        if (cat) {
          where.categoryName = cat.name;
        } else {
          where.categoryName = { equals: String(categoryId), mode: 'insensitive' };
        }
      }

      // 2. Vendor Filter (single ID or multiple comma-separated IDs)
      if (vendorId && vendorId !== 'All' && vendorId !== 'all') {
        const vendorList = String(vendorId).split(',').map((v) => v.trim()).filter(Boolean);
        if (vendorList.length === 1) {
          where.vendorId = vendorList[0];
        } else if (vendorList.length > 1) {
          where.vendorId = { in: vendorList };
        }
      }

      // 3. Price Filter
      if (minPrice !== undefined || maxPrice !== undefined) {
        where.price = {};
        if (minPrice !== undefined && !isNaN(parseFloat(String(minPrice)))) {
          where.price.gte = parseFloat(String(minPrice));
        }
        if (maxPrice !== undefined && !isNaN(parseFloat(String(maxPrice)))) {
          where.price.lte = parseFloat(String(maxPrice));
        }
      }

      // 4. Rating Filter
      if (rating !== undefined && !isNaN(parseFloat(String(rating)))) {
        where.rating = { gte: parseFloat(String(rating)) };
      }

      // 5. Discount Filter
      if (discount === 'true' || discount === 'discounted') {
        where.OR = [
          { discountBadge: { not: null } },
          { originalPrice: { gt: prisma.product.fields?.price || 0 } },
        ];
      }

      // 6. Availability Filter (default to in_stock unless explicitly asked for 'all' or 'out_of_stock')
      if (availability === 'out_of_stock') {
        where.stock = { lte: 0 };
      } else if (availability === 'all') {
        // do not restrict stock
      } else {
        // default: in stock
        where.stock = { gt: 0 };
      }

      // 7. Subscription vs One-Time Filter
      if (subscriptionAvailable === 'true' || subscriptionAvailable === 'subscription') {
        where.subscriptionAllowed = true;
      } else if (subscriptionAvailable === 'one_time') {
        where.oneTimeAllowed = true;
      }

      // 8. Dynamic Search (Product Name, Brand, Description, or Vendor Business Name)
      if (search && String(search).trim()) {
        const q = String(search).trim();
        where.OR = [
          { name: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
          { brand: { contains: q, mode: 'insensitive' } },
          { vendor: { businessName: { contains: q, mode: 'insensitive' } } },
        ];
      }

      // 9. Sorting
      let orderBy: any = { createdAt: 'desc' };
      switch (String(sortBy)) {
        case 'priceLowToHigh':
          orderBy = { price: 'asc' };
          break;
        case 'priceHighToLow':
          orderBy = { price: 'desc' };
          break;
        case 'highestRated':
          orderBy = { rating: 'desc' };
          break;
        case 'newest':
          orderBy = { createdAt: 'desc' };
          break;
        case 'highestDiscount':
          orderBy = [{ originalPrice: 'desc' }, { price: 'asc' }];
          break;
        case 'recommended':
        default:
          orderBy = [{ rating: 'desc' }, { createdAt: 'desc' }];
          break;
      }

      // Execute Count and Paginated Query in parallel
      const [totalRecords, products] = await Promise.all([
        prisma.product.count({ where }),
        prisma.product.findMany({
          where,
          include: {
            category: true,
            vendor: true,
            subscriptionSettings: true,
          },
          orderBy,
          skip,
          take: limit,
        }),
      ]);

      const totalPages = Math.ceil(totalRecords / limit) || 1;
      const formatted = products.map(CustomerController.formatCustomerProduct);

      // Aggregate available vendors in this result set for UI filter chips
      const availableVendors = await prisma.vendor.findMany({
        where: {
          status: 'ACTIVE',
          products: { some: { isActive: true, ...(where.categoryName ? { categoryName: where.categoryName } : {}) } },
        },
        select: { id: true, businessName: true, rating: true },
        take: 10,
      });

      return res.json({
        success: true,
        data: formatted,
        pagination: {
          currentPage: pageNum,
          pageSize: limit,
          totalRecords,
          totalPages,
          hasNextPage: pageNum < totalPages,
          hasPreviousPage: pageNum > 1,
        },
        filters: {
          activeCategory: categoryId || 'All',
          activeVendor: vendorId || 'All',
          availableVendors: availableVendors.map((v) => ({ id: v.id, name: v.businessName, rating: v.rating })),
        },
      });
    } catch (error: any) {
      console.error('[CustomerController.getProducts] Error:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * GET /api/customer/vendors/:vendorId/products
   * Vendor-specific product catalog with pagination, filters, and vendor header
   */
  public static async getVendorProducts(req: Request, res: Response) {
    try {
      const { vendorId } = req.params;
      const { categoryId, search, sortBy, page = '1', pageSize = '10' } = req.query;

      // Find Vendor Details
      const vendor = await prisma.vendor.findUnique({
        where: { id: vendorId },
        include: {
          _count: {
            select: { products: { where: { isActive: true } } },
          },
        },
      });

      if (!vendor) {
        return res.status(404).json({ success: false, error: 'Vendor not found.' });
      }

      // Delegate to getProducts logic with enforced vendorId
      req.query.vendorId = vendorId;
      if (categoryId) req.query.categoryId = categoryId;
      if (search) req.query.search = search;
      if (sortBy) req.query.sortBy = sortBy;
      if (page) req.query.page = page;
      if (pageSize) req.query.pageSize = pageSize;

      // Call getProducts handler with modified query
      const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
      const limit = Math.min(50, Math.max(1, parseInt(String(pageSize), 10) || 10));
      const skip = (pageNum - 1) * limit;

      const where: any = {
        vendorId,
        isActive: true,
      };

      if (categoryId && categoryId !== 'All') {
        const cat = await prisma.category.findFirst({
          where: {
            OR: [
              { id: String(categoryId) },
              { name: { equals: String(categoryId), mode: 'insensitive' } },
            ],
          },
        });
        if (cat) where.categoryName = cat.name;
        else where.categoryName = { equals: String(categoryId), mode: 'insensitive' };
      }

      if (search && String(search).trim()) {
        const q = String(search).trim();
        where.OR = [
          { name: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ];
      }

      const [totalRecords, products] = await Promise.all([
        prisma.product.count({ where }),
        prisma.product.findMany({
          where,
          include: {
            category: true,
            vendor: true,
            subscriptionSettings: true,
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
      ]);

      const totalPages = Math.ceil(totalRecords / limit) || 1;
      const formatted = products.map(CustomerController.formatCustomerProduct);

      // Categories offered by this vendor
      const vendorCategories = await prisma.product.findMany({
        where: { vendorId, isActive: true },
        select: { categoryName: true },
        distinct: ['categoryName'],
      });

      return res.json({
        success: true,
        vendor: {
          id: vendor.id,
          businessName: vendor.businessName,
          ownerName: vendor.ownerName,
          phoneNumber: vendor.phoneNumber,
          address: vendor.address,
          rating: vendor.rating || 4.8,
          deliveryRadiusKm: vendor.deliveryRadiusKm || 15.0,
          totalProducts: vendor._count?.products || 0,
          categories: vendorCategories.map((c) => c.categoryName),
        },
        data: formatted,
        pagination: {
          currentPage: pageNum,
          pageSize: limit,
          totalRecords,
          totalPages,
          hasNextPage: pageNum < totalPages,
          hasPreviousPage: pageNum > 1,
        },
      });
    } catch (error: any) {
      console.error('[CustomerController.getVendorProducts] Error:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * GET /api/customer/products/:vendorProductId
   * Full details of single product
   */
  public static async getProductById(req: Request, res: Response) {
    try {
      const { vendorProductId } = req.params;
      const product = await prisma.product.findUnique({
        where: { id: vendorProductId },
        include: {
          category: true,
          vendor: true,
          subscriptionSettings: true,
        },
      });

      if (!product) {
        return res.status(404).json({ success: false, error: 'Product not found.' });
      }

      return res.json({
        success: true,
        data: CustomerController.formatCustomerProduct(product),
      });
    } catch (error: any) {
      console.error('[CustomerController.getProductById] Error:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * GET /api/customer/products/search
   * Dynamic search suggestions across products, categories, and vendors
   */
  public static async searchProducts(req: Request, res: Response) {
    try {
      const query = String(req.query.q || req.query.search || '').trim();
      const vendorId = req.query.vendorId ? String(req.query.vendorId) : undefined;

      if (!query || query.length < 1) {
        return res.json({
          success: true,
          query: '',
          data: { products: [], categories: [], vendors: [] },
        });
      }

      const productWhere: any = {
        isActive: true,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { brand: { contains: query, mode: 'insensitive' } },
        ],
      };
      if (vendorId) {
        productWhere.vendorId = vendorId;
      }

      const [products, categories, vendors] = await Promise.all([
        prisma.product.findMany({
          where: productWhere,
          include: { category: true, vendor: true },
          take: 8,
        }),
        !vendorId
          ? prisma.category.findMany({
              where: {
                isActive: true,
                name: { contains: query, mode: 'insensitive' },
              },
              take: 4,
            })
          : Promise.resolve([]),
        !vendorId
          ? prisma.vendor.findMany({
              where: {
                status: 'ACTIVE',
                businessName: { contains: query, mode: 'insensitive' },
              },
              take: 4,
            })
          : Promise.resolve([]),
      ]);

      return res.json({
        success: true,
        query,
        data: {
          products: products.map(CustomerController.formatCustomerProduct),
          categories: categories.map((c) => ({ id: c.id, name: c.name, emoji: c.emoji })),
          vendors: vendors.map((v) => ({ id: v.id, name: v.businessName, rating: v.rating })),
        },
      });
    } catch (error: any) {
      console.error('[CustomerController.searchProducts] Error:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Consolidated Single Landing Feed API (Requirement 3)
   * Fetches banners, categories, and products in a single call for high-performance skeleton loading
   */
  public static async getLandingFeed(req: Request, res: Response) {
    try {
      const now = new Date();
      const [banners, categories, rawProducts] = await Promise.all([
        // 1. Active Banners
        prisma.banner.findMany({
          where: {
            isActive: true,
            AND: [
              { OR: [{ startAt: null }, { startAt: { lte: now } }] },
              { OR: [{ endAt: null }, { endAt: { gte: now } }] },
            ],
          },
          orderBy: { displayOrder: 'asc' },
        }),
        // 2. Active Categories
        prisma.category.findMany({
          where: { isActive: true },
          orderBy: { displayOrder: 'asc' },
        }),
        // 3. Featured / Harvest Products
        prisma.product.findMany({
          where: { isAvailable: true },
          include: {
            category: true,
            vendor: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 30,
        }),
      ]);

      const formattedProducts = rawProducts.map(CustomerController.formatCustomerProduct);

      return res.json({
        success: true,
        data: {
          banners,
          categories: categories.map(c => ({
            id: c.id,
            name: c.name,
            emoji: c.emoji,
            imageUrl: c.imageUrl,
            description: c.description,
          })),
          products: formattedProducts,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error: any) {
      console.error('[CustomerController.getLandingFeed] Error:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Dynamic Product Reviews (Requirement 5 & Product-Wise Customer Validation)
   */
  public static async getProductReviews(req: Request, res: Response) {
    try {
      const { productId } = req.params;
      const cleanProductId = String(productId || '').trim();
      const allReviews = getStoredReviews();
      const productReviews = allReviews[cleanProductId] || [];

      // Calculate aggregate rating stats
      const totalCount = productReviews.length;
      const avgRating = totalCount > 0
        ? Number((productReviews.reduce((sum: number, r: any) => sum + (Number(r.rating) || 5), 0) / totalCount).toFixed(1))
        : 5.0;

      return res.json({
        success: true,
        count: totalCount,
        avgRating,
        data: productReviews,
      });
    } catch (error: any) {
      console.error('[CustomerController.getProductReviews] Error:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  public static async addProductReview(req: Request, res: Response) {
    try {
      const { productId } = req.params;
      const cleanProductId = String(productId || '').trim();

      // 1. Product Validation
      if (!cleanProductId) {
        return res.status(400).json({ success: false, message: 'Product ID is required to submit a review.' });
      }

      const { userName, rating, comment } = req.body;

      // 2. Rating Validation (Must be an integer between 1 and 5)
      const numericRating = Number(rating);
      if (isNaN(numericRating) || !Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
        return res.status(400).json({
          success: false,
          field: 'rating',
          message: 'Please select a valid rating between 1 and 5 stars.',
        });
      }

      // 3. Customer Name Validation (Min 2 chars, max 50 chars, letters & spaces only)
      const cleanName = typeof userName === 'string' ? userName.trim() : '';
      if (!cleanName || cleanName.length < 2) {
        return res.status(400).json({
          success: false,
          field: 'userName',
          message: 'Customer name is required and must be at least 2 characters long.',
        });
      }
      if (cleanName.length > 50) {
        return res.status(400).json({
          success: false,
          field: 'userName',
          message: 'Customer name cannot exceed 50 characters.',
        });
      }
      if (!/^[a-zA-Z\s.'-]+$/.test(cleanName)) {
        return res.status(400).json({
          success: false,
          field: 'userName',
          message: 'Customer name can only contain letters, spaces, and periods.',
        });
      }

      // 4. Feedback / Comment Validation (Min 10 chars, max 500 chars)
      const cleanComment = typeof comment === 'string' ? comment.trim() : '';
      if (!cleanComment || cleanComment.length < 10) {
        return res.status(400).json({
          success: false,
          field: 'comment',
          message: 'Review feedback must be at least 10 characters long to provide helpful details for buyers and farmers.',
        });
      }
      if (cleanComment.length > 500) {
        return res.status(400).json({
          success: false,
          field: 'comment',
          message: 'Review feedback cannot exceed 500 characters.',
        });
      }

      // 5. Customer Identification & Purchase Verification
      const cleanPhone = String(req.body.customerPhone || req.body.userPhone || '').replace(/[^0-9]/g, '');
      let isVerifiedPurchase = false;

      if (cleanPhone) {
        try {
          const orderMatch = await prisma.orderItem.findFirst({
            where: {
              productId: cleanProductId,
              order: {
                customerPhone: { contains: cleanPhone },
              },
            },
          });

          const subMatch = !orderMatch ? await prisma.subscription.findFirst({
            where: {
              productId: cleanProductId,
              customerPhone: { contains: cleanPhone },
            },
          }) : null;

          isVerifiedPurchase = Boolean(orderMatch || subMatch);
        } catch (err) {
          console.log('[addProductReview] Note: DB purchase verification skipped:', err);
        }
      }

      // 6. Product-Wise Isolation & Duplicate Prevention (One review per customer per product)
      const allReviews = getStoredReviews();
      if (!allReviews[cleanProductId]) {
        allReviews[cleanProductId] = [];
      }

      const existingIndex = allReviews[cleanProductId].findIndex((r: any) => {
        if (cleanPhone && r.customerPhone === cleanPhone) return true;
        if (!cleanPhone && r.userName.toLowerCase() === cleanName.toLowerCase()) return true;
        return false;
      });

      let savedReview: any;
      let isUpdate = false;

      if (existingIndex >= 0) {
        // Customer already reviewed this product -> Update existing review!
        isUpdate = true;
        allReviews[cleanProductId][existingIndex] = {
          ...allReviews[cleanProductId][existingIndex],
          userName: cleanName,
          rating: numericRating,
          comment: cleanComment,
          customerPhone: cleanPhone || allReviews[cleanProductId][existingIndex].customerPhone || null,
          date: 'Updated just now',
          updatedAt: new Date().toISOString(),
          verifiedPurchase: isVerifiedPurchase || allReviews[cleanProductId][existingIndex].verifiedPurchase || false,
        };
        savedReview = allReviews[cleanProductId][existingIndex];
      } else {
        // Create new review
        savedReview = {
          id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          productId: cleanProductId,
          customerPhone: cleanPhone || null,
          userName: cleanName,
          rating: numericRating,
          comment: cleanComment,
          date: 'Just now',
          createdAt: new Date().toISOString(),
          verifiedPurchase: isVerifiedPurchase,
        };
        allReviews[cleanProductId].unshift(savedReview);
      }

      saveStoredReviews(allReviews);

      // Update aggregate rating for the product in database
      try {
        const count = allReviews[cleanProductId].length;
        const avg = count > 0 ? allReviews[cleanProductId].reduce((s: number, r: any) => s + r.rating, 0) / count : numericRating;
        await prisma.product.update({
          where: { id: cleanProductId },
          data: { rating: Number(avg.toFixed(1)) },
        });
      } catch {}

      return res.status(isUpdate ? 200 : 201).json({
        success: true,
        message: isUpdate
          ? 'Your review for this product has been updated successfully.'
          : 'Thank you! Your product review has been submitted successfully.',
        isUpdate,
        data: savedReview,
      });
    } catch (error: any) {
      console.error('[CustomerController.addProductReview] Error:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  }
}
