import { validationResult } from 'express-validator';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import Client from '../models/Client.js';

export const getAllProjects = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await Project.findAndCountAll({
      limit,
      offset,
      include: [
        { model: Client, attributes: ['id', 'fullName', 'companyName'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      projects: rows
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id, {
      include: [
        { model: Client, attributes: ['id', 'fullName', 'companyName'] },
        { model: Task }
      ]
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createProject = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Verify client exists
    const client = await Client.findByPk(req.body.clientId);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    const project = await Project.create(req.body);
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProject = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const project = await Project.findByPk(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (req.body.clientId) {
      const client = await Client.findByPk(req.body.clientId);
      if (!client) {
        return res.status(404).json({ message: 'Client not found' });
      }
    }

    await project.update(req.body);
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    await project.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
