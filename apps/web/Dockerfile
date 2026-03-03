FROM node:20-alpine

RUN apk add --no-cache tzdata

WORKDIR /app

COPY ./package*.json ./

RUN ls -la && npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]