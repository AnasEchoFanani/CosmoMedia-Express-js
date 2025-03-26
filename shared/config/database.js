import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'cosmomedia_dev',
  process.env.DB_USER || 'cosmomedia',
  process.env.DB_PASSWORD || 'password',
  {
    host: process.env.DB_HOST || 'cosmomedia-mysql',
    dialect: 'mysql',
    dialectOptions: {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci'
    },
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    retry: {
      max: 5,
      timeout: 1000
    }
  }
);

export default sequelize;
