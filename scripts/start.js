import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import env from '../shared/config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..');

const services = [
  {
    name: 'Gateway Service',
    script: 'gateway-service/src/app.js',
    order: 1
  },
  {
    name: 'Employee Service',
    script: 'employee-service/src/app.js',
    order: 2
  },
  {
    name: 'Client & Project Service',
    script: 'client-project-service/src/app.js',
    order: 3
  },
  {
    name: 'Billing Service',
    script: 'billing-service/src/app.js',
    order: 4
  },
  {
    name: 'Service Catalog',
    script: 'service-catalog/src/app.js',
    order: 5
  }
];

const startService = (service) => {
  console.log(`Starting ${service.name}...`);
  
  const process = spawn('node', [join(ROOT_DIR, service.script)], {
    stdio: 'pipe',
    env: {
      ...process.env,
      NODE_ENV: env.NODE_ENV
    }
  });

  process.stdout.on('data', (data) => {
    console.log(`[${service.name}] ${data.toString().trim()}`);
  });

  process.stderr.on('data', (data) => {
    console.error(`[${service.name}] Error: ${data.toString().trim()}`);
  });

  process.on('close', (code) => {
    if (code !== 0) {
      console.error(`${service.name} exited with code ${code}`);
    }
  });

  return process;
};

// Sort services by order and start them
const sortedServices = [...services].sort((a, b) => a.order - b.order);
const processes = sortedServices.map(startService);

// Handle shutdown
const shutdown = () => {
  console.log('\nShutting down all services...');
  processes.forEach((process) => {
    process.kill();
  });
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
