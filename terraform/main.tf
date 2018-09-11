provider "aws" {
  region = "eu-central-1"
}

module "iam" {
  source = "./iam"
}

module "vpc" {
  source = "./vpc"
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
  ecs-instance-role-arn     = "${module.iam.ecs-instance-role-arn}"
  ecs-service-role-arn      = "${module.iam.ecs-service-role-arn}"
  cert-arn                  = "${module.domain.cert-arn}"
}

module "ecs" {
  source = "./ecs"

  ecs-cluster-name       = "${var.ecs-cluster-name}"
  ecs-load-balancer-name = "${module.ec2.ecs-load-balancer-name}"
  ecs-target-group-arn   = "${module.ec2.ecs-target-group-arn}"
  ecs-service-role-arn   = "${module.iam.ecs-service-role-arn}"
  redis-ip               = "${module.persistence.redis-ip}"
  postgres-ip            = "${module.persistence.postgres-ip}"
  postgres-password = "${module.persistence.postgres-password}"
}

module "domain" {
  source = "./domain"

  domain_name        = "${var.domain_name}"
  load-balancer-name = "${module.ec2.ecs-load-balancer-dns-name}"
}

module "persistence" {
  source            = "./persistence"
  redis-subnet-id   = "${module.vpc.redis-subnet-id}"
  db-subnet-id-1    = "${module.vpc.db-subnet-id-1}"
  db-subnet-id-2    = "${module.vpc.db-subnet-id-2}"
  app_name          = "${var.app_name}"
  security-group-id = "${module.vpc.security-group-id}"
  vpc-id            = "${module.vpc.id}"
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
    bucket         = "pace-s3-state-bucket"
    region         = "eu-central-1"
    dynamodb_table = "terraform-state-lock-dynamo"
    key            = "terraform.tfstate"
  }
}
