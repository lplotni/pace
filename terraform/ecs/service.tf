resource "aws_ecs_service" "pace-app-service" {
  name            = "${var.ecs-service-name}-app"
  iam_role        = "${var.ecs-service-role-arn}"
  cluster         = "${aws_ecs_cluster.pace-ecs-cluster.id}"
  task_definition = "${aws_ecs_task_definition.ecs-pace-task-definition.arn}"
  desired_count   = 1

  load_balancer {
    target_group_arn = "${var.ecs-target-group-arn}"
    container_port   = "${var.container-port}"
    container_name   = "${var.container-name}"
  }
}
resource "aws_ecs_service" "pace-pdf-service" {
  name            = "${var.ecs-service-name}-pdf"
  cluster         = "${aws_ecs_cluster.pace-ecs-cluster.id}"
  task_definition = "${aws_ecs_task_definition.ecs-pace-pdf-task-definition.arn}"
  desired_count   = 1
}
