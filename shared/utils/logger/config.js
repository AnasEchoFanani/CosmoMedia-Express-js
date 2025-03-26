const getLevelIcon = (level) => {
  switch (level) {
    case 'trace': return '🔍';
    case 'debug': return '🐛';
    case 'info': return 'ℹ️';
    case 'warn': return '⚠️';
    case 'error': return '❌';
    case 'fatal': return '💀';
    default: return '📝';
  }
};

export const logConfig = {
  development: {
    level: 'debug',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        levelFirst: true,
        translateTime: 'yyyy-mm-dd HH:MM:ss.l',
        ignore: 'pid,hostname'
      }
    }
  },

  test: {
    level: 'debug',
    transport: {
      target: 'pino/file',
      options: { 
        destination: './logs/test.log',
        mkdir: true
      }
    }
  },

  staging: {
    level: 'info',
    transport: {
      targets: [
        {
          target: 'pino/file',
          options: {
            destination: './logs/staging-combined.log',
            mkdir: true
          },
          level: 'info'
        },
        {
          target: 'pino/file',
          options: {
            destination: './logs/staging-error.log',
            mkdir: true
          },
          level: 'error'
        },
        {
          target: 'pino-cloudwatch',
          options: {
            group: 'cosmomedia-staging',
            aws: {
              region: process.env.AWS_REGION
            },
            formatLogItem: (item) => ({
              ...item,
              timestamp: new Date().toISOString()
            })
          }
        }
      ]
    }
  },

  production: {
    level: 'info',
    transport: {
      targets: [
        {
          target: 'pino/file',
          options: {
            destination: './logs/production-combined.log',
            mkdir: true
          },
          level: 'info'
        },
        {
          target: 'pino/file',
          options: {
            destination: './logs/production-error.log',
            mkdir: true
          },
          level: 'error'
        },
        {
          target: 'pino-cloudwatch',
          options: {
            group: 'cosmomedia-production',
            aws: {
              region: process.env.AWS_REGION
            },
            formatLogItem: (item) => ({
              ...item,
              timestamp: new Date().toISOString()
            })
          }
        }
      ]
    },
    formatters: {
      level: (label) => ({ level: label.toUpperCase() })
    }
  }
};
