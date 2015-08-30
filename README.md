# pace
Pace is a registration and management application for running events and competitions.

[![Build Status](https://snap-ci.com/lplotni/pace/branch/master/build_image)](https://snap-ci.com/lplotni/pace/branch/master)

## Features
The list of our issues/features can be found on our [trello board](https://trello.com/b/1gaDEa3O/pace-board).

## Dev Setup
Pace is currently based on [express.js](http://expressjs.com/) and [node](https://nodejs.org), therefore you will need both on
your machine. To install node, go either to https://nodejs.org/ or if you are using a mac & brew use the following cmd: `brew install node`. To get all the other dependencies and be able to start **pace** locally, just navigate to the pace folder and run `npm install`

#### Setting up the local PostgreSQL
In the `postgres` directory you will find a vagrant file defining the box which
contains the db, one can use for the dev setup. It requires **Vagrant** to be
present on your machine, for more information about the installation process go [here](https://www.vagrantup.com/). Or if you have **brew cask** on your machine, just do the following: `brew cask install vagrant`.

To create the **Participants** table in your db, just run `gulp create-db`
To look at the db in your terminal, just connect to the vagrant box (from the postgres directory) via `vagrant ssh` and type psql.

#### Starting
Just run `gulp` and open http://localhost:3000 in your browser.

#### Running tests
For **unit** tests: `gulp test`

For **integration** tests: `gulp create-db test-integration` (and if your dev DB is already set up: `gulp test-integration`):   

For **functional** tests: `gulp expresss test-functional` (and if the app is already running: `gulp test-functional`):   

#### Running jshint
Here you go: `gulp lint`

## Demo
You can check out the latest version of the app on heroku: [https://dev-pace.herokuapp.com/](https://dev-pace.herokuapp.com/)
