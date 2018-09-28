variable "pace-target-group-arn" {}
variable "pdf-target-group-arn" {}

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

variable "pace-container-port" {
  default = 3000
}

variable "pdf-container-port" {
  default = 3001
}

variable "pace-container-name" {
  default = "pace"
}

variable "pdf-container-name" {
  default = "pace-pdf"
}
variable "redis-ip" {
  default = "redis"
}

variable "postgres-ip" {
  default = "postgres"
}

variable "postgres-password" {}
