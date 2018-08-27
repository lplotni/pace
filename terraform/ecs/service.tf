resource "aws_ecs_service" "pace-ecs-service" {
  name = "${var.ecs-service-name}"
  iam_role = "${var.ecs-service-role-arn}"
  cluster = "${aws_ecs_cluster.pace-ecs-cluster.id}"
  task_definition = "${aws_ecs_task_definition.pace-sample-definition.arn}"
  desired_count = 1

  load_balancer {
    target_group_arn = "${var.ecs-target-group-arn}"
    container_port = 3000
    container_name = "pace"
  }
}
