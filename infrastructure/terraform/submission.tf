############################################################################
# Docker Images
resource "docker_image" "SubmissionAPIImage" {
  name = "${aws_ecr_repository.open-judge-ecr.repository_url}:submission-api-latest"
  build {
    context    = "../../services/submission"
    dockerfile = "../infrastructure/docker/Dockerfile.submission"
  }
}

resource "docker_image" "SubmissionResultReceiverImage" {
  name = "${aws_ecr_repository.open-judge-ecr.repository_url}:submission-result-receiver-latest"
  build {
    context    = "../../services/submission"
    dockerfile = "../infrastructure/docker/Dockerfile.subscriber"
  }
}

resource "docker_registry_image" "SubmissionAPIImageName" {
  name = docker_image.SubmissionAPIImage.name
}

resource "docker_registry_image" "SubmissionResultReceiverImageName" {
  name = docker_image.SubmissionResultReceiverImage.name
}

############################################################################
# Security Groups
resource "aws_security_group" "SubmissionAPISecurityGroup" {
  name        = "Submission API Security Group"
  description = "Submission Service security group for inbound and outbound communication"
  vpc_id      = data.aws_vpc.default.id

  # Incoming requests to API are allowed
  ingress {
    from_port       = 5000
    to_port         = 5000
    protocol        = "tcp"
    cidr_blocks     = ["0.0.0.0/0"]
    security_groups = [aws_security_group.SubmissionAPILoadBalancerSecurityGroup.id]
  }

  # Outgoing requests to DB, SQS and other services are allowed
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "SubmissionAPILoadBalancerSecurityGroup" {
  name        = "Submission API LB Security Group"
  description = "Inbound and outbound communication to load balancer"
  vpc_id      = data.aws_vpc.default.id

  # Incoming requests via gateway
  ingress {
    from_port       = 80
    to_port         = 80
    protocol        = "tcp"
    security_groups = [aws_security_group.APIGatewaySecurityGroup.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "SubmissionDatabaseSecurityGroup" {
  name        = "Submission Database Security Group"
  description = "Inbound and outbound communication to database"
  vpc_id      = data.aws_vpc.default.id

  # Incoming requests from API are allowed
  ingress {
    from_port       = 5000
    to_port         = 5000
    protocol        = "tcp"
    security_groups = [aws_security_group.SubmissionAPISecurityGroup.id]
  }

  egress {
    from_port        = 0
    to_port          = 0
    protocol         = "-1"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }
}

resource "aws_security_group" "SubmissionResultReceiverSecurityGroup" {
  name        = "SubmissionResultReceiverSecurityGroup"
  description = "Submission Receiver Security Group Blocking External Input/Output"
  vpc_id      = data.aws_vpc.default.id

  # Disallow inbound traffic (no ingress blocks needed)

  # Allow outbound traffic to RDS
  egress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.SubmissionDatabaseSecurityGroup]
    description     = "Allow outbound to RDS PostgreSQL"
  }

  # Allow outbound traffic to SQS
  egress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow outbound HTTPS to AWS services"
  }
}

############################################################################
# Submission Database

# RDS PostgreSQL instance
resource "aws_db_instance" "SubmissionDatabase" {
  # Engine Definitions
  identifier            = "SubmissionDB"
  engine                = "postgres"
  engine_version        = "15"
  instance_class        = "db.t3.medium"
  allocated_storage     = 20
  max_allocated_storage = 1000

  # Database Credentials
  db_name  = var.SUBMISSION_DATABASE_NAME
  username = var.SUBMISSION_DATABASE_USER
  password = var.SUBMISSION_DATABASE_PASSWORD

  # Accessibility
  vpc_security_group_ids = [aws_security_group.SubmissionDatabaseSecurityGroup.id]
  publicly_accessible    = false
  # TODO - ADD IN SUBNET IF TIME!
  # db_subnet_group_name         = aws_db_subnet_group.default.name

  # Other Paramaters
  parameter_group_name         = "default.postgres13"
  skip_final_snapshot          = true
  performance_insights_enabled = true
}

############################################################################
# ECS

# Main API
resource "aws_ecs_service" "SubmissionAPI" {
  name            = "SubmissionAPI"
  cluster         = aws_ecs_cluster.open-judge-cluster.id
  task_definition = aws_ecs_task_definition.SubmissionAPITask.arn
  launch_type     = "FARGATE"
  desired_count   = 1

  depends_on = [
    aws_db_instance.SubmissionDatabase,
    docker_registry_image.SubmissionAPIImageName,
    aws_sqs_queue.ExecutionPythonQueue,
    aws_sqs_queue.ExecutionJavaQueue,
    aws_lb_listener.SubmissionAPILoadBalancerListener,
  ]

  network_configuration {
    subnets          = data.aws_subnets.private.ids
    security_groups  = [aws_security_group.SubmissionAPISecurityGroup.id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.SubmissionAPILoadBalancerTargetGroup.arn
    container_name   = "SubmissionAPI"
    container_port   = 5000
  }
}

resource "aws_ecs_task_definition" "SubmissionAPITask" {
  family                   = "SubmissionAPI"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = 1024
  memory                   = 2048
  execution_role_arn       = data.aws_iam_role.lab.arn
  task_role_arn            = data.aws_iam_role.lab.arn

  container_definitions = jsonencode([
    {
      name      = "SubmissionAPI"
      image     = "${docker_image.SubmissionAPIImage.name}"
      essential = true
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = "/AuthenticationAPI"
          "awslogs-region"        = var.AWS_REGION
          "awslogs-stream-prefix" = "ecs"
          "awslogs-create-group"  = "true"
        }
      }
      portMappings = [
        {
          containerPort = 5000
          hostPort      = 5000
        }
      ]
      environment = [
        {
          name  = "DATABASE_URL",
          value = "postgresql://${var.SUBMISSION_DATABASE_USER}:${var.SUBMISSION_DATABASE_PASSWORD}@${aws_db_instance.SubmissionDatabase.endpoint}/${var.SUBMISSION_DATABASE_NAME}"
        },
        {
          name  = "BROKER_URL",
          value = "sqs://"
        },
        {
          name  = "PROBLEMS_SERVICE_URL",
          value = "${aws_lb.ProblemsAPILoadBalancer.dns_name}",
        },
        {
          name  = "JAVA_QUEUE",
          value = "${aws_sqs_queue.ExecutionJavaQueue.name}",
        },
        {
          name  = "PYTHON_QUEUE",
          value = "${aws_sqs_queue.ExecutionPythonQueue.name}",
        }
      ]
    }
  ])
}

# Celery Worker
resource "aws_ecs_service" "SubmissionResultReceiver" {
  name            = "SubmissionResultReceiver"
  cluster         = aws_ecs_cluster.open-judge-cluster.id
  task_definition = aws_ecs_task_definition.SubmissionResultReceiverTask.arn
  launch_type     = "FARGATE"
  desired_count   = 1

  depends_on = [
    docker_registry_image.SubmissionResultReceiverImageName,
    aws_sqs_queue.ExecutionResultsQueue,
    aws_db_instance.SubmissionDatabase,
  ]

  network_configuration {
    subnets          = data.aws_subnets.default.ids
    security_groups  = [aws_security_group.SubmissionResultReceiverSecurityGroup.id]
    assign_public_ip = true
  }
}

resource "aws_ecs_task_definition" "SubmissionResultReceiverTask" {
  family                   = "SubmissionResultReceiver"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = 512
  memory                   = 1024
  execution_role_arn       = data.aws_iam_role.lab.arn
  task_role_arn            = data.aws_iam_role.lab.arn

  container_definitions = jsonencode([
    {
      name      = "SubmissionResultReceiverTask"
      image     = "${docker_image.SubmissionResultReceiverImage.name}"
      essential = true
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = "/ExecutionPython"
          "awslogs-region"        = var.AWS_REGION
          "awslogs-stream-prefix" = "ecs"
          "awslogs-create-group"  = "true"
        }
      }
      environment = [
        {
          name  = "ENV"
          value = "production"
        },
        {
          name  = "DATABASE_URL",
          value = "postgresql://${var.SUBMISSION_DATABASE_USER}:${var.SUBMISSION_DATABASE_PASSWORD}@${aws_db_instance.SubmissionDatabase.endpoint}/${var.SUBMISSION_DATABASE_NAME}"
        },
        {
          name  = "CELERY_BROKER_URL"
          value = "sqs://"
        },
        {
          name  = "OUTPUT_QUEUE"
          value = "${aws_sqs_queue.ExecutionResultsQueue.name}"
        },
      ]
    }
  ])
}

########################################################################################
# Load Balancer
resource "aws_lb" "SubmissionAPILoadBalancer" {
  name               = "SubmissionAPILoadBalancer"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.SubmissionAPILoadBalancerSecurityGroup.id]
  subnets            = data.aws_subnets.private.ids
}

resource "aws_lb_listener" "SubmissionAPILoadBalancerListener" {
  load_balancer_arn = aws_lb.SubmissionAPILoadBalancer.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.SubmissionAPILoadBalancerTargetGroup.arn
  }
}

resource "aws_lb_target_group" "SubmissionAPILoadBalancerTargetGroup" {
  name        = "SubmissionAPILoadBalancerTargetGroup"
  port        = 5000
  protocol    = "HTTP"
  vpc_id      = data.aws_vpc.default.id
  target_type = "ip"

  health_check {
    enabled             = true
    healthy_threshold   = 2
    interval            = 30
    matcher             = "200"
    path                = "/health"
    port                = "traffic-port"
    protocol            = "HTTP"
    timeout             = 5
    unhealthy_threshold = 2
  }
}

############################################################################
# Autoscaling TODO

# Main API
resource "aws_appautoscaling_target" "SubmissionAPIAutoScalingTarget" {
  max_capacity       = 3
  min_capacity       = 1
  resource_id        = "service/${aws_ecs_cluster.open-judge-cluster.name}/${aws_ecs_service.SubmissionAPI.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

resource "aws_appautoscaling_policy" "SubmissionAPIAutoScalingPolicy" {
  name               = "SubmissionAPIAutoScalingPolicy"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.SubmissionAPIAutoScalingTarget.resource_id
  scalable_dimension = aws_appautoscaling_target.SubmissionAPIAutoScalingTarget.scalable_dimension
  service_namespace  = aws_appautoscaling_target.SubmissionAPIAutoScalingTarget.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    target_value       = 50.0
    scale_out_cooldown = 60
  }
}

# Result Receiver
resource "aws_appautoscaling_target" "SubmissionResultReceiverAutoScalingTarget" {
  max_capacity       = 3
  min_capacity       = 1
  resource_id        = "service/${aws_ecs_cluster.open-judge-cluster.name}/${aws_ecs_service.SubmissionResultReceiver.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

resource "aws_appautoscaling_policy" "SubmissionResultReceiverAutoScalingPolicy" {
  name               = "SubmissionResultReceiverAutoScalingPolicy"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.SubmissionResultReceiverAutoScalingTarget.resource_id
  scalable_dimension = aws_appautoscaling_target.SubmissionResultReceiverAutoScalingTarget.scalable_dimension
  service_namespace  = aws_appautoscaling_target.SubmissionResultReceiverAutoScalingTarget.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    target_value       = 50.0
    scale_out_cooldown = 60
  }
}

############################################################################
# Alarms
# TODO - ADD IN SQS QUEUE BASED ALARM FOR SUBMISSION WORKER!


############################################################################
# Output
resource "null_resource" "summary_submission" {
  provisioner "local-exec" {
    command = <<EOT
      echo "==== OpenJudge Problem Deployment Complete! ===="
      echo "Submission API Image Repository URL: ${aws_ecr_repository.open-judge-ecr.repository_url}"
      echo ""
    EOT
  }
}

############################################################################
# Extraneous TF code - add back in if it works/is needed


# RDS Subnet group TODO - ADD BACK IN IF TIME ALLOWS!
# resource "aws_db_subnet_group" "default" {
#   name       = "submission-db-subnet-group"
#   subnet_ids = data.aws_subnets.default.ids
# }

# IAM ROLES SHOULD BE DEFINED IN MAIN - TODO - DELETE LATER IF UNECESSARY!
# # IAM role for ECS task execution
# data "aws_iam_policy_document" "ecs_task_exec_assume" {
#   statement {
#     effect = "Allow"
#     principals {
#       type        = "Service"
#       identifiers = ["ecs-tasks.amazonaws.com"]
#     }
#     actions = ["sts:AssumeRole"]
#   }
# }

# resource "aws_iam_role" "ecs_task_execution_role" {
#   name               = "ecsTaskExecutionRole"
#   assume_role_policy = data.aws_iam_policy_document.ecs_task_exec_assume.json
# }

# resource "aws_iam_role_policy_attachment" "ecs_task_execution_role_policy" {
#   role       = aws_iam_role.ecs_task_execution_role.name
#   policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
# }
