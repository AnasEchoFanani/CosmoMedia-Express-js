import express from 'express';
import { body } from 'express-validator';
import * as serviceController from '../controllers/serviceController.js';
import * as serviceBundleController from '../controllers/serviceBundleController.js';
import * as serviceReviewController from '../controllers/serviceReviewController.js';
import * as serviceAnalyticsController from '../controllers/serviceAnalyticsController.js';

const router = express.Router();

// Service validation middleware
const validateService = [
  body('name').notEmpty().trim(),
  body('description').notEmpty(),
  body('price').isDecimal({ min: 0 }),
  body('category').isIn(['WEB_DEVELOPMENT', 'MOBILE_DEVELOPMENT', 'UI_UX_DESIGN', 'CLOUD_SERVICES', 'CONSULTING', 'MAINTENANCE']),
  body('features').isArray(),
  body('deliveryTimeframe').notEmpty(),
  body('isActive').optional().isBoolean(),
  body('customizationOptions').optional().isArray(),
  body('technologiesUsed').optional().isArray(),
  body('maintenanceIncluded').optional().isBoolean(),
  body('maintenanceDuration').optional().isInt({ min: 0 }),
  body('seoOptimization').optional().isBoolean(),
  body('bundleIds').optional().isArray()
];

// Bundle validation middleware
const validateBundle = [
  body('name').notEmpty().trim(),
  body('description').notEmpty(),
  body('discountPercentage').isInt({ min: 0, max: 100 }),
  body('isActive').optional().isBoolean(),
  body('serviceIds').isArray().custom((value) => {
    if (value.length < 2) {
      throw new Error('Bundle must contain at least 2 services');
    }
    return true;
  })
];

// Review validation middleware
const validateReview = [
  body('serviceId').notEmpty().isInt(),
  body('clientId').notEmpty().isInt(),
  body('rating').isInt({ min: 1, max: 5 }),
  body('review').notEmpty().trim(),
  body('projectId').optional().isInt(),
  body('completionDate').optional().isISO8601()
];

// Service routes
router.get('/services', serviceController.getAllServices);
router.get('/services/search', serviceController.searchServices);
router.get('/services/:id', serviceController.getServiceById);
router.post('/services', validateService, serviceController.createService);
router.put('/services/:id', validateService, serviceController.updateService);
router.delete('/services/:id', serviceController.deleteService);

// Bundle routes
router.get('/bundles', serviceBundleController.getAllBundles);
router.get('/bundles/:id', serviceBundleController.getBundleById);
router.post('/bundles', validateBundle, serviceBundleController.createBundle);
router.put('/bundles/:id', validateBundle, serviceBundleController.updateBundle);
router.delete('/bundles/:id', serviceBundleController.deleteBundle);

// Review routes
router.get('/reviews', serviceReviewController.getAllReviews);
router.post('/reviews', validateReview, serviceReviewController.createReview);
router.post('/reviews/:id/respond', [
  body('response').notEmpty().trim()
], serviceReviewController.respondToReview);
router.post('/reviews/:id/verify', serviceReviewController.verifyReview);

// Analytics routes
router.get('/analytics/services/:serviceId', serviceAnalyticsController.getServiceAnalytics);
router.post('/analytics/services/:serviceId/view', serviceAnalyticsController.incrementServiceViews);
router.post('/analytics/services/:serviceId/inquiry', serviceAnalyticsController.recordServiceInquiry);
router.post('/analytics/services/:serviceId/complete', [
  body('completionTime').isInt({ min: 1 })
], serviceAnalyticsController.updateCompletedProject);
router.get('/analytics/popular', serviceAnalyticsController.getPopularServices);

// Recommendation routes
router.get('/recommendations/services/:serviceId/client/:clientId', serviceAnalyticsController.getServiceRecommendations);
router.get('/services/compare', serviceAnalyticsController.compareServices);

export default router;
