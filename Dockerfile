FROM node:20-bookworm

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npx prisma generate

EXPOSE 3000 3001

CMD ["sh", "-c", "npx prisma db push && npx tsx prisma/seed/index.ts && npm run start"]
