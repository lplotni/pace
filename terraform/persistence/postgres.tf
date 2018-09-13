resource "aws_db_instance" "postgres" {
  allocated_storage      = 10
  engine                 = "postgres"
  engine_version         = "10.4"
  instance_class         = "db.t2.micro"
  name                   = "pacedb"
  username               = "root"
  password               = "${data.aws_secretsmanager_secret_version.superuser_db_password.secret_string}"
  db_subnet_group_name   = "${aws_db_subnet_group.postgres_subnet.id}"
  vpc_security_group_ids = ["${aws_security_group.postgres-security-group.id}"]
}

resource "aws_db_parameter_group" "postgres_ssl" {
  name   = "postgres-ssl"
  family = "postgres10"

  parameter {
    name  = "rds.force_ssl"
    value = "1"
  }
}

resource "aws_security_group" "postgres-security-group" {
  name = "postgres-security-group"

  description = "RDS postgres servers"
  vpc_id      = "${var.vpc-id}"

  # Only postgres in
  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Allow all outbound traffic.
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_db_subnet_group" "postgres_subnet" {
  name       = "pacedb-subnet"
  subnet_ids = ["${var.db-subnet-id-1}", "${var.db-subnet-id-2}"]

  tags {
    Name = "db subnet groups"
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

output "postgres-password" {
  value = "${data.aws_secretsmanager_secret_version.superuser_db_password.secret_string}"
}
