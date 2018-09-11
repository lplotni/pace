resource "aws_ecs_task_definition" "ecs-pace-task-definition" {
  family = "pace-task-definition"

  container_definitions = <<EOF
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
    "environment": [{
      "name": "REDISHOST",
      "value": "${var.redis-ip}:6379"
    },
    {
      "name":"DATABASE_URL",
      "value": "postgres://root:${var.postgres-password}@${var.postgres-ip}/pacedb"
    }],
    "portMappings": [{
      "containerPort": 3000,
      "hostPort": 3000
    }],
    "essential": true,
    "command": ["/usr/local/bin/npm", "start"]
  }
]
EOF
}
