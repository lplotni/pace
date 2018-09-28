resource "aws_ecs_service" "pace-app-service" {
  name            = "${var.ecs-service-name}-app"
  iam_role        = "${var.ecs-service-role-arn}"
  cluster         = "${aws_ecs_cluster.pace-ecs-cluster.id}"
  task_definition = "${aws_ecs_task_definition.ecs-pace-task-definition.arn}"
  desired_count   = 1
  load_balancer {
    target_group_arn = "${var.pace-target-group-arn}"
    container_port   = "${var.pace-container-port}"
    container_name   = "${var.pace-container-name}"
  }
}
resource "aws_ecs_service" "pace-pdf-service" {
  name            = "${var.ecs-service-name}-pdf"
  cluster         = "${aws_ecs_cluster.pace-ecs-cluster.id}"
  task_definition = "${aws_ecs_task_definition.ecs-pace-pdf-task-definition.arn}"
  desired_count   = 1
  load_balancer {
    target_group_arn = "${var.pdf-target-group-arn}"
    container_port   = "${var.pdf-container-port}"
    container_name   = "${var.pdf-container-name}"
  }
}
