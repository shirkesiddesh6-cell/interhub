FROM node:24-trixie

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5001

CMD ["node", "server-postgres.js"]