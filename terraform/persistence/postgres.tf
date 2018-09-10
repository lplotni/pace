resource "aws_db_instance" "postgres" {
  allocated_storage = 10
  engine            = "postgres"
  engine_version    = "10.4"
  instance_class    = "db.t2.micro"
  name              = "pacedb"
  username          = "root"
  password          = "${data.aws_secretsmanager_secret_version.superuser_db_password.secret_string}"
}

resource "aws_db_parameter_group" "postgres_ssl" {
  name   = "postgres-ssl"
  family = "postgres10"

  parameter {
    name  = "rds.force_ssl"
    value = "1"
  }
}

data "aws_secretsmanager_secret" "superuser_db_password" {
  name = "/pace/superuser_db_password"
}

data "aws_secretsmanager_secret_version" "superuser_db_password" {
  secret_id = "${data.aws_secretsmanager_secret.superuser_db_password.id}"
}

output "postgres-ip" {
  value = "${aws_db_instance.postgres.address}"
}
