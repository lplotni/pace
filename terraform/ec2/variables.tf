variable "vpc-id" {}
variable "subnet-id-1" {}
variable "subnet-id-2" {}
variable "security-group-id" {}
variable "ecs-cluster-name" {}
variable "ecs-instance-role-name" {}
variable "ecs-instance-profile-name" {}
variable "ecs-key-pair-name" {}

variable "autoscaling-group-name" {
  default = "pace-ecs-asg"
}

variable "max-instance-size" {
  default = 5
}

variable "min-instance-size" {
  default = 2
}

variable "desired-capacity" {
  default = 3
}

variable "health-check-grace-period" {
  default = 300
}

variable "load-balancer-name" {
  default = "pace-ecs-load-balancer"
}

variable "target-group-name" {
  default = "pace-ecs-target-group"
}

variable "launch-configuration-name" {
  default = "pace-ecs-launch-configuration"
}

variable "image-id" {
  default = "ami-9fc39c74"
}

variable "instance-type" {
  default = "t2.medium"
}
