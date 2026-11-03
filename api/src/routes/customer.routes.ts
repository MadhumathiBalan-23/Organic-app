import { Router } from 'express';
import { CustomerController } from '../controllers/customer.controller';

const router = Router();

// 0. Consolidated Single Landing Feed (Requirement 3)
router.get('/customer/landing', CustomerController.getLandingFeed);
router.get('/landing', CustomerController.getLandingFeed);

// 1. Categories
router.get('/customer/categories', CustomerController.getCategories);
router.get('/customer/categories/:categoryId', CustomerController.getCategoryById);

// 2. Vendor Discovery for a Category
router.get('/customer/categories/:categoryId/vendors', CustomerController.getCategoryVendors);

// 3. Product Search
router.get('/customer/products/search', CustomerController.searchProducts);

// 4. Products Listing (Paginated, Filters, Sort)
router.get('/customer/products', CustomerController.getProducts);

// 5. Vendor-Specific Product Listing
router.get('/customer/vendors/:vendorId/products', CustomerController.getVendorProducts);

// 6. Single Product Details
router.get('/customer/products/:vendorProductId', CustomerController.getProductById);

// 7. Dynamic Product Reviews (Requirement 5)
router.get('/customer/products/:productId/reviews', CustomerController.getProductReviews);
router.post('/customer/products/:productId/reviews', CustomerController.addProductReview);

export default router;
