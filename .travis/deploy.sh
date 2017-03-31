#!/bin/bash

set -e # Abort script at first error
set -u # Disallow unset variables

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

  scp -i do_deploy docker-compose-do.yml root@46.101.192.146:/tmp/
  ssh -i do_deploy root@46.101.192.146 "docker-compose -f /tmp/docker-compose-do.yml restart"
fi
