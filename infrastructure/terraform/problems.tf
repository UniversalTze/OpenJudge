############################################################################
# Docker Images
resource "docker_image" "problemsAPIImage" {
  name = "${aws_ecr_repository.open-judge-ecr.repository_url}:Problems-latest"
  build {
    context    = "../../services/problems"
    dockerfile = "../infrastructure/docker/Dockerfile.problems"
  }
}

resource "docker_registry_image" "ProblemAPIImageName" {
  name = docker_image.problemsAPIImage.name
}

############################################################################
# Problem Database
resource "aws_db_instance" "ProblemDatabase" {
  identifier                   = "problems-db"
  allocated_storage            = 20
  max_allocated_storage        = 1000
  engine                       = "postgres"
  engine_version               = "15"
  instance_class               = "db.t3.micro"
  db_name                      = var.PROBLEMS_DATABASE_NAME
  username                     = var.PROBLEMS_DATABASE_USER
  password                     = var.PROBLEMS_DATABASE_PASSWORD
  parameter_group_name         = "default.postgres15"
  skip_final_snapshot          = true
  vpc_security_group_ids       = [aws_security_group.ProblemDatabaseSecurityGroup.id]
  publicly_accessible          = false
  performance_insights_enabled = true
}

resource "aws_security_group" "ProblemDatabaseSecurityGroup" {
  name = "ProblemDatabaseSecurityGroup"

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.problems_security_group.id]
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

resource "aws_ecs_service" "ProblemAPI" {
  name            = "ProblemAPI"
  cluster         = aws_ecs_cluster.open-judge-cluster.id
  task_definition = aws_ecs_task_definition.ProblemsAPITask.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  depends_on = [
    aws_db_instance.ProblemDatabase,
    docker_registry_image.ProblemAPIImageName,
    aws_lb_listener.ProblemsAPILoadBalancerListener
  ]

  network_configuration {
    subnets          = data.aws_subnets.private.ids
    security_groups  = [aws_security_group.problems_security_group.id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.ProblemAPILoadBalancerTargetGroup.arn
    container_name   = "ProblemAPI"
    container_port   = 6400
  }
}

resource "aws_ecs_task_definition" "ProblemsAPITask" {
  family                   = "ProblemAPI"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = 1024
  memory                   = 2048
  execution_role_arn       = data.aws_iam_role.lab.arn
  task_role_arn            = data.aws_iam_role.lab.arn

  container_definitions = jsonencode([
    {
      name      = "ProblemsAPI"
      image     = "${docker_image.problemsAPIImage.name}"
      essential = true
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = "/ProblemsAPI"
          "awslogs-region"        = var.AWS_REGION
          "awslogs-stream-prefix" = "ecs"
          "awslogs-create-group"  = "true"
        }
      }
      portMappings = [
        {
          containerPort = 6400
          hostPort      = 6400
        }
      ]
      environment = [
        {
          name  = "ENV"
          value = "production"
        },
        {
          name  = "FRONTEND_URL"
          value = "http://${aws_lb.FrontendLoadBalancer.dns_name}"
        },
        {
          name  = "AUTH_SERVICE_URL"
          value = "http://${aws_lb.AuthenticationAPILoadBalancer.dns_name}"
        },
        {
          name  = "SQLALCHEMY_DATABASE_URI"
          value = "postgresql+asyncpg://${var.PROBLEMS_DATABASE_USER}:${var.PROBLEMS_DATABASE_PASSWORD}@${aws_db_instance.ProblemDatabase.endpoint}/${var.PROBLEMS_DATABASE_NAME}"
        }
      ]
    }
  ])
}

resource "aws_security_group" "problems_security_group" {
  name        = "problem security group"
  description = "Problems security Group for inbound and outbound communication"

  ingress {
    from_port       = 6400
    to_port         = 6400
    protocol        = "tcp"
    cidr_blocks     = ["0.0.0.0/0"]
    security_groups = [aws_security_group.ProblemAPILoadBalancerSecurityGroup.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

########################################################################################
# Load Balancer
resource "aws_lb" "ProblemsAPILoadBalancer" {
  name               = "ProblemsAPILoadBalancer"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.ProblemAPILoadBalancerSecurityGroup.id]
  subnets            = data.aws_subnets.private.ids
}

resource "aws_lb_listener" "ProblemsAPILoadBalancerListener" {
  load_balancer_arn = aws_lb.ProblemsAPILoadBalancer.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.ProblemAPILoadBalancerTargetGroup.arn
  }
}

resource "aws_lb_target_group" "ProblemAPILoadBalancerTargetGroup" {
  name        = "ProblemAPILBTargetGroup"
  port        = 6400
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

resource "aws_security_group" "ProblemAPILoadBalancerSecurityGroup" {
  name   = "ProblemAPILoadBalancerSecurityGroup"
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
# Autoscaling TODO

############################################################################
# Output
resource "null_resource" "summary_problem" {
  provisioner "local-exec" {
    command = <<EOT
      echo "==== OpenJudge Problem Deployment Complete! ===="
      echo "Problem API Image Repository URL: ${aws_ecr_repository.open-judge-ecr.repository_url}"
      echo "Problem API URL: http://${aws_lb.ProblemsAPILoadBalancer.dns_name}"
      echo "Database URI: "postgresql+asyncpg://${var.PROBLEMS_DATABASE_USER}:${var.PROBLEMS_DATABASE_PASSWORD}@${aws_db_instance.ProblemDatabase.endpoint}/${var.PROBLEMS_DATABASE_NAME}"
      echo ""
    EOT
  }
}

############################################################################
