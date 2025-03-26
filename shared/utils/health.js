import { createClient } from 'redis';
import { Sequelize } from 'sequelize';
import os from 'os';
import logger from './logger/index.js';

export class HealthCheck {
  constructor(config = {}) {
    this.serviceName = config.serviceName || 'unknown';
    this.startTime = Date.now();
    this.dependencies = config.dependencies || [];
    this.version = process.env.npm_package_version || '0.0.0';
    this.redisClient = config.redisUrl ? createClient({ url: config.redisUrl }) : null;
    this.dbConfig = config.dbConfig;
  }

  // Get system metrics
  async getSystemMetrics() {
    const loadAvg = os.loadavg();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const uptime = process.uptime();

    return {
      cpu: {
        loadAvg1: loadAvg[0],
        loadAvg5: loadAvg[1],
        loadAvg15: loadAvg[2]
      },
      memory: {
        total: totalMem,
        free: freeMem,
        used: totalMem - freeMem,
        usagePercent: ((totalMem - freeMem) / totalMem * 100).toFixed(2)
      },
      uptime: {
        system: os.uptime(),
        process: uptime
      }
    };
  }

  // Check database connection
  async checkDatabase() {
    if (!this.dbConfig) return { status: 'skipped' };

    try {
      const sequelize = new Sequelize(this.dbConfig);
      await sequelize.authenticate();
      const result = await sequelize.query('SELECT 1+1 as result');
      await sequelize.close();

      return {
        status: 'healthy',
        latency: result[1].duration,
        message: 'Database connection successful'
      };
    } catch (error) {
      logger.error({ error }, 'Database health check failed');
      return {
        status: 'unhealthy',
        error: error.message
      };
    }
  }

  // Check Redis connection
  async checkRedis() {
    if (!this.redisClient) return { status: 'skipped' };

    try {
      const startTime = Date.now();
      await this.redisClient.ping();
      const latency = Date.now() - startTime;

      return {
        status: 'healthy',
        latency,
        message: 'Redis connection successful'
      };
    } catch (error) {
      logger.error({ error }, 'Redis health check failed');
      return {
        status: 'unhealthy',
        error: error.message
      };
    }
  }

  // Check dependent services
  async checkDependencies() {
    const results = {};
    
    for (const dep of this.dependencies) {
      try {
        const startTime = Date.now();
        const response = await fetch(dep.url + '/health');
        const latency = Date.now() - startTime;
        
        if (!response.ok) throw new Error('HTTP status ' + response.status);
        
        results[dep.name] = {
          status: 'healthy',
          latency,
          message: 'Service responding'
        };
      } catch (error) {
        logger.error({ error, dependency: dep }, 'Dependency health check failed');
        results[dep.name] = {
          status: 'unhealthy',
          error: error.message
        };
      }
    }
    
    return results;
  }

  // Get full health status
  async getFullStatus() {
    const [dbStatus, redisStatus, systemMetrics, depStatus] = await Promise.all([
      this.checkDatabase(),
      this.checkRedis(),
      this.getSystemMetrics(),
      this.checkDependencies()
    ]);

    const status = {
      service: this.serviceName,
      version: this.version,
      timestamp: new Date().toISOString(),
      uptime: Date.now() - this.startTime,
      status: 'healthy',
      checks: {
        database: dbStatus,
        redis: redisStatus,
        system: systemMetrics,
        dependencies: depStatus
      }
    };

    // Determine overall status
    const checks = [dbStatus, redisStatus, ...Object.values(depStatus)];
    if (checks.some(check => check.status === 'unhealthy')) {
      status.status = 'unhealthy';
    }

    return status;
  }

  // Get basic liveness status
  async getLivenessStatus() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString()
    };
  }

  // Get readiness status
  async getReadinessStatus() {
    const [dbStatus, redisStatus] = await Promise.all([
      this.checkDatabase(),
      this.checkRedis()
    ]);

    const isReady = 
      (dbStatus.status === 'healthy' || dbStatus.status === 'skipped') &&
      (redisStatus.status === 'healthy' || redisStatus.status === 'skipped');

    return {
      status: isReady ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      checks: {
        database: dbStatus,
        redis: redisStatus
      }
    };
  }
}
