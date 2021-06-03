FROM node:15

WORKDIR /usr/src/app
COPY package*.json ./
COPY *config.json ./
RUN npm install

CMD [ "node", "index.js" ]