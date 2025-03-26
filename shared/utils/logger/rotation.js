import { createStream } from 'rotating-file-stream';
import path from 'path';
import fs from 'fs';

export const setupLogRotation = (logPath, options = {}) => {
  const defaultOptions = {
    size: '10M',          // Rotate when size exceeds 10MB
    interval: '1d',       // Also rotate daily
    compress: 'gzip',     // Compress rotated files
    maxFiles: 14,         // Keep 2 weeks of logs
    maxSize: '500M'       // Maximum size of all rotated files combined
  };

  const finalOptions = { ...defaultOptions, ...options };

  // Ensure log directory exists
  const logDir = path.dirname(logPath);
  fs.mkdirSync(logDir, { recursive: true });

  // Create filename generator function
  const generator = (time, index) => {
    if (!time) return path.basename(logPath);

    const date = new Date(time);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');

    const basename = path.basename(logPath, '.log');
    return `${basename}.${date.getFullYear()}${month}${day}-${hour}${minute}-${index}.log`;
  };

  // Create rotating write stream
  return createStream(generator, {
    ...finalOptions,
    path: logDir
  });
};

// Setup rotation for different environments
export const setupEnvironmentRotation = (env) => {
  const rotationConfig = {
    development: {
      size: '5M',
      interval: '1d',
      maxFiles: 7
    },
    test: {
      size: '5M',
      interval: '1d',
      maxFiles: 3
    },
    staging: {
      size: '20M',
      interval: '1d',
      maxFiles: 14
    },
    production: {
      size: '50M',
      interval: '1d',
      maxFiles: 30,
      maxSize: '1G'
    }
  };

  const config = rotationConfig[env] || rotationConfig.development;
  
  // Setup combined logs
  const combinedStream = setupLogRotation(
    `./logs/${env}/combined.log`,
    config
  );

  // Setup error logs
  const errorStream = setupLogRotation(
    `./logs/${env}/error.log`,
    {
      ...config,
      size: config.size * 2  // Error logs can be larger
    }
  );

  return {
    combined: combinedStream,
    error: errorStream
  };
};
