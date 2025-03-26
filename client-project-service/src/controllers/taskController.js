import { validationResult } from 'express-validator';
import Task from '../models/Task.js';
import Project from '../models/Project.js';

export const getAllTasks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const projectId = req.query.projectId;

    const queryOptions = {
      limit,
      offset,
      include: [{ model: Project, attributes: ['id', 'title'] }],
      order: [['createdAt', 'DESC']]
    };

    if (projectId) {
      queryOptions.where = { projectId };
    }

    const { count, rows } = await Task.findAndCountAll(queryOptions);

    res.json({
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      tasks: rows
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTaskById = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id, {
      include: [{ model: Project, attributes: ['id', 'title'] }]
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createTask = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Verify project exists
    const project = await Project.findByPk(req.body.projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const task = await Task.create(req.body);
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const task = await Task.findByPk(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (req.body.projectId) {
      const project = await Project.findByPk(req.body.projectId);
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
    }

    await task.update(req.body);
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await task.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
