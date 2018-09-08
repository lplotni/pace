resource "aws_launch_configuration" "ecs-launch-configuration" {
  name_prefix                 = "pace-launch-configuration"
  image_id                    = "${var.image-id}"
  instance_type               = "${var.instance-type}"
  iam_instance_profile        = "${var.ecs-instance-profile-name}"
  security_groups             = ["${var.security-group-id}"]
  associate_public_ip_address = "true"
  user_data                   = "${data.template_cloudinit_config.ecs-init.rendered}"

  lifecycle {
    create_before_destroy = true
  }
}

data "template_cloudinit_config" "ecs-init" {
  part {
    content_type = "text/x-shellscript"
    content      = "${data.template_file.ecs-launch-configuration-user-data.rendered}"
  }

  part {
    content_type = "text/upstart-job"
    content      = "${data.template_file.cloudwatch_upstart.rendered}"
  }
}

data "template_file" "ecs-launch-configuration-user-data" {
  template = "${file("${path.module}/user-data.tpl")}"

  vars {
    ecs-cluster-name = "${var.ecs-cluster-name}"
  }
}

data "template_file" "cloudwatch_upstart" {
  template = "${file("${path.module}/cloudwatch-upstart.tpl")}"
}
