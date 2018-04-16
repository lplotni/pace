resource "aws_ecs_task_definition" "pace-sample-definition" {
  family                = "pace-sample-definition"
  container_definitions = "${file("./ecs/task-definition.json")}"
}
