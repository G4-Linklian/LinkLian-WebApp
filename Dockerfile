# Stage 1: Builder
FROM node:20-alpine AS builder

WORKDIR /app

# เปลี่ยนจาก package-lock.json เป็น yarn.lock
# COPY package.json yarn.lock ./
COPY package.json package-lock.json* yarn.lock* ./

# ใช้ yarn install --frozen-lockfile แทน npm ci 
# เพื่อให้มั่นใจว่าเวอร์ชันของ package ตรงตาม yarn.lock เป๊ะๆ
# RUN yarn install --legacy-peer-deps
RUN npm install --legacy-peer-deps

COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build


# Stage 2: Runner
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=4100

# Next.js standalone output จะรวมไฟล์ที่จำเป็นไว้ให้แล้ว
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 4100

# รันด้วย server.js (สำหรับ standalone mode)
CMD ["node", "server.js"]