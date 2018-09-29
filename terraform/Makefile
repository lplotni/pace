init:
	terraform init
	cd s3
	terraform init
	terraform apply

test:
	tflint

plan:
	terraform plan -out out.plan

apply:
	terraform apply out.plan
