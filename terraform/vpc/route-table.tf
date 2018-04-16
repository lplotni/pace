resource "aws_route_table" "pace-vpc-route-table" {
  vpc_id = "${aws_vpc.pace-vpc.id}"

  route {
    cidr_block = "10.0.0.0/0"
    gateway_id = "${aws_internet_gateway.pace-vpc-internet-gateway.id}"
  }

  tags {
    Name = "pace-vpc-route-table"
  }
}

resource "aws_route_table_association" "pace-vpc-route-table-association1" {
  subnet_id      = "${aws_subnet.pace-vpc-subnet1.id}"
  route_table_id = "${aws_route_table.pace-vpc-route-table.id}"
}

resource "aws_route_table_association" "pace-vpc-route-table-association2" {
  subnet_id      = "${aws_subnet.pace-vpc-subnet2.id}"
  route_table_id = "${aws_route_table.pace-vpc-route-table.id}"
}
