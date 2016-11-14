# pace

Pace is a registration and management application for running events and competitions.

[![Build Status](https://travis-ci.org/cz8s/pace.svg?branch=master)](https://travis-ci.org/cz8s/pace)
[![Join the chat at https://gitter.im/lplotni/pace](https://badges.gitter.im/lplotni/pace.svg)](https://gitter.im/lplotni/pace?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

## Features
The list of our issues/features can be found on our [trello board](https://trello.com/b/1gaDEa3O/pace-board).
## Demo
You can check out the latest version of the app on heroku: [https://dev-pace.herokuapp.com/](https://dev-pace.herokuapp.com/)
## Dev Setup
Pace is currently based on [express.js](http://expressjs.com/) and [node](https://nodejs.org), therefore you will need both on your machine. Pace uses [PostgreSQL](https://www.postgresql.org/) to store its data. To get postgresql running on your machine during development we use [docker](https://www.docker.com/). 
* If you don't have docker on you machine, just follow this instructions for a [mac](https://docs.docker.com/engine/installation/mac/), or this for [linux](https://docs.docker.com/engine/installation/linux/).
* To install node, we recommend to use *nvm*. Look [here](https://github.com/creationix/nvm) for instructions. 
* To get all the other dependencies and be able to start **pace** locally, just navigate to the pace folder and run: `npm install`
* To start the database (as a docker container): `gulp start-db`
* To initialize the database: `gulp create-pace-db`
* To install selenium: `gulp selenium-install`


### Pace db in docker container 
You can either run this to get the database up:

`docker run -p 5432:5432 -d --name 'pace-postgres' -e POSTGRES_PASSWORD='pgtester' -e POSTGRES_DB='pace' -e POSTGRES_USER='pgtester' postgres`

or just do `gulp start-database`.

Whenever you start a fresh postgres instance, don't forget to initialize the
pace db - just execute `gulp create-db`.

To look at the db in your terminal, just connect to the postgres container  via `docker exec -it -u postgres pace-postgres psql`. If you use other name for the container (e.g. `gulp start-db` will result in one that is randomly generated), adapt the exec command.
#### Starting
Just run `gulp` and open http://localhost:3000 in your browser.

#### Running tests
For **unit** tests: `gulp test`

For **integration** tests: `gulp test-integration`

For **functional** tests: `gulp test-functional` (install **selenium** if needed: `gulp selenium-install`)

To execute just a single spec, just pass `--single=/path/to/yourSpec.js` as
additional argument.

#### Running jshint
Here you go: `gulp lint`

### Running in docker
Run pace inside docker:
```
docker-compose up 
```
Create the database needed:
```
docker-compose run pace-app /usr/src/app/node_modules/db-migrate/bin/db-migrate up
```

Pace will be reachable on http://localhost:3000


## More info
If you would like to contribute, we have also few blog post explaining our
technical choices and setup:

 * [express
   structure](https://lplotni.github.io/blog/2015/08/04/bootstraping-a-node-dot-js-webapp/)
 * [testing](https://lplotni.github.io/blog/2015/10/10/express-testing/)
