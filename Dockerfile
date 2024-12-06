# Stage 1: Build the React frontend
FROM node:18 AS frontend-build

# Set working directory for the frontend
WORKDIR /app/frontend

# Copy the frontend package files
COPY frontend/package*.json ./

# Install frontend dependencies
RUN npm install

# Copy the frontend source code
COPY frontend/ .

# Build the React app for production
RUN npm run build


# Stage 2: Set up the Node.js backend
FROM node:18 AS backend

# Set working directory for the backend
WORKDIR /app/backend

# Copy the backend package files
COPY backend/package*.json ./

# Install backend dependencies
RUN npm install

# Copy the backend source code
COPY backend/ .

# Copy the built frontend files to the backend's public directory
COPY --from=frontend-build /app/frontend/build /app/backend/public

# Expose the port your backend listens on (e.g., 5001)
EXPOSE 5001

# Start the backend server (Make sure the entry point is correct)
CMD ["node", "server.js"]
