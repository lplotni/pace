resource "aws_db_instance" "postgres" {
  allocated_storage = 10
  engine            = "postgres"
  instance_class    = "db.t2.micro"
  name              = "pacedb"
  username          = "root"
  password          = "${data.aws_secretsmanager_secret_version.superuser_db_password.secret_string}"
}

data "aws_secretsmanager_secret" "superuser_db_password" {
  name = "/pace/superuser_db_password"
}

data "aws_secretsmanager_secret_version" "superuser_db_password" {
  secret_id = "${data.aws_secretsmanager_secret.superuser_db_password.id}"
}
