############################################################################
# Docker Images
resource "docker_image" "ExecutionPythonImage" {
  name = "${aws_ecr_repository.open-judge-ecr.repository_url}:execution-python-latest-2"
  build {
    context    = "../../services/execution"
    dockerfile = "../../infrastructure/docker/Dockerfile.python"
  }
}

resource "docker_image" "ExecutionJavaImage" {
  name = "${aws_ecr_repository.open-judge-ecr.repository_url}:execution-java-latest-2"
  build {
    context    = "../../services/execution"
    dockerfile = "../../infrastructure/docker/Dockerfile.java"
  }
}

resource "docker_registry_image" "ExecutionPythonImageName" {
  name = docker_image.ExecutionPythonImage.name
}

resource "docker_registry_image" "ExecutionJavaImageName" {
  name = docker_image.ExecutionJavaImage.name
}

############################################################################
# Security Group (No External Network Access Bar SQS)
resource "aws_security_group" "ExecutionSecurityGroup" {
  name        = "ExecutionSecurityGroup"
  description = "Execution Security Group Blocking External Input/Output"

  ingress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = []
    description = "No inbound traffic allowed"
  }

  # Allow HTTPS outbound to port 443 (required for SQS API)
  egress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow outbound HTTPS to AWS services"
  }
}

############################################################################
# ECS

# Python
resource "aws_ecs_service" "ExecutionPythonService" {
  name            = "ExecutionPythonService"
  cluster         = aws_ecs_cluster.open-judge-cluster.id
  task_definition = aws_ecs_task_definition.ExecutionPythonTask.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  depends_on = [
    docker_registry_image.ExecutionPythonImageName,
    aws_sqs_queue.ExecutionPythonQueue,
    aws_sqs_queue.ExecutionResultsQueue,
  ]

  network_configuration {
    subnets          = data.aws_subnets.private.ids
    security_groups  = [aws_security_group.ExecutionSecurityGroup.id]
    assign_public_ip = true 
  }
}

resource "aws_ecs_task_definition" "ExecutionPythonTask" {
  # Explicitly set linux for sandboxing
  runtime_platform {
    cpu_architecture        = "X86_64"
    operating_system_family = "LINUX"
  }

  family                   = "ExecutionPython"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = 2048
  memory                   = 4096
  execution_role_arn       = data.aws_iam_role.lab.arn
  task_role_arn            = data.aws_iam_role.lab.arn

  container_definitions = jsonencode([
    {
      name      = "ExecutionPythonTask"
      image     = "${docker_image.ExecutionPythonImage.name}"
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
          name  = "CELERY_BROKER_URL"
          value = "sqs://"
        },
        {
          name  = "TARGET_QUEUE"
          value = "${aws_sqs_queue.ExecutionPythonQueue.name}"
        },
        {
          name  = "OUTPUT_QUEUE"
          value = "${aws_sqs_queue.ExecutionResultsQueue.name}"
        },
        {
          name  = "LANGUAGE"
          value = "python"
        },
      ]
    }
  ])
}

# Java
resource "aws_ecs_service" "ExecutionJavaService" {
  name            = "ExecutionJavaService"
  cluster         = aws_ecs_cluster.open-judge-cluster.id
  task_definition = aws_ecs_task_definition.ExecutionJavaTask.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  depends_on = [
    docker_registry_image.ExecutionJavaImageName,
    aws_sqs_queue.ExecutionJavaQueue,
    aws_sqs_queue.ExecutionResultsQueue,
  ]

  network_configuration {
    subnets          = data.aws_subnets.private.ids
    security_groups  = [aws_security_group.ExecutionSecurityGroup.id]
    assign_public_ip = true
  }
}

resource "aws_ecs_task_definition" "ExecutionJavaTask" {
  # Explicitly set linux for sandboxing
  runtime_platform {
    cpu_architecture        = "X86_64"
    operating_system_family = "LINUX"
  }

  family                   = "ExecutionJava"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = 2048
  memory                   = 4096
  execution_role_arn       = data.aws_iam_role.lab.arn
  task_role_arn            = data.aws_iam_role.lab.arn

  container_definitions = jsonencode([
    {
      name      = "ExecutionPythonTask"
      image     = "${docker_image.ExecutionJavaImage.name}"
      essential = true
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = "/ExecutionJava"
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
          name  = "CELERY_BROKER_URL"
          value = "sqs://"
        },
        {
          name  = "TARGET_QUEUE"
          value = "${aws_sqs_queue.ExecutionJavaQueue.name}"
        },
        {
          name  = "OUTPUT_QUEUE"
          value = "${aws_sqs_queue.ExecutionResultsQueue.name}"
        },
        {
          name  = "LANGUAGE"
          value = "java"
        },
      ]
    }
  ])
}

############################################################################
# Autoscaling

# Python
resource "aws_appautoscaling_target" "ExecutionPythonAutoScalingTarget" {
  max_capacity       = 7
  min_capacity       = 1
  resource_id        = "service/${aws_ecs_cluster.open-judge-cluster.name}/${aws_ecs_service.ExecutionPythonService.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

resource "aws_appautoscaling_policy" "ExecutionPythonAutoScalingPolicy" {
  name               = "ExecutionPythonAutoScalingPolicy"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.ExecutionPythonAutoScalingTarget.resource_id
  scalable_dimension = aws_appautoscaling_target.ExecutionPythonAutoScalingTarget.scalable_dimension
  service_namespace  = aws_appautoscaling_target.ExecutionPythonAutoScalingTarget.service_namespace

  step_scaling_policy_configuration {
    adjustment_type         = "ChangeInCapacity"
    metric_aggregation_type = "Average"
    cooldown                = 30

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

# Java
resource "aws_appautoscaling_target" "ExecutionJavaAutoScalingTarget" {
  max_capacity       = 7
  min_capacity       = 1
  resource_id        = "service/${aws_ecs_cluster.open-judge-cluster.name}/${aws_ecs_service.ExecutionJavaService.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

resource "aws_appautoscaling_policy" "ExecutionJavaAutoScalingPolicy" {
  name               = "ExecutionJavaAutoScalingPolicy"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.ExecutionJavaAutoScalingTarget.resource_id
  scalable_dimension = aws_appautoscaling_target.ExecutionJavaAutoScalingTarget.scalable_dimension
  service_namespace  = aws_appautoscaling_target.ExecutionJavaAutoScalingTarget.service_namespace

  step_scaling_policy_configuration {
    adjustment_type         = "ChangeInCapacity"
    metric_aggregation_type = "Average"
    cooldown                = 30

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
resource "aws_cloudwatch_metric_alarm" "scale_up_sqs_python_queue_alarm" {
  alarm_name          = "scale_up_sqs_python_queue_alarm"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  period              = 10
  metric_name         = "ApproximateNumberOfMessagesVisible"
  namespace           = "AWS/SQS"
  statistic           = "Average"
  threshold           = 15
  dimensions = {
    QueueName = aws_sqs_queue.ExecutionPythonQueue.name
  }

  alarm_actions = [
    aws_appautoscaling_policy.ExecutionPythonAutoScalingPolicy.arn
  ]
}

resource "aws_cloudwatch_metric_alarm" "scale_up_sqs_java_queue_alarm" {
  alarm_name          = "scale_up_sqs_java_queue_alarm"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  period              = 10
  metric_name         = "ApproximateNumberOfMessagesVisible"
  namespace           = "AWS/SQS"
  statistic           = "Average"
  threshold           = 15
  dimensions = {
    QueueName = aws_sqs_queue.ExecutionJavaQueue.name
  }

  alarm_actions = [
    aws_appautoscaling_policy.ExecutionJavaAutoScalingPolicy.arn
  ]
}

resource "aws_cloudwatch_metric_alarm" "scale_down_sqs_python_queue_alarm" {
  alarm_name          = "scale_down_sqs_python_queue_alarm"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = 3
  period              = 60
  metric_name         = "ApproximateNumberOfMessagesVisible"
  namespace           = "AWS/SQS"
  statistic           = "Average"
  threshold           = 10
  dimensions = {
    QueueName = aws_sqs_queue.ExecutionPythonQueue.name
  }

  alarm_actions = [
    aws_appautoscaling_policy.ExecutionPythonAutoScalingPolicy.arn,
  ]
}

resource "aws_cloudwatch_metric_alarm" "scale_down_sqs_java_queue_alarm" {
  alarm_name          = "scale_down_sqs_java_queue_alarm"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = 3
  period              = 60
  metric_name         = "ApproximateNumberOfMessagesVisible"
  namespace           = "AWS/SQS"
  statistic           = "Average"
  threshold           = 10
  dimensions = {
    QueueName = aws_sqs_queue.ExecutionJavaQueue.name
  }

  alarm_actions = [
    aws_appautoscaling_policy.ExecutionJavaAutoScalingPolicy.arn,
  ]
}

############################################################################
# Output
resource "null_resource" "summary_execution" {
  provisioner "local-exec" {
    command = <<EOT
      echo "==== OpenJudge Execution Deployment Complete! ===="
      echo "Execution Image Repo URL: ${aws_ecr_repository.open-judge-ecr.repository_url}"
      echo ""
    EOT
  }
}

############################################################################
