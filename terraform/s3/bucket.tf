resource "aws_s3_bucket" "pace-remote-state-s3" {
  bucket = "pace-remote-state-s3"

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
