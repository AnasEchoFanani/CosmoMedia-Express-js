import { CloudWatchLogs } from '@aws-sdk/client-cloudwatch-logs';
import env from '../../config/env.js';

export const cloudWatchConfig = {
  region: env.AWS_REGION || 'us-east-1',
  logGroupName: env.LOG_GROUP_NAME || '/cosmomedia/services',
  logStreamPrefix: env.NODE_ENV || 'development',
  batchSize: 10000, // Maximum events per batch
  interval: 1000, // Flush interval in milliseconds
  aws: {
    region: env.AWS_REGION,
    credentials: {
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY
    }
  }
};

export const createCloudWatchTransport = () => {
  const cloudwatch = new CloudWatchLogs(cloudWatchConfig.aws);
  let eventBuffer = [];
  let flushTimeout = null;

  const flush = async () => {
    if (eventBuffer.length === 0) return;

    const events = [...eventBuffer];
    eventBuffer = [];
    clearTimeout(flushTimeout);

    try {
      const logStreamName = `${cloudWatchConfig.logStreamPrefix}-${new Date().toISOString().split('T')[0]}`;
      
      await cloudwatch.putLogEvents({
        logGroupName: cloudWatchConfig.logGroupName,
        logStreamName,
        logEvents: events.map(event => ({
          timestamp: Date.now(),
          message: JSON.stringify(event)
        }))
      });
    } catch (error) {
      console.error('Failed to send logs to CloudWatch:', error);
      // Re-add failed events back to buffer
      eventBuffer = [...events, ...eventBuffer].slice(0, cloudWatchConfig.batchSize);
    }
  };

  return {
    write: (event) => {
      eventBuffer.push(event);
      
      if (eventBuffer.length >= cloudWatchConfig.batchSize) {
        flush();
      } else if (!flushTimeout) {
        flushTimeout = setTimeout(flush, cloudWatchConfig.interval);
      }
    },
    flush
  };
};
