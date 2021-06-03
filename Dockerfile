FROM node:15

WORKDIR /usr/src/app
COPY package*.json ./
COPY *config.json ./
RUN npm install

COPY . .
CMD [ "node", "index.js" ]