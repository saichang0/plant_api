# Use official Node.js image
FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy rest of the code
COPY . .

# Build TypeScript
RUN npm run build

# Expose the app port
EXPOSE 5000

# Run the app
CMD ["node", "dist/server.js"]
