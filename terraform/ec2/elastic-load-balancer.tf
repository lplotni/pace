resource "aws_alb" "ecs-load-balancer" {
  name            = "${var.load-balancer-name}"
  security_groups = ["${var.security-group-id}"]
  subnets         = ["${var.subnet-id-1}", "${var.subnet-id-2}"]
}

resource "aws_alb_target_group" "ecs-target_group" {
  name     = "${var.target-group-name}"
  port     = "3000"
  protocol = "HTTP"
  vpc_id   = "${var.vpc-id}"

  depends_on = [
    "aws_alb.ecs-load-balancer",
  ]

  lifecycle {
    create_before_destroy = true
  }

  health_check {
    healthy_threshold   = "5"
    unhealthy_threshold = "2"
    interval            = "30"
    matcher             = "200"
    path                = "/"
    port                = "traffic-port"
    protocol            = "HTTP"
    timeout             = "5"
  }
}

resource "aws_alb_listener" "alb-listener-https" {
  load_balancer_arn = "${aws_alb.ecs-load-balancer.arn}"
  port              = "443"
  protocol          = "HTTPS"
  certificate_arn   = "${var.cert-arn}"

  default_action {
    target_group_arn = "${aws_alb_target_group.ecs-target_group.arn}"
    type             = "forward"
  }
}

resource "aws_alb_listener" "alb-listener-http" {
  load_balancer_arn = "${aws_alb.ecs-load-balancer.arn}"
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type = "redirect"

    redirect {
      status_code = "HTTP_301"
      protocol    = "HTTPS"
      port        = "443"
    }
  }
}

output "ecs-load-balancer-dns-name" {
  value = "${aws_alb.ecs-load-balancer.dns_name}"
}

output "ecs-load-balancer-name" {
  value = "${aws_alb.ecs-load-balancer.name}"
}

output "ecs-target-group-arn" {
  value = "${aws_alb_target_group.ecs-target_group.arn}"
}
