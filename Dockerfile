FROM node:15

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install

COPY . . 
EXPOSE 6969:6969
CMD [ "node", "index.js" ]