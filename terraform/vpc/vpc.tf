resource "aws_vpc" "pace-vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = "true"

  tags {
    Name = "pace-vpc"
  }
}

output "id" {
  value = "${aws_vpc.pace-vpc.id}"
}
