FROM node:15

WORKDIR /usr/src/
COPY package.json yarn.lock ./
# RUN yarn add

COPY . . 
EXPOSE 6969:6969
CMD [ "yarn", "node", ".", "-d" ]