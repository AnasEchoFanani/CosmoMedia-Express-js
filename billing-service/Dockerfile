FROM cosmomedia-base

# Copy service files
COPY billing-service/ ./billing-service/

# Set environment variables
ENV SERVICE_NAME=billing-service \
    PORT=${BILLING_SERVICE_PORT}

# Expose port
EXPOSE ${PORT}

# Start service
CMD ["node", "billing-service/src/app.js"]
