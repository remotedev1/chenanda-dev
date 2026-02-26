# Step 1: Use the official Node.js image as the base
FROM node:20-alpine AS base

# Step 2: Set the working directory
WORKDIR /app

# Step 3: Copy package.json and package-lock.json
COPY package*.json ./

# Step 4: Install dependencies and generate Prisma client
RUN npm install

# Step 5: Copy the rest of the application code
COPY . .

# Step 6: Build the Next.js application
RUN npx prisma generate && npm run build

# Step 7: Use a minimal Node.js runtime for production
FROM node:20-alpine AS production

# Set NODE_ENV to production
ENV NODE_ENV=production

# Set the working directory
WORKDIR /app

# Copy .env file to the working directory
COPY .env .env

# Copy necessary files from the base stage
COPY --from=base /app/package*.json  ./
COPY --from=base /app/.next ./.next
COPY --from=base /app/public ./public
COPY --from=base /app/prisma ./prisma
COPY --from=base /app/server.js ./server.js


# Install only production dependencies
RUN npm install --production

# Expose the port the app runs on
EXPOSE 3000

# Start the Next.js server
CMD ["node", "server.js"]
