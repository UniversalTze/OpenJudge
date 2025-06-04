# Terraform for creating sqs queues between the submission
# and execution service per language.

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
# TODO - ADD QUEUE POLICIES TO ONLY ALLOW INPUT FROM SUBMISSION SERVICE
# AND EXECUTION SERVICE!
