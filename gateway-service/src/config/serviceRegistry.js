export const services = {
  employees: {
    url: process.env.EMPLOYEE_SERVICE_URL || 'http://localhost:3001',
    routes: [
      { path: '/api/employees', methods: ['GET', 'POST'] },
      { path: '/api/employees/:id', methods: ['GET', 'PUT', 'DELETE'] }
    ]
  },
  clients: {
    url: process.env.CLIENT_PROJECT_SERVICE_URL || 'http://localhost:3002',
    routes: [
      { path: '/api/clients', methods: ['GET', 'POST'] },
      { path: '/api/clients/:id', methods: ['GET', 'PUT', 'DELETE'] },
      { path: '/api/projects', methods: ['GET', 'POST'] },
      { path: '/api/projects/:id', methods: ['GET', 'PUT', 'DELETE'] },
      { path: '/api/tasks', methods: ['GET', 'POST'] },
      { path: '/api/tasks/:id', methods: ['GET', 'PUT', 'DELETE'] }
    ]
  },
  billing: {
    url: process.env.BILLING_SERVICE_URL || 'http://localhost:3003',
    routes: [
      { path: '/api/invoices', methods: ['GET', 'POST'] },
      { path: '/api/invoices/:id', methods: ['GET', 'PUT', 'DELETE'] },
      { path: '/api/quotes', methods: ['GET', 'POST'] },
      { path: '/api/quotes/:id', methods: ['GET', 'PUT', 'DELETE'] },
      { path: '/api/transactions', methods: ['GET', 'POST'] },
      { path: '/api/transactions/:id', methods: ['GET', 'PUT', 'DELETE'] }
    ]
  },
  services: {
    url: process.env.SERVICE_CATALOG_URL || 'http://localhost:3004',
    routes: [
      { path: '/api/services', methods: ['GET', 'POST'] },
      { path: '/api/services/:id', methods: ['GET', 'PUT', 'DELETE'] }
    ]
  }
};
