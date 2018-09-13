resource "aws_ecs_task_definition" "ecs-pace-task-definition" {
  family                = "pace-task-definition"
  container_definitions = "${data.template_file.ecs-task-definition-template.rendered}"

  volume {
    name      = "pace-config"
    host_path = "/media/pace/"
  }
}


data "template_file" "ecs-task-definition-template" {
  template = "${file("${path.module}/task-definition.tpl")}"

  vars {
    postgres-password = "${var.postgres-password}"
    postgres-ip = "${var.postgres-ip}"
    redis-ip = "${var.redis-ip}"
  }
}
