import { validationResult } from 'express-validator';
import ServiceBundle from '../models/ServiceBundle.js';
import { Service } from '../models/Service.js';
import { Op } from 'sequelize';

export const getAllBundles = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const isActive = req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined;

    const whereClause = {};
    if (isActive !== undefined) whereClause.isActive = isActive;

    const { count, rows } = await ServiceBundle.findAndCountAll({
      limit,
      offset,
      where: whereClause,
      include: [{ model: Service, through: { attributes: [] }, attributes: ['id', 'name', 'price', 'category'] }],
      order: [['createdAt', 'DESC']],
    });

    const bundlesWithPrices = rows.map(bundle => {
      const totalPrice = bundle.Services.reduce((sum, service) => sum + Number(service.price || 0), 0);
      const discount = bundle.discountPercentage || 0;
      const discountedPrice = totalPrice * (1 - discount / 100);
      return { ...bundle.toJSON(), originalPrice: totalPrice, discountedPrice, savings: totalPrice - discountedPrice };
    });

    res.json({ total: count, totalPages: Math.ceil(count / limit), currentPage: page, bundles: bundlesWithPrices });
  } catch (error) {
    next(error); // Delegates to an error-handling middleware
  }
};

export const getBundleById = async (req, res, next) => {
  try {
    const bundle = await ServiceBundle.findByPk(req.params.id, {
      include: [{ model: Service, through: { attributes: [] } }],
    });

    if (!bundle) return res.status(404).json({ message: 'Bundle not found' });

    const totalPrice = bundle.Services.reduce((sum, service) => sum + Number(service.price || 0), 0);
    const discount = bundle.discountPercentage || 0;
    const discountedPrice = totalPrice * (1 - discount / 100);

    res.json({ ...bundle.toJSON(), originalPrice: totalPrice, discountedPrice, savings: totalPrice - discountedPrice });
  } catch (error) {
    next(error);
  }
};

export const createBundle = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, serviceIds, discountPercentage } = req.body;

    const existingBundle = await ServiceBundle.findOne({ where: { name } });
    if (existingBundle) return res.status(400).json({ message: 'Bundle with this name already exists' });

    if (!Array.isArray(serviceIds) || serviceIds.length < 2) {
      return res.status(400).json({ message: 'Bundle must contain at least 2 services' });
    }

    const services = await Service.findAll({ where: { id: serviceIds, isActive: true } });
    if (services.length !== serviceIds.length) return res.status(400).json({ message: 'Invalid or inactive services' });

    const bundle = await ServiceBundle.create({ name, discountPercentage: discountPercentage || 0 });
    await bundle.setServices(services);

    res.status(201).json(await getBundleWithPrices(bundle.id));
  } catch (error) {
    next(error);
  }
};

export const updateBundle = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const bundle = await ServiceBundle.findByPk(req.params.id);
    if (!bundle) return res.status(404).json({ message: 'Bundle not found' });

    const { name, serviceIds, discountPercentage } = req.body;

    if (name && name !== bundle.name) {
      const existingBundle = await ServiceBundle.findOne({ where: { name } });
      if (existingBundle) return res.status(400).json({ message: 'Bundle with this name already exists' });
    }

    if (serviceIds && Array.isArray(serviceIds)) {
      if (serviceIds.length < 2) return res.status(400).json({ message: 'Bundle must contain at least 2 services' });

      const services = await Service.findAll({ where: { id: serviceIds, isActive: true } });
      if (services.length !== serviceIds.length) return res.status(400).json({ message: 'Invalid or inactive services' });

      await bundle.setServices(services);
    }

    await bundle.update({ name, discountPercentage: discountPercentage || bundle.discountPercentage });

    res.json(await getBundleWithPrices(bundle.id));
  } catch (error) {
    next(error);
  }
};

export const deleteBundle = async (req, res, next) => {
  try {
    const bundle = await ServiceBundle.findByPk(req.params.id);
    if (!bundle) return res.status(404).json({ message: 'Bundle not found' });

    await bundle.destroy();
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

const getBundleWithPrices = async (id) => {
  const bundle = await ServiceBundle.findByPk(id, {
    include: [{ model: Service, through: { attributes: [] } }],
  });

  if (!bundle) return null;

  const totalPrice = bundle.Services.reduce((sum, service) => sum + Number(service.price || 0), 0);
  const discount = bundle.discountPercentage || 0;
  const discountedPrice = totalPrice * (1 - discount / 100);

  return { ...bundle.toJSON(), originalPrice: totalPrice, discountedPrice, savings: totalPrice - discountedPrice };
};
