import { validationResult } from 'express-validator';
import Service from '../models/Service.js';
import { ServiceBundle } from '../models/Service.js';
import { Op } from 'sequelize';

export const getAllServices = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const category = req.query.category;
    const minPrice = req.query.minPrice;
    const maxPrice = req.query.maxPrice;
    const isActive = req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined;

    const queryOptions = {
      limit,
      offset,
      where: {},
      include: [{
        model: ServiceBundle,
        through: { attributes: [] }, // Don't include junction table
        attributes: ['id', 'name', 'discountPercentage']
      }],
      order: [['createdAt', 'DESC']]
    };

    // Apply filters
    if (category) {
      queryOptions.where.category = category;
    }

    if (isActive !== undefined) {
      queryOptions.where.isActive = isActive;
    }

    if (minPrice || maxPrice) {
      queryOptions.where.price = {};
      if (minPrice) queryOptions.where.price[Op.gte] = minPrice;
      if (maxPrice) queryOptions.where.price[Op.lte] = maxPrice;
    }

    const { count, rows } = await Service.findAndCountAll(queryOptions);

    res.json({
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      services: rows
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getServiceById = async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id, {
      include: [{
        model: ServiceBundle,
        through: { attributes: [] }
      }]
    });

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    res.json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createService = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check for duplicate name
    const existingService = await Service.findOne({
      where: { name: req.body.name }
    });

    if (existingService) {
      return res.status(400).json({ message: 'Service with this name already exists' });
    }

    const service = await Service.create(req.body);

    // If bundles are provided, associate them
    if (req.body.bundleIds && Array.isArray(req.body.bundleIds)) {
      const bundles = await ServiceBundle.findAll({
        where: { id: req.body.bundleIds }
      });
      await service.addServiceBundles(bundles);
    }

    // Fetch the service with its bundles
    const serviceWithBundles = await Service.findByPk(service.id, {
      include: [{
        model: ServiceBundle,
        through: { attributes: [] }
      }]
    });

    res.status(201).json(serviceWithBundles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateService = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const service = await Service.findByPk(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Check for duplicate name if name is being changed
    if (req.body.name && req.body.name !== service.name) {
      const existingService = await Service.findOne({
        where: { name: req.body.name }
      });

      if (existingService) {
        return res.status(400).json({ message: 'Service with this name already exists' });
      }
    }

    await service.update(req.body);

    // Update bundle associations if provided
    if (req.body.bundleIds && Array.isArray(req.body.bundleIds)) {
      const bundles = await ServiceBundle.findAll({
        where: { id: req.body.bundleIds }
      });
      await service.setServiceBundles(bundles);
    }

    // Fetch updated service with bundles
    const updatedService = await Service.findByPk(service.id, {
      include: [{
        model: ServiceBundle,
        through: { attributes: [] }
      }]
    });

    res.json(updatedService);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteService = async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Check if service is part of any active bundles
    const bundleCount = await service.countServiceBundles({
      where: { isActive: true }
    });

    if (bundleCount > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete service that is part of active bundles' 
      });
    }

    await service.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const searchServices = async (req, res) => {
  try {
    const query = req.query.q;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const { count, rows } = await Service.findAndCountAll({
      where: {
        [Op.or]: [
          { name: { [Op.like]: `%${query}%` } },
          { description: { [Op.like]: `%${query}%` } },
          { category: { [Op.like]: `%${query}%` } }
        ],
        isActive: true
      },
      limit,
      offset,
      include: [{
        model: ServiceBundle,
        through: { attributes: [] }
      }]
    });

    res.json({
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      services: rows
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
