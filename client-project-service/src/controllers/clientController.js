import { validationResult } from 'express-validator';
import Client from '../models/Client.js';
import Project from '../models/Project.js';

export const getAllClients = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await Client.findAndCountAll({
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      clients: rows
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getClientById = async (req, res) => {
  try {
    const client = await Client.findByPk(req.params.id, {
      include: [{ model: Project }]
    });
    
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    
    res.json(client);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createClient = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const client = await Client.create(req.body);
    res.status(201).json(client);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateClient = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const client = await Client.findByPk(req.params.id);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    await client.update(req.body);
    res.json(client);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteClient = async (req, res) => {
  try {
    const client = await Client.findByPk(req.params.id);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    await client.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
