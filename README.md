# pace
Pace is a registration and management application for running events and competitions.

[![Build Status](https://snap-ci.com/lplotni/pace/branch/master/build_image)](https://snap-ci.com/lplotni/pace/branch/master)

## Features
The list of our issues/features can be found on our [trello board](https://trello.com/b/1gaDEa3O/pace-board).

## Dev Setup
Pace is currently based on [express.js](http://expressjs.com/) and [node](https://nodejs.org), therefore you will need both on
your machine. To install node, go either to https://nodejs.org/ or if you are using a mac & brew use the following cmd: `brew install node`. To get all the other dependencies and be able to start **pace** locally, just navigate to the pace folder and run `npm install`

#### Starting
Just run `gulp` and open http://localhost:3000 in your browser.

#### Running tests
Just this: `gulp test`

#### Running jshint
Here you go: `gulp lint`

## Demo
You can check out the latest version of the app on heroku: [https://dev-pace.herokuapp.com/](https://dev-pace.herokuapp.com/)
