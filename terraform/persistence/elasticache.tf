resource "aws_elasticache_cluster" "pace-redis" {
  cluster_id           = "pace-redis"
  engine               = "redis"
  engine_version       = "4.0.10"
  node_type            = "cache.t2.small"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis4.0"
  subnet_group_name    = "${aws_elasticache_subnet_group.redis-subnet.name}"
  port                 = 6379
}

resource "aws_elasticache_subnet_group" "redis-subnet" {
  name       = "redis-subnet"
  subnet_ids = ["${var.vpc-subnet-id}"]
}

output "redis-ip" {
  value = "${aws_elasticache_cluster.pace-redis.cache_nodes.0.address}"
}
