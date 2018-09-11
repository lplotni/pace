variable "ecs-target-group-arn" {}

variable "ecs-cluster-name" {
  default = "pace-ecs-cluster"
}

variable "ecs-service-role-arn" {
  default = "pace-ecs-cluster"
}

variable "ecs-service-name" {
  default = "pace-ecs-service"
}

variable "ecs-load-balancer-name" {
  default = "pace-ecs-load-balancer"
}

variable "container-port" {
  default = 3000
}

variable "container-name" {
  default = "pace"
}

variable "redis-ip" {
  default = "redis"
}

variable "postgres-ip" {
  default = "postgres"
}
