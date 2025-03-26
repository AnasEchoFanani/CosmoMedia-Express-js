import ServiceAnalytics from '../models/ServiceAnalytics.js';
import { Service } from '../models/Service.js';
import { Op } from 'sequelize';

export const getServiceAnalytics = async (req, res) => {
  try {
    const serviceId = req.params.serviceId;
    const analytics = await ServiceAnalytics.findOne({
      where: { serviceId },
      include: [{
        model: Service,
        attributes: ['name', 'category']
      }]
    });

    if (!analytics) {
      return res.status(404).json({ message: 'Analytics not found' });
    }

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const incrementServiceViews = async (req, res) => {
  try {
    const serviceId = req.params.serviceId;
    const [analytics] = await ServiceAnalytics.findOrCreate({
      where: { serviceId }
    });

    await analytics.increment('viewCount');
    await analytics.update({ lastUpdated: new Date() });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const recordServiceInquiry = async (req, res) => {
  try {
    const serviceId = req.params.serviceId;
    const [analytics] = await ServiceAnalytics.findOrCreate({
      where: { serviceId }
    });

    await analytics.increment('inquiryCount');
    
    // Update conversion rate
    const conversionRate = (analytics.completedProjects / analytics.inquiryCount) * 100;
    await analytics.update({ 
      conversionRate,
      lastUpdated: new Date()
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateCompletedProject = async (req, res) => {
  try {
    const serviceId = req.params.serviceId;
    const { completionTime } = req.body; // in days

    const [analytics] = await ServiceAnalytics.findOrCreate({
      where: { serviceId }
    });

    await analytics.increment('completedProjects');

    // Update average completion time
    const newAverage = analytics.averageCompletionTime 
      ? (analytics.averageCompletionTime * (analytics.completedProjects - 1) + completionTime) / analytics.completedProjects
      : completionTime;

    // Update conversion rate
    const conversionRate = (analytics.completedProjects / analytics.inquiryCount) * 100;

    await analytics.update({ 
      averageCompletionTime: newAverage,
      conversionRate,
      lastUpdated: new Date()
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPopularServices = async (req, res) => {
  try {
    const { category, timeframe } = req.query;
    const limit = parseInt(req.query.limit) || 5;

    const dateFilter = getDateFilter(timeframe);
    
    const queryOptions = {
      limit,
      include: [{
        model: Service,
        attributes: ['name', 'category', 'price'],
        where: category ? { category } : {}
      }],
      where: dateFilter ? {
        lastUpdated: { [Op.gte]: dateFilter }
      } : {},
      order: [['popularityScore', 'DESC']]
    };

    const popularServices = await ServiceAnalytics.findAll(queryOptions);
    res.json(popularServices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getServiceRecommendations = async (req, res) => {
  try {
    const { serviceId, clientId } = req.params;
    const limit = parseInt(req.query.limit) || 3;

    // Get the current service
    const currentService = await Service.findByPk(serviceId);
    if (!currentService) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Get complementary services based on category and analytics
    const recommendations = await Service.findAll({
      where: {
        id: { [Op.ne]: serviceId },
        isActive: true,
        [Op.or]: [
          { category: currentService.category },
          { 
            category: {
              [Op.in]: getComplementaryCategories(currentService.category)
            }
          }
        ]
      },
      include: [{
        model: ServiceAnalytics,
        where: {
          popularityScore: { [Op.gt]: 0 }
        }
      }],
      limit,
      order: [
        [ServiceAnalytics, 'popularityScore', 'DESC']
      ]
    });

    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const compareServices = async (req, res) => {
  try {
    const { serviceIds } = req.query;
    if (!serviceIds || !Array.isArray(serviceIds)) {
      return res.status(400).json({ message: 'Please provide an array of service IDs' });
    }

    const services = await Service.findAll({
      where: { id: serviceIds },
      include: [{
        model: ServiceAnalytics,
        attributes: [
          'averageRating',
          'completedProjects',
          'averageCompletionTime',
          'conversionRate'
        ]
      }]
    });

    const comparison = services.map(service => ({
      id: service.id,
      name: service.name,
      category: service.category,
      price: service.price,
      features: service.features,
      rating: service.ServiceAnalytic?.averageRating || 0,
      completedProjects: service.ServiceAnalytic?.completedProjects || 0,
      averageCompletionTime: service.ServiceAnalytic?.averageCompletionTime || 0,
      conversionRate: service.ServiceAnalytic?.conversionRate || 0
    }));

    res.json(comparison);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper function to get date filter based on timeframe
const getDateFilter = (timeframe) => {
  const now = new Date();
  switch (timeframe) {
    case 'day':
      return new Date(now.setDate(now.getDate() - 1));
    case 'week':
      return new Date(now.setDate(now.getDate() - 7));
    case 'month':
      return new Date(now.setMonth(now.getMonth() - 1));
    case 'year':
      return new Date(now.setFullYear(now.getFullYear() - 1));
    default:
      return null;
  }
};

// Helper function to get complementary service categories
const getComplementaryCategories = (category) => {
  const complementaryMap = {
    'WEB_DEVELOPMENT': ['UI_UX_DESIGN', 'CLOUD_SERVICES', 'MAINTENANCE'],
    'MOBILE_DEVELOPMENT': ['UI_UX_DESIGN', 'CLOUD_SERVICES', 'MAINTENANCE'],
    'UI_UX_DESIGN': ['WEB_DEVELOPMENT', 'MOBILE_DEVELOPMENT'],
    'CLOUD_SERVICES': ['WEB_DEVELOPMENT', 'MOBILE_DEVELOPMENT', 'MAINTENANCE'],
    'CONSULTING': ['WEB_DEVELOPMENT', 'MOBILE_DEVELOPMENT', 'CLOUD_SERVICES'],
    'MAINTENANCE': ['WEB_DEVELOPMENT', 'MOBILE_DEVELOPMENT', 'CLOUD_SERVICES']
  };
  
  return complementaryMap[category] || [];
};
