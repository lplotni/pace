resource "aws_batch_job_definition" "migrate-db" {
  name = "pace_migrate_db"
  type = "container"
  container_properties = <<CONTAINER_PROPERTIES
{
    "command": ["./node_modules/db-migrate/bin/db-migrate", "-e ci up"],
    "image": "lplotni/pace-app",
    "memory": 512,
    "vcpus": 1,
    "environment": [
        {"name": "DATABASE_URL", "value": "postgres://pgtester:${data.aws_kms_secret.db.postgres_password}@db/pace"}
    ]
}
CONTAINER_PROPERTIES
}

resource "aws_batch_compute_environment" "migrate-db-batch-env" {
  compute_environment_name = "migrate_db_env"
  compute_resources {
    instance_role = "${var.ecs-instance-role-arn}"
    instance_type = [
      "t2.micro",
    ]
    max_vcpus = 1
    min_vcpus = 0
    security_group_ids = [
      "${var.security-group-id}"
    ]
    subnets = [
      "${var.subnet-id-1}","${var.subnet-id-2}"
    ]
    type = "EC2"
  }
  service_role = "${var.ecs-service-role-arn}"
  type = "MANAGED"
  depends_on = ["aws_iam_role_policy_attachment.aws_batch_service_role"]
}

resource "aws_batch_job_queue" "migration_queue" {
  name = "db_migration_queue"
  state = "ENABLED"
  priority = 1
  compute_environments = ["${aws_batch_compute_environment.migrate-db-batch-env.arn}"]
}

