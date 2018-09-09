resource "aws_elasticache_cluster" "pace-redis" {
  cluster_id           = "pace-redis"
  engine               = "redis"
  engine_version       = "4.0.10"
  node_type            = "cache.t2.small"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis4.0"
  port                 = 6379
}

output "redis-ip" {
  value = "${aws_elasticache_cluster.pace-redis.cache_nodes.0.address}"
}
