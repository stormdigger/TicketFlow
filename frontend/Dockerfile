# Use an official Node runtime as a parent image
FROM node:20-alpine

# Set work directory
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy project files
COPY . .

# Expose the port Vite runs on
EXPOSE 5173

# Start the app
CMD ["npm", "run", "dev", "--", "--host"]