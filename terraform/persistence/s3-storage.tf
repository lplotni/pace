resource "aws_s3_bucket" "config-bucket" {
  bucket = "${var.config-bucket-name}"
  acl    = "private"

  versioning {
    enabled = true
  }
}
