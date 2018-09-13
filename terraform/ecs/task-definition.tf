resource "aws_ecs_task_definition" "ecs-pace-task-definition" {
  family                = "pace-task-definition"
  container_definitions = "${file("ecs/task-definition.json")}"

  volume {
    name      = "pace-config"
    host_path = "/etc/pace/"
  }
}
