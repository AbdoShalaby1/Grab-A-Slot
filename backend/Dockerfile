FROM node:20-slim

# Install OpenSSL and CA certificates
RUN apt-get update -y && apt-get install -y openssl ca-certificates

WORKDIR /app

COPY package*.json ./

# Install all dependencies (including devDeps like typescript)
RUN npm install

# Copy prisma schema and generate client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy the rest of the source code
COPY . .

# --- MISSING STEP: BUILD THE PROJECT ---
# This creates the 'dist' folder that your CMD is looking for
RUN npm run build

# Set production environment
ENV NODE_ENV=production
ENV PORT=4000
EXPOSE 4000

# Clean start
# Using 'sh -c' helps ensure both commands run in sequence properly
CMD sh -c "npx prisma migrate deploy && node dist/index.js"
