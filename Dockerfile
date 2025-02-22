# Use an official Node.js image
FROM node:20

# Set the working directory inside the container
WORKDIR /app

# Copy package files and install dependencies
RUN npm install

# Copy the rest of the application files
COPY package.json ./

# Expose the port your app runs on
EXPOSE 5000

# Command to start the server
CMD ["node", "server.js"]
