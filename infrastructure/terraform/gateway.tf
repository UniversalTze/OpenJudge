############################################################################
# Docker Images
resource "docker_image" "APIGatewayImage" {
  name = "${aws_ecr_repository.open-judge-ecr.repository_url}:gateway-latest"
  build {
    context    = "../../services/gateway"
    dockerfile = "../../infrastructure/docker/Dockerfile.gateway"
  }
}

resource "docker_registry_image" "APIGatewayImageName" {
  name = docker_image.APIGatewayImage.name
}

############################################################################
# Security Group
# TODO - UPDATE THIS TO ACTUALLY BE SECURE!
resource "aws_security_group" "APIGatewaySecurityGroup" {
  name        = "APIGatewaySecurityGroup"
  description = "API Gateway Security Group Controlling External Input/Output"
  vpc_id      = data.aws_vpc.default.id

  # Allows incoming HTTP (Port 80 TCP) traffic from any IP address (0.0.0.0/0)
  ingress {
    from_port       = 8080
    to_port         = 8080
    protocol        = "tcp"
    security_groups = [aws_security_group.APIGatewayLoadBalancerSecurityGroup.id]
    description     = "Allow inbound HTTP from anywhere"
  }

  # Allows outgoing HTTP (Port 80 TCP) traffic to any IP address (0.0.0.0/0)
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1" # -1 means all protocols
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound traffic"
  }
}

############################################################################
# ECS
resource "aws_ecs_service" "APIGatewayService" {
  name            = "APIGatewayService"
  cluster         = aws_ecs_cluster.open-judge-cluster.id
  task_definition = aws_ecs_task_definition.APIGatewayTask.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  depends_on = [
    docker_registry_image.APIGatewayImageName,
    # TODO - ADD IN ALL THE OTHER SERVICES!
  ]

  network_configuration {
    subnets          = data.aws_subnets.private.ids
    security_groups  = [aws_security_group.APIGatewaySecurityGroup.id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.APIGatewayLBTargetGroup.arn
    container_name   = "APIGatewayService"
    container_port   = 8080
  }
}

resource "aws_ecs_task_definition" "APIGatewayTask" {
  family                   = "APIGatewayService"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = 2048
  memory                   = 4096
  execution_role_arn       = data.aws_iam_role.lab.arn
  task_role_arn            = data.aws_iam_role.lab.arn

  container_definitions = jsonencode([
    {
      name      = "APIGatewayService"
      image     = "${docker_image.APIGatewayImage.name}"
      essential = true
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = "/APIGateway"
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
        },
        {
          name  = "JWT_PUBLIC_KEY"
          value = var.JWT_PUBLIC_KEY
        },
        {
          name  = "PROBLEMS_SERVICE_URL"
          value = "http://${aws_lb.ProblemsAPILoadBalancer.dns_name}",
        },
        {
          name  = "FRONTEND_URL"
          value = "http://${aws_lb.FrontendLoadBalancer.dns_name}"
        },
        {
          name  = "AUTH_SERVICE_URL"
          value = "http://${aws_lb.AuthenticationAPILoadBalancer.dns_name}",
        },
        {
          name  = "SUBMISSION_SERVICE_URL"
          value = "http://${aws_lb.SubmissionAPILoadBalancer.dns_name}",
        },
        {
          name  = "REDIS_URL"
          value = "redis://${aws_elasticache_replication_group.TokenRevocationList.primary_endpoint_address}:${aws_elasticache_replication_group.TokenRevocationList.port}",
        }
      ]
    }
  ])
}

########################################################################################
# Load Balancer 
# TODO - FRONT END NEEDS TO ACCESS THIS!
resource "aws_lb" "APIGatewayLoadBalancer" {
  name               = "APIGatewayLoadBalancer"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.APIGatewayLoadBalancerSecurityGroup.id]
  subnets            = data.aws_subnets.private.ids
}

# resource "aws_lb_listener" "APIGatewayLoadBalancerListener" {
#   load_balancer_arn = aws_lb.APIGatewayLoadBalancer.arn
#   port              = 80
#   protocol          = "HTTP"

#   default_action {
#     type             = "forward"
#     target_group_arn = aws_lb_target_group.APIGatewayLBTargetGroup.arn
#   }
# }

resource "aws_lb_listener" "APIGatewayLoadBalancerListener" {
  load_balancer_arn = aws_lb.APIGatewayLoadBalancer.arn
  port              = "443"
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS-1-2-2017-01"
  certificate_arn   = aws_acm_certificate_validation.api_cert_validation.certificate_arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.APIGatewayLBTargetGroup.arn
  }
}

resource "aws_lb_listener" "APIGatewayHTTPSRedirect" {
  load_balancer_arn = aws_lb.APIGatewayLoadBalancer.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type = "redirect"

    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}


resource "aws_lb_target_group" "APIGatewayLBTargetGroup" {
  name        = "APIGatewayLBTargetGroup"
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

# TODO - UPDATE THIS TO ACTUALLY BE SECURE!
resource "aws_security_group" "APIGatewayLoadBalancerSecurityGroup" {
  name        = "APIGatewayLoadBalancerSecurityGroup"
  description = "API Gateway LB Security Group Controlling External Input/Output"
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
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow outbound HTTP to anywhere"
  }
}

############################################################################
# Token Revocation List (Redis Cache)
resource "aws_elasticache_replication_group" "TokenRevocationList" {
  replication_group_id       = "TokenRevocationList"
  description                = "TokenRevocationList"
  node_type                  = "cache.t3.medium"
  num_cache_clusters         = 1
  port                       = 6379
  engine                     = "redis"
  engine_version             = "7.0"
  parameter_group_name       = "default.redis7"
  subnet_group_name          = aws_elasticache_subnet_group.TokenRevocationListSubnetGroup.name
  security_group_ids         = [aws_security_group.TokenRevocationListSecurityGroup.id]
  automatic_failover_enabled = false
  transit_encryption_enabled = true
}

resource "aws_elasticache_subnet_group" "TokenRevocationListSubnetGroup" {
  name       = "TokenRevocationListSubnetGroup"
  subnet_ids = data.aws_subnets.private.ids
}

resource "aws_security_group" "TokenRevocationListSecurityGroup" {
  name   = "TokenRevocationListSecurityGroup"
  vpc_id = data.aws_vpc.default.id

  ingress {
    from_port       = 6379
    to_port         = 6379
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

############################################################################
# Autoscaling
resource "aws_appautoscaling_target" "APIGatewayAutoScalingTarget" {
  max_capacity       = 3
  min_capacity       = 1
  resource_id        = "service/${aws_ecs_cluster.open-judge-cluster.name}/${aws_ecs_service.APIGatewayService.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

resource "aws_appautoscaling_policy" "APIGatewayAutoScalingPolicy" {
  name               = "APIGatewayAutoScalingPolicy"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.APIGatewayAutoScalingTarget.resource_id
  scalable_dimension = aws_appautoscaling_target.APIGatewayAutoScalingTarget.scalable_dimension
  service_namespace  = aws_appautoscaling_target.APIGatewayAutoScalingTarget.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    target_value       = 50.0
    scale_out_cooldown = 60
  }
}

############################################################################
# Output TODO
resource "null_resource" "summary_gateway" {
  provisioner "local-exec" {
    command = <<EOT
      echo "==== OpenJudge Gateway Deployment Complete! ===="
      echo ""
    EOT
  }
}
