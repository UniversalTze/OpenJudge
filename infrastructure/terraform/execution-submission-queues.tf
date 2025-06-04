# Terraform for creating sqs queues between the submission
# and execution service per language.

############################################################################
# Queue Policies
# ...TODO

############################################################################
# Results Queue
resource "aws_sqs_queue" "ExecutionResultsQueue" {
  name = "outputq"
}

############################################################################
# Submission Queues

# Python
resource "aws_sqs_queue" "ExecutionPythonQueue" {
  name = "pythonq"
}

# Java
resource "aws_sqs_queue" "ExecutionJavaQueue" {
  name = "javaq"
}

############################################################################
# Output
resource "null_resource" "summary" {
  provisioner "local-exec" {
    command = <<EOT
      echo "==== OpenJudge Execution-Submission Queues Deployment Complete! ===="
      echo "Results Queue Name: ${aws_sqs_queue.ExecutionResultsQueue.name}"
      echo "Python Queue Name: ${aws_sqs_queue.ExecutionPythonQueue.name}"
      echo "Java Queue Name: ${aws_sqs_queue.ExecutionJavaQueue.name}"
      echo ""
    EOT
  }
}

############################################################################
