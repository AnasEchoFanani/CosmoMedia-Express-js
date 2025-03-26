FROM cosmomedia-base

# Copy service files
COPY service-catalog/ ./service-catalog/

# Set environment variables
ENV SERVICE_NAME=service-catalog \
    PORT=${SERVICE_CATALOG_PORT}

# Expose port
EXPOSE ${PORT}

# Start service
CMD ["node", "service-catalog/src/app.js"]
