[{
  "name": "pace-pdf",
  "image": "lplotni/pace-pdf",
  "cpu": 1024,
  "memory": 512,
  "logConfiguration": {
    "logDriver": "awslogs",
    "options": {
      "awslogs-region": "eu-central-1",
      "awslogs-create-group": "true",
      "awslogs-group": "pace-pdf-logs"
    }
  },
  "environment": [{
    "name": "REDISHOST",
    "value": "${redis-ip}"
  },
    {
      "name":"NODE_ENV",
      "value": "production"
    }],
  "portMappings": [{
    "containerPort": 3001,
    "hostPort": 3001
  }],
  "essential": true,
  "command": ["/usr/local/bin/npm", "start"]
}]
