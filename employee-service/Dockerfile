FROM cosmomedia-base

# Copy service files
COPY employee-service/ ./employee-service/

# Set environment variables
ENV SERVICE_NAME=employee-service \
    PORT=${EMPLOYEE_SERVICE_PORT}

# Expose port
EXPOSE ${PORT}

# Start service
CMD ["node", "employee-service/src/app.js"]
