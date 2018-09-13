[{
  "name": "pace",
  "image": "lplotni/pace-app",
  "cpu": 1024,
  "memory": 512,
  "logConfiguration": {
    "logDriver": "awslogs",
    "options": {
      "awslogs-region": "eu-central-1",
      "awslogs-create-group": "true",
      "awslogs-group": "pace-logs"
    }
  },
  "mountPoints": [
    {
      "sourceVolume": "pace-config",
      "containerPath": "/usr/src/app/config/"
    }
  ],
  "environment": [{
    "name": "REDISHOST",
    "value": "${redis-ip}:6379"
  },
    {
      "name":"NODE_ENV",
      "value": "production"
    },
    {
      "name":"DATABASE_URL",
      "value": "postgres://root:${postgres-password}@${postgres-ip}/pacedb"
    }],
  "portMappings": [{
    "containerPort": 3000,
    "hostPort": 3000
  }],
  "essential": true,
  "command": ["/bin/sh","-c","/usr/local/bin/node ./node_modules/db-migrate/bin/db-migrate up -e prod;/usr/local/bin/npm start"]
}
]
