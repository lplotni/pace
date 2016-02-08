FROM node:4-onbuild
# replace this with your application's default port
EXPOSE 3000
CMD ["/usr/src/app/node_modules/gulp/bin/gulp.js"]
