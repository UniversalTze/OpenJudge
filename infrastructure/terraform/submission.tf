############################################################################
# Docker Images
resource "docker_image" "SubmissionAPIImage" {
  name = "${aws_ecr_repository.open-judge-ecr.repository_url}:submission-api-latest"
  build {
    context    = "../../services/submission"
    dockerfile = "../../infrastructure/docker/Dockerfile.submission"
  }
}

resource "docker_image" "SubmissionResultReceiverImage" {
  name = "${aws_ecr_repository.open-judge-ecr.repository_url}:submission-result-receiver-latest-2"
  build {
    context    = "../../services/subscriber"
    dockerfile = "../../infrastructure/docker/Dockerfile.subscriber"
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
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    # security_groups = [aws_security_group.APIGatewaySecurityGroup.id, aws_security_group.APIGatewayLoadBalancerSecurityGroup.id]
  }

  ingress {
    from_port       = 443
    to_port         = 443
    protocol        = "tcp"
    security_groups = [aws_security_group.APIGatewaySecurityGroup.id, aws_security_group.APIGatewayLoadBalancerSecurityGroup.id]
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
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.SubmissionAPISecurityGroup.id, aws_security_group.SubmissionResultReceiverSecurityGroup.id]
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
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow outbound to RDS PostgreSQL"
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
resource "aws_db_instance" "SubmissionDatabase" {
  # Engine Definitions
  identifier            = "submission-db"
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
  # db_subnet_group_name         = aws_db_subnet_group.default.name

  # Other Paramaters
  parameter_group_name         = "default.postgres15"
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
    target_group_arn = aws_lb_target_group.SubmissionAPILBTargetGroup.arn
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
          "awslogs-group"         = "/SubmissionAPI"
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
          name  = "SUBMISSION_DATABASE_URL",
          value = "postgresql+asyncpg://${var.SUBMISSION_DATABASE_USER}:${var.SUBMISSION_DATABASE_PASSWORD}@${aws_db_instance.SubmissionDatabase.endpoint}/${var.SUBMISSION_DATABASE_NAME}"
        },
        {
          name  = "CELERY_BROKER_URL",
          value = "sqs://"
        },
        {
          name  = "PROBLEMS_SERVICE_URL",
          value = "http://${aws_lb.ProblemsAPILoadBalancer.dns_name}",
        },
        {
          name  = "JAVA_QUEUE_NAME",
          value = "${aws_sqs_queue.ExecutionJavaQueue.name}",
        },
        {
          name  = "PYTHON_QUEUE_NAME",
          value = "${aws_sqs_queue.ExecutionPythonQueue.name}",
        },
        {
          name  = "GROQ_API_KEY"
          value = "${var.GROQ_API_KEY}"
        },

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
    subnets          = data.aws_subnets.private.ids
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
          "awslogs-group"         = "/SubmissionResultReceiver"
          "awslogs-region"        = var.AWS_REGION
          "awslogs-stream-prefix" = "ecs"
          "awslogs-create-group"  = "true"
        }
      }
      environment = [
        {
          name  = "SUBMISSION_DATABASE_URL",
          value = "postgresql+asyncpg://${var.SUBMISSION_DATABASE_USER}:${var.SUBMISSION_DATABASE_PASSWORD}@${aws_db_instance.SubmissionDatabase.endpoint}/${var.SUBMISSION_DATABASE_NAME}"
        },
        {
          name  = "CELERY_BROKER_URL"
          value = "sqs://"
        },
        {
          name  = "OUTPUT_QUEUE_NAME"
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
    target_group_arn = aws_lb_target_group.SubmissionAPILBTargetGroup.arn
  }
}

resource "aws_lb_target_group" "SubmissionAPILBTargetGroup" {
  name        = "SubmissionAPILBTargetGroup"
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
# Autoscaling

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
  max_capacity       = 7
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

  step_scaling_policy_configuration {
    adjustment_type         = "ChangeInCapacity"
    metric_aggregation_type = "Average"
    cooldown                = 60

    step_adjustment {
      metric_interval_lower_bound = 0
      scaling_adjustment          = 2 # Add 2 tasks when alarm triggers to ensure quick scaling
    }

    step_adjustment {
      metric_interval_upper_bound = 0
      scaling_adjustment          = -1 # Remove 1 task
    }
  }
}

############################################################################
# Alarms

resource "aws_cloudwatch_metric_alarm" "scale_up_sqs_output_queue_alarm" {
  alarm_name          = "scale_up_sqs_output_queue_alarm"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  period              = 30
  metric_name         = "ApproximateNumberOfMessagesVisible"
  namespace           = "AWS/SQS"
  statistic           = "Average"
  threshold           = 15
  dimensions = {
    QueueName = aws_sqs_queue.ExecutionResultsQueue.name
  }

  alarm_actions = [
    aws_appautoscaling_policy.SubmissionResultReceiverAutoScalingPolicy.arn
  ]
}

resource "aws_cloudwatch_metric_alarm" "scale_down_sqs_output_queue_alarm" {
  alarm_name          = "scale_down_sqs_output_queue_alarm"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = 3
  period              = 60
  metric_name         = "ApproximateNumberOfMessagesVisible"
  namespace           = "AWS/SQS"
  statistic           = "Average"
  threshold           = 10
  dimensions = {
    QueueName = aws_sqs_queue.ExecutionResultsQueue.name
  }

  alarm_actions = [
    aws_appautoscaling_policy.SubmissionResultReceiverAutoScalingPolicy.arn
  ]
}

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