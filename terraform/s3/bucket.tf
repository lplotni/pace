resource "aws_s3_bucket" "pace-remote-state-s3" {
  bucket = "pace-s3-state-bucket"

  versioning {
    enabled = true
  }

  lifecycle {
    prevent_destroy = true
  }

  tags {
    Name = "Pace remote Terraform state"
  }
}
