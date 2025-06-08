############################################################################
# Route 53 Zone
data "aws_route53_zone" "main" {
  name         = "openjudge.software"
  private_zone = false
}

############################################################################
# HTTPS Certificates
resource "aws_acm_certificate" "frontend_cert" {
  domain_name       = "www.openjudge.software"
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_acm_certificate" "api_cert" {
  domain_name       = "api.openjudge.software"
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

############################################################################
# Certificate Validation Records
resource "aws_route53_record" "frontend_cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.frontend_cert.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      type   = dvo.resource_record_type
      record = dvo.resource_record_value
    }
  }

  zone_id = data.aws_route53_zone.main.zone_id
  name    = each.value.name
  type    = each.value.type
  ttl     = 60
  records = [each.value.record]

  allow_overwrite = true
}

resource "aws_route53_record" "api_cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.api_cert.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      type   = dvo.resource_record_type
      record = dvo.resource_record_value
    }
  }

  zone_id = data.aws_route53_zone.main.zone_id
  name    = each.value.name
  type    = each.value.type
  ttl     = 60
  records = [each.value.record]

  allow_overwrite = true
}

resource "aws_acm_certificate_validation" "frontend_cert_validation" {
  certificate_arn         = aws_acm_certificate.frontend_cert.arn
  validation_record_fqdns = [for record in aws_route53_record.frontend_cert_validation : record.fqdn]

  timeouts {
    create = "5m"
  }
}

resource "aws_acm_certificate_validation" "api_cert_validation" {
  certificate_arn         = aws_acm_certificate.api_cert.arn
  validation_record_fqdns = [for record in aws_route53_record.api_cert_validation : record.fqdn]

  timeouts {
    create = "5m"
  }
}

resource "aws_route53_record" "www" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = "www"
  type    = "A"

  alias {
    name                   = aws_lb.FrontendLoadBalancer.dns_name
    zone_id                = aws_lb.FrontendLoadBalancer.zone_id
    evaluate_target_health = true
  }
}

resource "aws_route53_record" "api" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = "api"
  type    = "A"

  alias {
    name                   = aws_lb.APIGatewayLoadBalancer.dns_name
    zone_id                = aws_lb.APIGatewayLoadBalancer.zone_id
    evaluate_target_health = true
  }
}
