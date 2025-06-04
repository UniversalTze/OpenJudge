############################################################################
# Docker Image
resource "docker_image" "AuthenticationAPIImage" {
  name = "${aws_ecr_repository.open-judge-ecr.repository_url}:authentication-latest"
  build {
    context    = "../../services/auth"
    dockerfile = "../../infrastructure/docker/Dockerfile.authentication"
  }
}

resource "docker_registry_image" "AuthenticationAPIImageName" {
  name = docker_image.AuthenticationAPIImage.name
}

############################################################################
# UserDatabase
resource "aws_db_instance" "UserDatabase" {
  identifier                   = "UserDatabase"
  allocated_storage            = 20
  max_allocated_storage        = 1000
  engine                       = "postgres"
  engine_version               = "15"
  instance_class               = "db.t3.medium"
  db_name                      = var.USER_DATABASE_NAME
  username                     = var.USER_DATABASE_USER
  password                     = var.USER_DATABASE_PASSWORD
  parameter_group_name         = "default.postgres15"
  skip_final_snapshot          = true
  vpc_security_group_ids       = [aws_security_group.UserDatabaseSecurityGroup.id]
  publicly_accessible          = false
  performance_insights_enabled = true
}

resource "aws_security_group" "UserDatabaseSecurityGroup" {
  name = "UserDatabaseSecurityGroup"

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.AuthenticationAPISecurityGroup.id]
  }

  egress {
    from_port        = 0
    to_port          = 0
    protocol         = "-1"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }
}

############################################################################
# ECS
resource "aws_ecs_cluster" "AuthenticationServiceCluster" {
  name = "AuthenticationServiceCluster"
}

resource "aws_ecs_service" "AuthenticationAPI" {
  name            = "AuthenticationAPI"
  cluster         = aws_ecs_cluster.AuthenticationServiceCluster.id
  task_definition = aws_ecs_task_definition.AuthenticationAPI.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  depends_on = [
    aws_db_instance.UserDatabase,
    docker_registry_image.AuthenticationAPIImageName,
    aws_lb_listener.AuthenticationAPILoadBalancerListener
  ]

  network_configuration {
    subnets          = data.aws_subnets.private.ids
    security_groups  = [aws_security_group.AuthenticationAPISecurityGroup.id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.AuthenticationAPILoadBalancerTargetGroup.arn
    container_name   = "AuthenticationAPI"
    container_port   = 8080
  }
}

resource "aws_ecs_task_definition" "AuthenticationAPITask" {
  family                   = "AuthenticationAPI"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = 2048
  memory                   = 4096
  execution_role_arn       = data.aws_iam_role.lab.arn
  task_role_arn            = data.aws_iam_role.lab.arn

  container_definitions = jsonencode([
    {
      name      = "AuthenticationAPI"
      image     = "${aws_ecr_repository.open-judge-ecr.repository_url}:authentication:latest"
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
          name  = "AUTH_SERVICE_URL"
          value = "http://${aws_lb.AuthenticationAPILoadBalancer.dns_name}"
        },
        {
          name  = "FRONTEND_URL"
          value = "http://${aws_lb.FrontendLoadBalancer.dns_name}"
        },
        {
          name  = "JWT_SECRET"
          value = var.JWT_SECRET
        },
        {
          name  = "JWT_PUBLIC_KEY"
          value = var.JWT_PUBLIC_KEY
        },
        {
          name  = "USER_DATABASE_URL"
          value = "postgres://${var.USER_DATABASE_USER}:${var.USER_DATABASE_PASSWORD}@${aws_db_instance.UserDatabase.endpoint}?sslmode=require"
        },
        {
          name  = "SMTP_HOST"
          value = var.SMTP_HOST
        },
        {
          name  = "SMTP_PORT"
          value = var.SMTP_PORT
        },
        {
          name  = "SMTP_USER"
          value = var.SMTP_USER
        },
        {
          name  = "SMTP_PASSWORD"
          value = var.SMTP_PASSWORD
        },
        {
          name  = "SMTP_FROM"
          value = var.SMTP_FROM
        }
      ]
    }
  ])
}

############################################################################
# Load Balancer
resource "aws_lb" "AuthenticationAPILoadBalancer" {
  name               = "AuthenticationAPILoadBalancer"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.AuthenticationAPILoadBalancerSecurityGroup.id]
  subnets            = data.aws_subnets.private.ids
}

resource "aws_lb_listener" "AuthenticationAPILoadBalancerListener" {
  load_balancer_arn = aws_lb.AuthenticationAPILoadBalancer.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.AuthenticationAPILoadBalancerTargetGroup.arn
  }
}

resource "aws_lb_target_group" "AuthenticationAPILoadBalancerTargetGroup" {
  name        = "AuthenticationAPILoadBalancerTargetGroup"
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

resource "aws_security_group" "AuthenticationAPILoadBalancerSecurityGroup" {
  name   = "AuthenticationAPILoadBalancerSecurityGroup"
  vpc_id = data.aws_vpc.default.id

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

############################################################################
# Autoscaling
resource "aws_appautoscaling_target" "AuthenticationAPIAutoScalingTarget" {
  max_capacity       = 3
  min_capacity       = 1
  resource_id        = "service/${aws_ecs_cluster.AuthenticationServiceCluster.name}/${aws_ecs_service.AuthenticationAPI.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

resource "aws_appautoscaling_policy" "AuthenticationAPIAutoScalingPolicy" {
  name               = "AuthenticationAPIAutoScalingPolicy"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.AuthenticationAPIAutoScalingTarget.resource_id
  scalable_dimension = aws_appautoscaling_target.AuthenticationAPIAutoScalingTarget.scalable_dimension
  service_namespace  = aws_appautoscaling_target.AuthenticationAPIAutoScalingTarget.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    target_value       = 50.0
    scale_out_cooldown = 60
  }
}

resource "aws_security_group" "AuthenticationAPISecurityGroup" {
  name   = "AuthenticationAPISecurityGroup"
  vpc_id = data.aws_vpc.default.id

  ingress {
    from_port       = 8080
    to_port         = 8080
    protocol        = "tcp"
    security_groups = [aws_security_group.AuthenticationAPILoadBalancerSecurityGroup.id]
  }

  egress {
    from_port        = 0
    to_port          = 0
    protocol         = "-1"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }
}

############################################################################
# Token Revocation List
resource "aws_elasticache_replication_group" "TokenRevocationList" {
  replication_group_id       = "TokenRevocationList"
  description                = "TokenRevocationList"
  node_type                  = "cache.t3.medium"
  num_cache_clusters         = 1
  port                       = 6379
  engine                     = "redis"
  engine_version             = "7.x"
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
    security_groups = [aws_security_group.AuthenticationAPISecurityGroup.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

############################################################################
# Output
resource "null_resource" "summary_authentication" {
  provisioner "local-exec" {
    command = <<EOT
      echo "==== OpenJudge Authentication Deployment Complete! ===="
      echo "Authentication API Image Repository URL: ${aws_ecr_repository.open-judge-ecr.repository_url}"
      echo "Authentication API URL: http://${aws_lb.AuthenticationAPILoadBalancer.dns_name}"
      echo "Database URL: postgres://${var.USER_DATABASE_USER}:${var.USER_DATABASE_PASSWORD}@${aws_db_instance.UserDatabase.endpoint}?sslmode=require"
      echo "Redis URL: redis://${aws_elasticache_replication_group.TokenRevocationList.primary_endpoint_address}:${aws_elasticache_replication_group.TokenRevocationList.port}"
      echo "S3 Bucket URL: https://${aws_s3_bucket.ObjectStore.bucket}.s3.${var.AWS_REGION}.amazonaws.com"
      echo ""
    EOT
  }
}

############################################################################
