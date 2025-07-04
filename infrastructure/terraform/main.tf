############################################################################
# Main/Providers
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    docker = {
      source  = "kreuzwerker/docker"
      version = "3.0.2"
    }
  }
}

provider "aws" {
  region = "us-east-1"
  default_tags {
    tags = {
      Course     = "CSSE6400"
      Name       = "OpenJudge"
      Automation = "Terraform"
    }
  }
}

############################################################################
# Data
data "aws_iam_role" "lab" {
  name = "LabRole"
}

data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "private" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

############################################################################
# ECR
data "aws_ecr_authorization_token" "ecr_token" {}
provider "docker" {
  registry_auth {
    address  = data.aws_ecr_authorization_token.ecr_token.proxy_endpoint
    username = data.aws_ecr_authorization_token.ecr_token.user_name
    password = data.aws_ecr_authorization_token.ecr_token.password
  }
}

resource "aws_ecr_repository" "open-judge-ecr" {
  name = "open-judge-ecr"
}

############################################################################
##### ECS Cluster for open judge
resource "aws_ecs_cluster" "open-judge-cluster" {
  name = "open-judge-cluster"
}

############################################################################
# Input Variables
variable "AWS_REGION" {
  type = string
}

variable "AWS_ACCESS_KEY" {
  type = string
}

variable "AWS_SECRET_KEY" {
  type = string
}

variable "AWS_SESSION_TOKEN" {
  type = string
}

variable "USER_DATABASE_NAME" {
  type = string
}

variable "USER_DATABASE_USER" {
  type = string
}

variable "USER_DATABASE_PASSWORD" {
  type = string
}

variable "PROBLEMS_DATABASE_NAME" {
  type = string
}

variable "PROBLEMS_DATABASE_USER" {
  type = string
}

variable "PROBLEMS_DATABASE_PASSWORD" {
  type = string
}

variable "SUBMISSION_DATABASE_NAME" {
  type = string
}

variable "SUBMISSION_DATABASE_USER" {
  type = string
}

variable "SUBMISSION_DATABASE_PASSWORD" {
  type = string
}

variable "JWT_SECRET" {
  type = string
}

variable "JWT_PUBLIC_KEY" {
  type = string
}

variable "SMTP_HOST" {
  type = string
}

variable "SMTP_PORT" {
  type = string
}

variable "SMTP_USER" {
  type = string
}

variable "SMTP_PASSWORD" {
  type = string
}

variable "SMTP_FROM" {
  type = string
}

variable "GROQ_API_KEY" {
  type = string
}

############################################################################
