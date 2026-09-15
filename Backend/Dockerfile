FROM node:24-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

EXPOSE 3001
EXPOSE 3002

CMD ["node", "dist/apps/api/main.js"]