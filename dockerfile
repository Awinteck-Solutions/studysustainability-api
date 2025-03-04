# Use the official MySQL image from Docker Hub
FROM mysql:8.0

# Set environment variables for the MySQL root user and database
ENV MYSQL_ROOT_PASSWORD=root
ENV MYSQL_DATABASE=Template
ENV MYSQL_USER=root
ENV MYSQL_PASSWORD=root

# Expose the default MySQL port
EXPOSE 3306

# Optional: Copy custom initialization scripts
# Place your SQL scripts in a folder named "docker-entrypoint-initdb.d"
# Uncomment the below line if you have custom initialization scripts
# COPY ./docker-entrypoint-initdb.d /docker-entrypoint-initdb.d

# Run the MySQL server
CMD ["mysqld"]
