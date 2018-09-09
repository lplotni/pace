resource "aws_db_instance" "postgres" {
  allocated_storage    = 10
  engine               = "postgres"
  instance_class       = "db.t2.micro"
  name                 = "pacedb"
  username             = "root"
  password             = "i will not write this here ..."
}
