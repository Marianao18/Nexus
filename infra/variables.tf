# ============================================================
#  variables.tf  ->  va en infra/  (junto a main.tf)
#  Define las variables. Los valores SENSIBLES NO se ponen aqui;
#  Jenkins los inyecta como TF_VAR_<nombre> desde sus Credentials.
# ============================================================

variable "aws_region" {
  description = "Region de AWS"
  type        = string
  default     = "us-east-1"
}

variable "solution_stack" {
  description = "Plataforma de Elastic Beanstalk (Docker sobre Amazon Linux 2023)"
  type        = string
  # Verifica el nombre exacto vigente con:
  #   aws elasticbeanstalk list-available-solution-stacks --query "SolutionStacks" --output text | grep -i docker
  default     = "64bit Amazon Linux 2023 v4.6.4 running Docker"
}

# ---- Base de datos ----
variable "db_name" {
  type    = string
  default = "nexus_db"
}

variable "db_user" {
  type    = string
  default = "nexus_user"
}

variable "db_password" {
  # La BD corre como contenedor postgres (ver docker-compose.yml).
  # Esta password configura ese contenedor. Inyectada por Jenkins.
  description = "Password de la BD (inyectada por Jenkins, NO se escribe aqui)"
  type        = string
  sensitive   = true
}

# ---- Secretos de la app ----
variable "secret_key" {
  description = "SECRET_KEY de Django"
  type        = string
  sensitive   = true
}

variable "email_host_user" {
  type      = string
  sensitive = true
}

variable "email_host_password" {
  description = "App password de Gmail (REGENERALA, la anterior quedo expuesta)"
  type        = string
  sensitive   = true
}

variable "anthropic_api_key" {
  description = "API key de Claude (REGENERALA, la anterior quedo expuesta)"
  type        = string
  sensitive   = true
}
