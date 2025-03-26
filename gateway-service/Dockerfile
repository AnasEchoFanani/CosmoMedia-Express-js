FROM cosmomedia-base

# Copy service files
COPY gateway-service/ ./gateway-service/

# Set environment variables
ENV SERVICE_NAME=gateway-service \
    PORT=${GATEWAY_PORT}

# Expose port
EXPOSE ${PORT}

# Start service
CMD ["node", "gateway-service/src/app.js"]
