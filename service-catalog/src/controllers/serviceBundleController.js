import { validationResult } from 'express-validator';
import { ServiceBundle, Service } from '../models/Service.js';
import { Op } from 'sequelize';

export const getAllBundles = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const isActive = req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined;

    const queryOptions = {
      limit,
      offset,
      where: {},
      include: [{
        model: Service,
        through: { attributes: [] },
        attributes: ['id', 'name', 'price', 'category']
      }],
      order: [['createdAt', 'DESC']]
    };

    if (isActive !== undefined) {
      queryOptions.where.isActive = isActive;
    }

    const { count, rows } = await ServiceBundle.findAndCountAll(queryOptions);

    // Calculate actual prices with discounts
    const bundlesWithPrices = rows.map(bundle => {
      const totalPrice = bundle.Services.reduce((sum, service) => sum + Number(service.price), 0);
      const discountedPrice = totalPrice * (1 - bundle.discountPercentage / 100);
      const savings = totalPrice - discountedPrice;

      return {
        ...bundle.toJSON(),
        originalPrice: totalPrice,
        discountedPrice: discountedPrice,
        savings: savings
      };
    });

    res.json({
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      bundles: bundlesWithPrices
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getBundleById = async (req, res) => {
  try {
    const bundle = await ServiceBundle.findByPk(req.params.id, {
      include: [{
        model: Service,
        through: { attributes: [] }
      }]
    });

    if (!bundle) {
      return res.status(404).json({ message: 'Bundle not found' });
    }

    // Calculate prices
    const totalPrice = bundle.Services.reduce((sum, service) => sum + Number(service.price), 0);
    const discountedPrice = totalPrice * (1 - bundle.discountPercentage / 100);
    const savings = totalPrice - discountedPrice;

    const bundleWithPrices = {
      ...bundle.toJSON(),
      originalPrice: totalPrice,
      discountedPrice: discountedPrice,
      savings: savings
    };

    res.json(bundleWithPrices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createBundle = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check for duplicate name
    const existingBundle = await ServiceBundle.findOne({
      where: { name: req.body.name }
    });

    if (existingBundle) {
      return res.status(400).json({ message: 'Bundle with this name already exists' });
    }

    // Verify all services exist and are active
    if (!req.body.serviceIds || !Array.isArray(req.body.serviceIds) || req.body.serviceIds.length < 2) {
      return res.status(400).json({ message: 'Bundle must contain at least 2 services' });
    }

    const services = await Service.findAll({
      where: {
        id: req.body.serviceIds,
        isActive: true
      }
    });

    if (services.length !== req.body.serviceIds.length) {
      return res.status(400).json({ message: 'One or more services are invalid or inactive' });
    }

    const bundle = await ServiceBundle.create(req.body);
    await bundle.setServices(services);

    // Fetch the complete bundle with services
    const bundleWithServices = await ServiceBundle.findByPk(bundle.id, {
      include: [{
        model: Service,
        through: { attributes: [] }
      }]
    });

    // Calculate prices
    const totalPrice = services.reduce((sum, service) => sum + Number(service.price), 0);
    const discountedPrice = totalPrice * (1 - bundle.discountPercentage / 100);
    const savings = totalPrice - discountedPrice;

    const bundleWithPrices = {
      ...bundleWithServices.toJSON(),
      originalPrice: totalPrice,
      discountedPrice: discountedPrice,
      savings: savings
    };

    res.status(201).json(bundleWithPrices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateBundle = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const bundle = await ServiceBundle.findByPk(req.params.id);
    if (!bundle) {
      return res.status(404).json({ message: 'Bundle not found' });
    }

    // Check for duplicate name if name is being changed
    if (req.body.name && req.body.name !== bundle.name) {
      const existingBundle = await ServiceBundle.findOne({
        where: { name: req.body.name }
      });

      if (existingBundle) {
        return res.status(400).json({ message: 'Bundle with this name already exists' });
      }
    }

    // Update service associations if provided
    if (req.body.serviceIds && Array.isArray(req.body.serviceIds)) {
      if (req.body.serviceIds.length < 2) {
        return res.status(400).json({ message: 'Bundle must contain at least 2 services' });
      }

      const services = await Service.findAll({
        where: {
          id: req.body.serviceIds,
          isActive: true
        }
      });

      if (services.length !== req.body.serviceIds.length) {
        return res.status(400).json({ message: 'One or more services are invalid or inactive' });
      }

      await bundle.setServices(services);
    }

    await bundle.update(req.body);

    // Fetch updated bundle with services
    const updatedBundle = await ServiceBundle.findByPk(bundle.id, {
      include: [{
        model: Service,
        through: { attributes: [] }
      }]
    });

    // Calculate prices
    const totalPrice = updatedBundle.Services.reduce((sum, service) => sum + Number(service.price), 0);
    const discountedPrice = totalPrice * (1 - updatedBundle.discountPercentage / 100);
    const savings = totalPrice - discountedPrice;

    const bundleWithPrices = {
      ...updatedBundle.toJSON(),
      originalPrice: totalPrice,
      discountedPrice: discountedPrice,
      savings: savings
    };

    res.json(bundleWithPrices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteBundle = async (req, res) => {
  try {
    const bundle = await ServiceBundle.findByPk(req.params.id);
    if (!bundle) {
      return res.status(404).json({ message: 'Bundle not found' });
    }

    await bundle.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
