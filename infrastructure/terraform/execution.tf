############################################################################
# Docker Images
resource "docker_image" "ExecutionPythonImage" {
  name = "${aws_ecr_repository.open-judge-ecr.repository_url}:execution-python-latest"
  build {
    context    = "../../services/execution"
    dockerfile = "../../infrastructure/docker/execution/Dockerfile.python"
  }
}

resource "docker_image" "ExecutionJavaImage" {
  name = "${aws_ecr_repository.open-judge-ecr.repository_url}:execution-java-latest"
  build {
    context    = "../../services/execution"
    dockerfile = "../../infrastructure/docker/execution/Dockerfile.java"
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

  # TODO - We can probably just remove this useless ingress block
  ingress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = []
    description = "No inbound traffic allowed"
  }

  # TODO - SET UP SO ONLY SQS TRAFFIC ALLOWED - THIS IS STILL BROADER THAN NECESSARY!
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
# ECS Cluster

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
    assign_public_ip = true # TODO - CHANGE THIS TO A NAT GATEWAY INSTEAD!
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
        # TODO - ADD IN SANDBOX VARIABLE!!!
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
    assign_public_ip = true # TODO - CHANGE THIS TO A NAT GATEWAY INSTEAD!
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
        # TODO - ADD IN SANDBOX VARIABLE!!!
      ]
    }
  ])
}

############################################################################
# Autoscaling

# Python
resource "aws_appautoscaling_target" "ExecutionPythonAutoScalingTarget" {
  max_capacity       = 3
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

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    target_value       = 50.0
    scale_out_cooldown = 60
  }
}

# Java
resource "aws_appautoscaling_target" "ExecutionJavaAutoScalingTarget" {
  max_capacity       = 3
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
# TODO - ADD IN SQS QUEUE BASED ALARM FOR EACH LANGUAGE!

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
