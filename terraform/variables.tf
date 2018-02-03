variable "region" {
  type = "string"
  default = "eu-central-1"
}

variable "vpc_cidr" {
  type = "string"
  default = "172.16.0.0/16"
}

variable "app_name" {
  type = "string"
  default = "pace"
}

variable "ami_id" {
  type = "string"
  default = "ami-5652ce39"
}

variable "instance_type" {
  type = "string"
  default = "t2.micro"
}

