## Example CI/CD

This folder contains an example attempt at a CI/CD pipeline that could be employed to enhance deployability within our project. Unfortunately as github actions is not enabled this remains as a draft and cannot be used to actually complete CI/CD.  

### Terraform

We would manually create an S3 bucket and DynamoDB table, and then use those to store our terraform tfstate. We would also move out the docker images and ecr repo to be maintained outside of the deployment terraform (`infrastructure/terraform`) and by the CI/CD pipeline.

### Github Actions
The github actions is intended to build and push docker images to the ecr repository each time a pull request or push to main is made. Then it will run terraform init, plan and apply with the new images.
