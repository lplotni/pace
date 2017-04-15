#!/bin/bash

set -e # Abort script at first error
set -u # Disallow unset variables

function do_ssh() {
  ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -i do_deploy root@207.154.246.48 "$1"
}

# Only run when not part of a pull request and on the master branch
if [ $TRAVIS_BRANCH = "master" ]
then
  docker login -u="$DOCKER_USERNAME" -p="$DOCKER_PASSWORD"
  docker tag pace_pace-app lplotni/pace-app:latest
  docker tag pace_pace-app lplotni/pace-app:$TRAVIS_COMMIT
  docker push lplotni/pace-app
  docker tag pace_pace-pdf lplotni/pace-pdf:latest
  docker tag pace_pace-pdf lplotni/pace-pdf:$TRAVIS_COMMIT
  docker push lplotni/pace-pdf

  scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -i do_deploy docker-compose-do.yml root@207.154.246.48:/tmp/
  do_ssh "cd /tmp; docker-compose -f docker-compose-do.yml pull && docker-compose -f docker-compose-do.yml up -d"
  do_ssh "docker exec -ti tmp_pace-app_1 '/bin/bash' -c './node_modules/db-migrate/bin/db-migrate up'"
fi
