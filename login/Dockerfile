FROM node:10

WORKDIR /src

COPY package.json ./

RUN npm install

COPY ./ ./

CMD node index.js

EXPOSE 3000
