# ----------- Provider ------------
provider "aws" {
  region = var.aws_region
}

# ----------- RDS Subnet Group ------------
resource "aws_db_subnet_group" "submissions_db_subnet" {
  name       = "submissions-db-subnet"
  subnet_ids = var.private_subnets
  tags = {
    Name = "submissions-db-subnet"
  }
}

# ----------- Security Group for RDS ------------
resource "aws_security_group" "rds_sg" {
  name        = "submissions-rds-sg"
  description = "Allow Postgres inbound from ECS tasks"
  vpc_id      = var.vpc_id

  ingress {
    description      = "Postgres inbound from ECS tasks"
    from_port        = 5432
    to_port          = 5432
    protocol         = "tcp"
    security_groups  = [aws_security_group.ecs_tasks_sg.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "submissions-rds-sg"
  }
}

# ----------- RDS PostgreSQL Instance ------------
resource "aws_db_instance" "submissions" {
  identifier              = "submissions-db"
  engine                  = "postgres"
  engine_version          = "13.7"
  instance_class          = "db.t3.micro"
  name                    = "submissions"
  username                = var.db_username
  password                = var.db_password
  allocated_storage       = 20
  storage_type            = "gp2"
  skip_final_snapshot     = true
  publicly_accessible     = false
  vpc_security_group_ids  = [aws_security_group.rds_sg.id]
  db_subnet_group_name    = aws_db_subnet_group.submissions_db_subnet.name
  backup_retention_period = 7
  deletion_protection     = false

  tags = {
    Name = "submissions-db-instance"
  }
}

# ----------- SQS Dead‐Letter Queue ------------
resource "aws_sqs_queue" "submission_dlq" {
  name                      = "submission-dlq"
  message_retention_seconds = 1209600  # 14 days
  tags = {
    Name = "SubmissionDLQ"
  }
}

# ----------- SQS Main Queue ------------
resource "aws_sqs_queue" "submission_queue" {
  name                      = "submission-queue"
  visibility_timeout_seconds = 600     # 10 minutes
  message_retention_seconds  = 1209600 # 14 days
  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.submission_dlq.arn
    maxReceiveCount     = 5
  })

  tags = {
    Name = "SubmissionQueue"
  }
}

# ----------- ECR Repository ------------
resource "aws_ecr_repository" "flask_app" {
  name                 = "flask-submission-app"
  image_tag_mutability = "MUTABLE"
  tags = {
    Name = "FlaskSubmissionECR"
  }
}

# ----------- CloudWatch Log Group for ECS ------------
resource "aws_cloudwatch_log_group" "ecs" {
  name              = "/ecs/submission-service"
  retention_in_days = 30
  tags = {
    Name = "ECS-SubmissionService-Logs"
  }
}

# ----------- IAM Role & Policies for ECS Task Execution ------------
data "aws_iam_policy_document" "ecs_task_assume_role" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "ecs_task_execution_role" {
  name               = "ecsTaskExecutionRole"
  assume_role_policy = data.aws_iam_policy_document.ecs_task_assume_role.json
  tags = {
    Name = "ECS-TaskExecutionRole"
  }
}

# Attach AWS managed policy for ECS to push logs to CloudWatch, pull images from ECR
resource "aws_iam_role_policy_attachment" "ecs_execution_policy" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# Attach policy to allow the ECS task to send messages to SQS
resource "aws_iam_policy" "ecs_sqs_send" {
  name        = "ecs-sqs-send-policy"
  description = "Allow ECS tasks to send messages to the submission SQS queue"
  policy      = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action   = ["sqs:SendMessage"]
        Effect   = "Allow"
        Resource = aws_sqs_queue.submission_queue.arn
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_sqs_attach" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = aws_iam_policy.ecs_sqs_send.arn
}

# ----------- Security Group for ECS Tasks ------------
resource "aws_security_group" "ecs_tasks_sg" {
  name        = "ecs-tasks-sg"
  description = "Allow inbound HTTP from ALB and outbound to RDS & SQS"
  vpc_id      = var.vpc_id

  # Allow inbound HTTP (if using an ALB, its SG will reference this SG)
  ingress {
    description      = "HTTP from ALB or anywhere (adjust as needed)"
    from_port        = 5000
    to_port          = 5000
    protocol         = "tcp"
    cidr_blocks      = ["0.0.0.0/0"]
  }

  # Allow outbound Postgres
  egress {
    description      = "Outbound Postgres to RDS"
    from_port        = 5432
    to_port          = 5432
    protocol         = "tcp"
    security_groups  = [aws_security_group.rds_sg.id]
  }

  # Allow outbound SQS (HTTPS)
  egress {
    description = "Outbound HTTPS to SQS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "ecs-tasks-sg"
  }
}

# ----------- ECS Cluster ------------
resource "aws_ecs_cluster" "cluster" {
  name = "submission-service-cluster"
}

# ----------- ECS Task Definition ------------
resource "aws_ecs_task_definition" "flask_task" {
  family                   = "flask-submission-task"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = "512"
  memory                   = "1024"
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn

  container_definitions = jsonencode([
    {
      name      = "flask-submission-container"
      image     = "${aws_ecr_repository.flask_app.repository_url}:latest"
      portMappings = [
        {
          containerPort = 5000
          protocol      = "tcp"
        }
      ]
      environment = [
        {
          name  = "DATABASE_URL"
          value = "postgresql://${var.db_username}:${var.db_password}@${aws_db_instance.submissions.address}:${aws_db_instance.submissions.port}/${aws_db_instance.submissions.name}"
        },
        {
          name  = "USE_SQS"
          value = "true"
        },
        {
          name  = "SQS_QUEUE_URL"
          value = aws_sqs_queue.submission_queue.id
        },
        {
          name  = "AWS_REGION"
          value = var.aws_region
        }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.ecs.name
          awslogs-region        = var.aws_region
          awslogs-stream-prefix = "ecs"
        }
      }
    }
  ])

  tags = {
    Name = "flask-submission-task"
  }
}

# ----------- ECS Service ------------
resource "aws_ecs_service" "flask_service" {
  name            = "flask-submission-service"
  cluster         = aws_ecs_cluster.cluster.id
  task_definition = aws_ecs_task_definition.flask_task.arn
  desired_count   = 2
  launch_type     = "FARGATE"

  network_configuration {
    subnets         = var.private_subnets
    security_groups = [aws_security_group.ecs_tasks_sg.id]
    assign_public_ip = true
  }

  tags = {
    Name = "flask-submission-service"
  }
}

# ----------- Outputs ------------
output "rds_endpoint" {
  description = "Endpoint of the RDS PostgreSQL instance"
  value       = aws_db_instance.submissions.address
}

output "sqs_queue_url" {
  description = "URL of the submissions SQS queue"
  value       = aws_sqs_queue.submission_queue.id
}

output "ecs_cluster_id" {
  description = "ECS Cluster ID"
  value       = aws_ecs_cluster.cluster.id
}

output "ecr_repository_url" {
  description = "ECR repository URL where to push the Docker image"
  value       = aws_ecr_repository.flask_app.repository_url
}
