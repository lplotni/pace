resource "aws_ecs_cluster" "pace-ecs-cluster" {
  name = "${var.ecs-cluster-name}"
}
