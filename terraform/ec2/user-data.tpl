#!/bin/bash

echo ECS_CLUSTER=${ecs-cluster-name} > /etc/ecs/ecs.config

yum install -y awslogs jq aws-cli
