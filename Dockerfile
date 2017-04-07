FROM node:7
# replace this with your application's default port
EXPOSE 3000
ENV NPM_CONFIG_LOGLEVEL warn
COPY ./package.json /usr/src/app/
RUN npm install && npm cache clean
COPY . /usr/src/app

CMD [ "npm", "start" ]
CMD ["/usr/src/app/node_modules/gulp/bin/gulp.js"]
