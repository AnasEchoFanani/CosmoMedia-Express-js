FROM cosmomedia-base

# Copy service files
COPY client-project-service/ ./client-project-service/

# Set environment variables
ENV SERVICE_NAME=client-project-service \
    PORT=${CLIENT_PROJECT_SERVICE_PORT}

# Expose port
EXPOSE ${PORT}

# Start service
CMD ["node", "client-project-service/src/app.js"]
