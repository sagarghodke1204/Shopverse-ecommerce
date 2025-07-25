# Docker Setup for E-Commerce Website

This document provides instructions for running the e-commerce application using Docker.

## Prerequisites

- Docker installed on your system
- Docker Compose installed on your system

## Quick Start

### Option 1: Using Docker Compose (Recommended)

1. *Build and run the entire stack:*
   bash
   docker-compose up --build
   

2. *Run in background:*
   bash
   docker-compose up -d --build
   

3. *Stop the services:*
   bash
   docker-compose down
   

### Option 2: Using Docker directly

1. *Build the application:*
   bash
   docker build -t ecommerce-app .
   

2. *Run the application:*
   bash
   docker run -p 8087:8087 --name ecommerce-app ecommerce-app
   

## Services

### Application
- *Port:* 8087
- *URL:* http://localhost:8087
- *Health Check:* http://localhost:8087/actuator/health

### MySQL Database
- *Port:* 3306
- *Database:* e_commerce_db
- *Username:* root
- *Password:* Sagar@321

## Environment Variables

The application uses the following environment variables:

- SPRING_DATASOURCE_URL: Database connection URL
- SPRING_DATASOURCE_USERNAME: Database username
- SPRING_DATASOURCE_PASSWORD: Database password
- SPRING_JPA_HIBERNATE_DDL_AUTO: Hibernate DDL mode
- SERVER_PORT: Application port

## Production Deployment

For production deployment, use the production Dockerfile:

bash
# Build production image
docker build -f Dockerfile.prod -t ecommerce-app:prod .

# Run production container
docker run -p 8087:8087 --name ecommerce-app-prod ecommerce-app:prod


## Useful Commands

### View logs
bash
# All services
docker-compose logs

# Specific service
docker-compose logs app
docker-compose logs mysql


### Access database
bash
docker-compose exec mysql mysql -u root -p


### Access application container
bash
docker-compose exec app sh


### Clean up
bash
# Stop and remove containers, networks
docker-compose down

# Also remove volumes
docker-compose down -v

# Remove all unused containers, networks, images
docker system prune -a


## Troubleshooting

### Port conflicts
If port 8087 is already in use, modify the port mapping in docker-compose.yml:
yaml
ports:
  - "8088:8087"  # Change 8088 to any available port


### Database connection issues
1. Ensure MySQL container is healthy:
   bash
   docker-compose ps
   

2. Check MySQL logs:
   bash
   docker-compose logs mysql
   

### Application startup issues
1. Check application logs:
   bash
   docker-compose logs app
   

2. Verify environment variables:
   bash
   docker-compose exec app env
   

## Security Notes

- The application runs as a non-root user for security
- Database credentials are set in environment variables
- Consider using Docker secrets for production deployments
- Regularly update base images for security patches