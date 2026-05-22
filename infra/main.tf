# ============================================================
#  main.tf  ->  va en infra/  (carpeta de Terraform en tu repo)
#  Provisiona la infraestructura PaaS en AWS:
#   - Aplicacion + Entorno de Elastic Beanstalk (plataforma Docker)
#  La base de datos PostgreSQL corre como contenedor dentro del
#  mismo entorno (ver docker-compose.yml) -> opcion barata y simple.
#  Jenkins ejecutara 'terraform apply' en el stage de IaC.
# ============================================================

terraform {
  required_version = ">= 1.5"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Guarda el estado de Terraform en S3 (recomendado para CI/CD).
  # Crea el bucket ANTES (lo explicamos en la guia). Si prefieres
  # empezar simple, comenta este bloque y el estado quedara local.
  backend "s3" {
    bucket = "nexus-terraform-state-619891987841"
    key    = "nexus/terraform.tfstate"
    region = "us-east-1"
  }
}

provider "aws" {
  region = var.aws_region
}

# ------------------------------------------------------------
#  1) Aplicacion de Elastic Beanstalk (el "contenedor logico")
# ------------------------------------------------------------
resource "aws_elastic_beanstalk_application" "nexus" {
  name        = "nexus-app"
  description = "Aplicacion Nexus (Django + React) desplegada via CI/CD"
}

# ------------------------------------------------------------
#  2) Entorno de Elastic Beanstalk (la infra que CORRE la app)
# ------------------------------------------------------------
resource "aws_elastic_beanstalk_environment" "nexus_env" {
  name                = "nexus-env"
  application         = aws_elastic_beanstalk_application.nexus.name
  solution_stack_name = var.solution_stack
  tier                = "WebServer"

  # ---- Tipo de instancia ----
  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "InstanceType"
    value     = "t3.small"
  }

  # ---- Rol de instancia (perfil IAM que usa el EC2 de EB) ----
  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "IamInstanceProfile"
    value     = "aws-elasticbeanstalk-ec2-role"
  }

  # ---- Entorno de un solo servidor (mas barato para clase) ----
  setting {
    namespace = "aws:elasticbeanstalk:environment"
    name      = "EnvironmentType"
    value     = "SingleInstance"
  }

  # ============================================================
  #  Variables de entorno que recibe la app (docker-compose)
  #  Los valores sensibles vienen de variables Terraform, que a
  #  su vez Jenkins pasa como TF_VAR_... (nunca en el repo)
  # ============================================================
  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "SECRET_KEY"
    value     = var.secret_key
  }
  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "DEBUG"
    value     = "False"
  }
  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "DB_NAME"
    value     = var.db_name
  }
  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "DB_USER"
    value     = var.db_user
  }
  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "DB_PASSWORD"
    value     = var.db_password
  }
  # OJO: DB_HOST ya NO apunta a un RDS. Lo define el docker-compose
  # como el servicio 'db'. No hace falta pasarlo aqui.
  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "EMAIL_HOST_USER"
    value     = var.email_host_user
  }
  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "EMAIL_HOST_PASSWORD"
    value     = var.email_host_password
  }
  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "ANTHROPIC_API_KEY"
    value     = var.anthropic_api_key
  }

  tags = {
    Project = "Nexus"
  }
}

# ============================================================
#  OPCIONAL: base de datos RDS gestionada
#  Si tu docente luego exige una BD "de verdad", descomenta
#  esto, quita el servicio 'db' del docker-compose y agrega
#  un setting DB_HOST = aws_db_instance.nexus_db.address
# ============================================================
# resource "aws_db_instance" "nexus_db" {
#   identifier             = "nexus-db"
#   engine                 = "postgres"
#   engine_version         = "16"
#   instance_class         = "db.t3.micro"
#   allocated_storage      = 20
#   db_name                = var.db_name
#   username               = var.db_user
#   password               = var.db_password
#   publicly_accessible    = false
#   skip_final_snapshot    = true
#   vpc_security_group_ids = [aws_security_group.nexus_db_sg.id]
# }
#
# resource "aws_security_group" "nexus_db_sg" {
#   name        = "nexus-db-sg"
#   description = "Permite acceso PostgreSQL desde Elastic Beanstalk"
#   ingress {
#     from_port   = 5432
#     to_port     = 5432
#     protocol    = "tcp"
#     cidr_blocks = ["0.0.0.0/0"]
#   }
#   egress {
#     from_port   = 0
#     to_port     = 0
#     protocol    = "-1"
#     cidr_blocks = ["0.0.0.0/0"]
#   }
# }
