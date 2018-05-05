provider "aws" {
  region  = "eu-central-1"
  profile = "pace_new"
  version = "1.17.0"
}

module "iam" {
  source = "./iam"
}

module "vpc" {
  source = "./vpc"
}

module "s3" {
  source = "./s3"
}

module "ec2" {
  source = "./ec2"

  vpc-id                    = "${module.vpc.id}"
  security-group-id         = "${module.vpc.security-group-id}"
  subnet-id-1               = "${module.vpc.subnet1-id}"
  subnet-id-2               = "${module.vpc.subnet2-id}"
  ecs-instance-role-name    = "${module.iam.ecs-instance-role-name}"
  ecs-instance-profile-name = "${module.iam.ecs-instance-profile-name}"
  ecs-cluster-name          = "${var.ecs-cluster-name}"
  ecs-key-pair-name         = "${var.ecs-key-pair-name}"
}

module "ecs" {
  source = "./ecs"

  ecs-cluster-name       = "${var.ecs-cluster-name}"
  ecs-load-balancer-name = "${module.ec2.ecs-load-balancer-name}"
  ecs-target-group-arn   = "${module.ec2.ecs-target-group-arn}"
  ecs-service-role-arn   = "${module.iam.ecs-service-role-arn}"
}

resource "aws_dynamodb_table" "dynamodb-terraform-state-lock" {
  name           = "terraform-state-lock-dynamo"
  hash_key       = "LockID"
  read_capacity  = 20
  write_capacity = 20

  attribute {
    name = "LockID"
    type = "S"
  }

  tags {
    Name = "DynamoDB Terraform State Lock Table"
  }
}

terraform {
  backend "s3" {
    encrypt        = true
    profile        = "pace_new"
    bucket         = "pace-remote-state-s3"
    region         = "eu-central-1"
    dynamodb_table = "terraform-state-lock-dynamo"
    key            = "terraform.tfstate"
  }
}
