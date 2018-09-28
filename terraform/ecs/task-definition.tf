resource "aws_ecs_task_definition" "ecs-pace-task-definition" {
  family                = "pace-task-definition"
  container_definitions = "${data.template_file.app-task-definition-template.rendered}"

  volume {
    name      = "pace-config"
    host_path = "/media/pace/"
  }
}

resource "aws_ecs_task_definition" "ecs-pace-pdf-task-definition" {
  family = "pace-pdf-task-definition"
  container_definitions = "${data.template_file.pdf-task-definition-template.rendered}"
}

data "template_file" "app-task-definition-template" {
  template = "${file("${path.module}/task-definition-app.tpl")}"

  vars {
    postgres-password = "${var.postgres-password}"
    postgres-ip       = "${var.postgres-ip}"
    redis-ip          = "${var.redis-ip}"
  }
}
data "template_file" "pdf-task-definition-template" {
  template = "${file("${path.module}/task-definition-pdf.tpl")}"

  vars {
    redis-ip          = "${var.redis-ip}"
  }
}
