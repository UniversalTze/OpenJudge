terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

variable "aws_region" {
  description = "AWS region"
  default     = "us-east-1"
}

variable "db_username" {
  description = "Postgres username"
  default     = "postgres"
}

variable "db_password" {
  description = "Postgres password"
  default     = "postgres"
}

# Use default VPC and subnets
data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

# Security group allowing outbound access
resource "aws_security_group" "ecs_sg" {
  name        = "ecs-sg"
  description = "Allow ECS tasks outbound to RDS/ElastiCache"
  vpc_id      = data.aws_vpc.default.id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# RDS Subnet group
resource "aws_db_subnet_group" "default" {
  name       = "submission-db-subnet-group"
  subnet_ids = data.aws_subnets.default.ids
}

# RDS PostgreSQL instance
resource "aws_db_instance" "submission_db" {
  identifier             = "submission-db"
  engine                 = "postgres"
  engine_version         = "13.4"
  instance_class         = "db.t3.micro"
  allocated_storage      = 20
  db_name                = "submissions"
  username               = var.db_username
  password               = var.db_password
  parameter_group_name   = "default.postgres13"
  skip_final_snapshot    = true
  publicly_accessible    = false
  vpc_security_group_ids = [aws_security_group.ecs_sg.id]
  db_subnet_group_name   = aws_db_subnet_group.default.name
}

# ElastiCache Subnet group
resource "aws_elasticache_subnet_group" "default" {
  name       = "submission-redis-subnet-group"
  subnet_ids = data.aws_subnets.default.ids
}

# ElastiCache Redis cluster
resource "aws_elasticache_cluster" "redis_cluster" {
  cluster_id           = "submission-redis"
  engine               = "redis"
  engine_version       = "6.x"
  node_type            = "cache.t3.micro"
  num_cache_nodes      = 1
  port                 = 6379
  parameter_group_name = "default.redis6.x"
  subnet_group_name    = aws_elasticache_subnet_group.default.name
  security_group_ids   = [aws_security_group.ecs_sg.id]
}

# ECR repositories for Docker images
resource "aws_ecr_repository" "submission_app" {
  name = "submission-app"
}

resource "aws_ecr_repository" "submission_worker" {
  name = "submission-worker"
}

# ECS cluster
resource "aws_ecs_cluster" "submission_cluster" {
  name = "submission-cluster"
}

# IAM role for ECS task execution
data "aws_iam_policy_document" "ecs_task_exec_assume" {
  statement {
    effect = "Allow"
    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
    actions = ["sts:AssumeRole"]
  }
}

resource "aws_iam_role" "ecs_task_execution_role" {
  name               = "ecsTaskExecutionRole"
  assume_role_policy = data.aws_iam_policy_document.ecs_task_exec_assume.json
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution_role_policy" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# ECS task definition for web service
resource "aws_ecs_task_definition" "web" {
  family                   = "submission-web"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn

  container_definitions = jsonencode([
    {
      name      = "web"
      image     = "${aws_ecr_repository.submission_app.repository_url}:latest"
      essential = true
      portMappings = [
        {
          containerPort = 5000
          hostPort      = 5000
        }
      ]
      environment = [
        { name = "DATABASE_URL", value = "postgresql://${var.db_username}:${var.db_password}@${aws_db_instance.submission_db.address}:5432/submissions" },
        { name = "REDIS_URL", value = "redis://${aws_elasticache_cluster.redis_cluster.cache_nodes[0].address}:6379/0" }
      ]
    }
  ])
}

# ECS service for web
resource "aws_ecs_service" "web_service" {
  name            = "submission-web-service"
  cluster         = aws_ecs_cluster.submission_cluster.id
  task_definition = aws_ecs_task_definition.web.arn
  launch_type     = "FARGATE"
  desired_count   = 2
  network_configuration {
    subnets          = data.aws_subnets.default.ids
    security_groups  = [aws_security_group.ecs_sg.id]
    assign_public_ip = true
  }
}

# ECS task definition for Celery worker
resource "aws_ecs_task_definition" "worker" {
  family                   = "submission-worker"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn

  container_definitions = jsonencode([
    {
      name      = "worker"
      image     = "${aws_ecr_repository.submission_worker.repository_url}:latest"
      essential = true
      command   = ["celery", "-A", "queue_utils.celery_app", "worker", "--loglevel=info", "-Q", "pythonq"]
      environment = [
        { name = "DATABASE_URL", value = "postgresql://${var.db_username}:${var.db_password}@${aws_db_instance.submission_db.address}:5432/submissions" },
        { name = "REDIS_URL", value = "redis://${aws_elasticache_cluster.redis_cluster.cache_nodes[0].address}:6379/0" }
      ]
    }
  ])
}

# ECS service for worker
resource "aws_ecs_service" "worker_service" {
  name            = "submission-worker-service"
  cluster         = aws_ecs_cluster.submission_cluster.id
  task_definition = aws_ecs_task_definition.worker.arn
  launch_type     = "FARGATE"
  desired_count   = 1
  network_configuration {
    subnets          = data.aws_subnets.default.ids
    security_groups  = [aws_security_group.ecs_sg.id]
    assign_public_ip = true
  }
}

# SQS queue (for callback/results if needed)
resource "aws_sqs_queue" "results_queue" {
  name = "submission-results-queue"
}
