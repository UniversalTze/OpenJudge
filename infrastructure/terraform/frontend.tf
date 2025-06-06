############################################################################
# Docker Image
resource "docker_image" "FrontendImage" {
  name = "${aws_ecr_repository.open-judge-ecr.repository_url}:frontend-latest"
  build {
    context    = "../../services/frontend"
    dockerfile = "../../infrastructure/docker/Dockerfile.frontend"
  }
}

resource "docker_registry_image" "FrontendImageName" {
  name = docker_image.FrontendImage.name
}

############################################################################
# Security Group
# TODO - UPDATE THIS TO ACTUALLY BE SECURE!
resource "aws_security_group" "FrontendSecurityGroup" {
  name        = "FrontendSecurityGroup"
  description = "Frontend Security Group Controlling External Input/Output"
  vpc_id      = data.aws_vpc.default.id

  # Allows incoming HTTP (Port 80 TCP) traffic from any IP address (0.0.0.0/0)
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow inbound HTTP from anywhere"
  }

  # Allows outgoing HTTP (Port 80 TCP) traffic to any IP address (0.0.0.0/0)
  egress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow outbound HTTP to anywhere"
  }
}

############################################################################
# ECS
resource "aws_ecs_service" "FrontendService" {
  name            = "APIGatewayService"
  cluster         = aws_ecs_cluster.open-judge-cluster.id
  task_definition = aws_ecs_task_definition.FrontendTask.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  depends_on = [
    docker_registry_image.FrontendImageName,
    # TODO - ADD IN ALL THE OTHER SERVICES!
  ]

  network_configuration {
    subnets          = data.aws_subnets.private.ids
    security_groups  = [aws_security_group.FrontendSecurityGroup.id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.FrontendLoadBalancerTargetGroup.arn
    container_name   = "FrontendService"
    container_port   = 8080
  }
}

resource "aws_ecs_task_definition" "FrontendTask" {
  family                   = "FrontendService"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = 2048
  memory                   = 4096
  execution_role_arn       = data.aws_iam_role.lab.arn
  task_role_arn            = data.aws_iam_role.lab.arn

  container_definitions = jsonencode([
    {
      name      = "FrontendTask"
      image     = "${docker_image.FrontendImage.name}"
      essential = true
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = "/Frontend"
          "awslogs-region"        = var.AWS_REGION
          "awslogs-stream-prefix" = "ecs"
          "awslogs-create-group"  = "true"
        }
      }
      portMappings = [
        {
          containerPort = 8080
          hostPort      = 8080
        }
      ]
      environment = [
        {
          name  = "ENV"
          value = "production"
        }
        # TODO - ADD IN OTHER ENVIRONMENT VARIABLES!
      ]
    }
  ])
}

############################################################################
# Autoscaling
resource "aws_appautoscaling_target" "FrontendAutoScalingTarget" {
  max_capacity       = 3
  min_capacity       = 1
  resource_id        = "service/${aws_ecs_cluster.open-judge-cluster.name}/${aws_ecs_service.FrontendService.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

resource "aws_appautoscaling_policy" "FrontendAutoScalingPolicy" {
  name               = "FrontendAutoScalingPolicy"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.FrontendAutoScalingTarget.resource_id
  scalable_dimension = aws_appautoscaling_target.FrontendAutoScalingTarget.scalable_dimension
  service_namespace  = aws_appautoscaling_target.FrontendAutoScalingTarget.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    target_value       = 50.0
    scale_out_cooldown = 60
  }
}

############################################################################
# Load Balancer
resource "aws_lb" "FrontendLoadBalancer" {
  name               = "FrontendLoadBalancer"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.FrontendLoadBalancerSecurityGroup.id]
  subnets            = data.aws_subnets.private.ids
}

resource "aws_lb_listener" "FrontendLoadBalancerListener" {
  load_balancer_arn = aws_lb.FrontendLoadBalancer.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.FrontendLoadBalancerTargetGroup.arn
  }
}

resource "aws_lb_target_group" "FrontendLoadBalancerTargetGroup" {
  name        = "FrontendLoadBalancerTargetGroup"
  port        = 8080
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

# # TODO - UPDATE THIS TO ACTUALLY BE SECURE!
resource "aws_security_group" "FrontendLoadBalancerSecurityGroup" {
  name        = "FrontendLoadBalancerSecurityGroup"
  description = "Frontend LB Security Group Controlling External Input/Output"
  vpc_id      = data.aws_vpc.default.id

  # Allows incoming HTTP (Port 80 TCP) traffic from any IP address (0.0.0.0/0)
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow inbound HTTP from anywhere"
  }

  # Allows outgoing HTTP (Port 80 TCP) traffic to any IP address (0.0.0.0/0)
  egress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow outbound HTTP to anywhere"
  }
}

############################################################################
# Output TODO
resource "null_resource" "summary_frontend" {
  provisioner "local-exec" {
    command = <<EOT
      echo "==== OpenJudge Frontend Deployment Complete! ===="
      echo ""
    EOT
  }
}

############################################################################
