data "aws_route53_zone" "primary" {
  name = "${var.domain}"
}

resource "aws_route53_record" "www" {
  zone_id = "${data.aws_route53_zone.primary.zone_id}"
  name    = "www.${data.aws_route53_zone.primary.name}"
  type    = "CNAME"
  ttl     = "300"
  records = ["${var.load-balancer-name}"]
}
