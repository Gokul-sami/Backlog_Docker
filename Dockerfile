# Use Node.js as base image
FROM node:20

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (if exists)
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Expose port (change if needed)
EXPOSE 3000

# Start the app
CMD ["node", "server.js"]
