# Next.js 16 con Node 24 (incluye node:sqlite para los usuarios de Auth.js).
FROM node:24-slim
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# URL pública del backend: Next.js la incrusta en el build.
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN npm run build
ENV NODE_ENV=production
# Base de usuarios en un volumen persistente montado en /data.
ENV PIRU_DB_PATH=/data/piru.db
EXPOSE 3000
CMD ["npx", "next", "start"]
