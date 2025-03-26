import { validationResult } from 'express-validator';
import ServiceReview from '../models/ServiceReview.js';
import Service from '../models/Service.js';
import ServiceAnalytics from '../models/ServiceAnalytics.js';
import { Op } from 'sequelize';

export const getAllReviews = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const serviceId = req.query.serviceId;
    const minRating = req.query.minRating;
    const verified = req.query.verified === 'true';

    const queryOptions = {
      limit,
      offset,
      where: {},
      include: [{
        model: Service,
        attributes: ['name', 'category']
      }],
      order: [['createdAt', 'DESC']]
    };

    if (serviceId) {
      queryOptions.where.serviceId = serviceId;
    }

    if (minRating) {
      queryOptions.where.rating = { [Op.gte]: minRating };
    }

    if (verified) {
      queryOptions.where.isVerified = true;
    }

    const { count, rows } = await ServiceReview.findAndCountAll(queryOptions);

    res.json({
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      reviews: rows
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createReview = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if service exists
    const service = await Service.findByPk(req.body.serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Basic sentiment analysis
    const sentiment = analyzeSentiment(req.body.review);
    const review = await ServiceReview.create({
      ...req.body,
      sentiment
    });

    // Update service analytics
    await updateServiceAnalytics(req.body.serviceId);

    const reviewWithService = await ServiceReview.findByPk(review.id, {
      include: [{
        model: Service,
        attributes: ['name', 'category']
      }]
    });

    res.status(201).json(reviewWithService);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const respondToReview = async (req, res) => {
  try {
    const review = await ServiceReview.findByPk(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    await review.update({
      response: req.body.response,
      responseDate: new Date()
    });

    res.json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyReview = async (req, res) => {
  try {
    const review = await ServiceReview.findByPk(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    await review.update({ isVerified: true });
    res.json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper function for basic sentiment analysis
const analyzeSentiment = (text) => {
  const positiveWords = ['great', 'excellent', 'amazing', 'good', 'wonderful', 'fantastic', 'best'];
  const negativeWords = ['bad', 'poor', 'terrible', 'worst', 'disappointing', 'awful'];

  const words = text.toLowerCase().split(/\W+/);
  let positiveCount = 0;
  let negativeCount = 0;

  words.forEach(word => {
    if (positiveWords.includes(word)) positiveCount++;
    if (negativeWords.includes(word)) negativeCount++;
  });

  if (positiveCount > negativeCount) return 'POSITIVE';
  if (negativeCount > positiveCount) return 'NEGATIVE';
  return 'NEUTRAL';
};

// Helper function to update service analytics
const updateServiceAnalytics = async (serviceId) => {
  try {
    const [analytics] = await ServiceAnalytics.findOrCreate({
      where: { serviceId }
    });

    const reviews = await ServiceReview.findAll({
      where: { serviceId }
    });

    const totalReviews = reviews.length;
    const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;

    await analytics.update({
      totalReviews,
      averageRating,
      lastUpdated: new Date()
    });
  } catch (error) {
    console.error('Error updating service analytics:', error);
  }
};
