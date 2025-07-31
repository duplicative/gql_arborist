# Use an official Node.js runtime as a parent image
FROM node:20

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json before other files
# This allows for leveraging Docker cache to save layers when dependencies don't change
COPY package*.json ./

# Install dependencies
RUN npm install

# Set build-time environment variable
ENV DOCKER_BUILD=true

# Copy the rest of the application code
COPY . .

# Build the app
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Run the app
CMD ["npm", "run", "dev"]
