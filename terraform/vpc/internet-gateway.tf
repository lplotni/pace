resource "aws_internet_gateway" "pace-vpc-internet-gateway" {
  vpc_id = "${aws_vpc.pace-vpc.id}"

  tags {
    Name = "pace-vpc-internet-gateway"
  }
}
