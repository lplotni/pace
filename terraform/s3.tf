resource "aws_s3_bucket" "terraform_state" {
  bucket = "pace-tf-state-bucket"
  acl = "private"
}
