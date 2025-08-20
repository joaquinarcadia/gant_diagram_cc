# Use the latest LTS version of Node.js
FROM node:lts-alpine AS build
 
# Set the working directory inside the container
WORKDIR /app
 
# Copy package.json and package-lock.json
COPY package*.json ./
 
# Install dependencies
RUN npm ci

# Install serve globally to serve the build
RUN npm install -g serve
 
# Copy the rest of your application files
COPY . .

# Build the Vite project
RUN npm run build

# Expose the port your app runs on
EXPOSE 3000
 
# Serve the built app
CMD ["serve", "-s", "dist", "-l", "3000"]