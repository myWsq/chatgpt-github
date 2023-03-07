
FROM node:alpine
RUN mkdir -p /usr/src
WORKDIR /usr/src
COPY . /usr/src
RUN npm install && npm build
EXPOSE 3000
CMD npm run preview -- --port 3000 --host 0.0.0.0
