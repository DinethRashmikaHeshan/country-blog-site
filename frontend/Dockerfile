FROM node:18

WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
EXPOSE 3000
CMD npm run dev

# Use an official Node.js runtime as the base image
#FROM node:18-alpine
#
## Set working directory
#WORKDIR /usr/src/app
#
## Copy package.json and package-lock.json
#COPY package.json ./
#
## Install dependencies
#RUN npm install --legacy-peer-deps
#
## Copy the rest of the application code
#COPY . .
#
## Build the Next.js app with detailed logging
#RUN echo "Starting build..." && \
#    npm run build && \
#    echo "Build completed successfully" || { echo "Build failed"; exit 1; }
#
## Expose the port the app runs on
#EXPOSE 3000
#
## Set the port environment variable for Next.js
#ENV PORT=3000
#
## Command to run the application in production
#CMD ["npm", "start"]