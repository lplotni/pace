resource "aws_security_group" "instance" {
  name = "allow access via http"
  vpc_id = "${aws_vpc.vpc.id}"

  ingress {
    from_port = 8080
    protocol = "tcp"
    to_port = 8080
    cidr_blocks = [
      "0.0.0.0/0"]
  }

  egress {
    from_port = 0
    protocol = "-1"
    to_port = 0
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags {
    name = "${var.app_name}-pace-instance-sg"
  }
}

data "template_file" "userdata" {
  template = "${file("${path.module}/userdata.tpl")}"
}

resource "aws_launch_configuration" "pacelaunch" {
  name_prefix = "${var.app_name}-"
  image_id = "${var.ami_id}"
  instance_type = "${var.instance_type}"
  user_data = "${data.template_file.userdata.rendered}"
  security_groups = ["${aws_security_group.instance.id}"]
  associate_public_ip_address = true
  lifecycle { create_before_destroy = true }
}

resource "aws_autoscaling_group" "paceautoscaling" {
  name_prefix = "${var.app_name}-"
  launch_configuration = "${aws_launch_configuration.pacelaunch.id}"
  max_size = 2
  min_size = 1
  desired_capacity = 1
  vpc_zone_identifier = ["${aws_subnet.subnets.*.id}"]
  health_check_type = "ELB"
  health_check_grace_period = 120
  wait_for_capacity_timeout = "3m"

  lifecycle {create_before_destroy = true}

  tags = [
    {
      key = "name"
      value = "${var.app_name}-yocto"
      propagate_at_launch = true
    }
  ]
}
