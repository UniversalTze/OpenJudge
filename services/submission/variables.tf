variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "us-east-1"
}

variable "db_username" {
  description = "Username for RDS PostgreSQL"
  type        = string
}

variable "db_password" {
  description = "Password for RDS PostgreSQL"
  type        = string
  sensitive   = true
}

variable "vpc_id" {
  description = "VPC ID where RDS and ECS will be launched"
  type        = string
}

variable "private_subnets" {
  description = "List of private subnet IDs for RDS and ECS tasks"
  type        = list(string)
}

variable "public_subnets" {
  description = "List of public subnet IDs for the ECS ALB (if used)"
  type        = list(string)
}