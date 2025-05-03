FROM node:20-slim

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy project files
COPY . .

# For development, don't build
# RUN npm run build
# Instead, use the start command directly

# Expose port
EXPOSE 3000

CMD ["npm", "start"]