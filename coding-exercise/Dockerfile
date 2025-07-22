# Use an official Node.js runtime as a base image
FROM node:22-alpine

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies using yarn
COPY package.json yarn.lock ./
RUN yarn install

# Copy rest of the files
COPY . .

# Build the app using yarn
RUN yarn build

# Expose the app port
EXPOSE 3000

# Start the app
CMD ["node", "dist/main"]
