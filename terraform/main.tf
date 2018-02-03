terraform {
  backend "s3" {
    bucket = "pace-tf-state-bucket"
    key = "terraform/pace.tfstate"
    region = "eu-central-1"
  }
}
provider "aws" {
  region = "${var.region}"
}

data "aws_availability_zones" "current" {}
