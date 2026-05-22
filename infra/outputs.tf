# ============================================================
#  outputs.tf  ->  va en infra/  (junto a main.tf)
#  Lo que Terraform imprime al terminar. La URL del entorno es
#  donde veras tu app desplegada.
# ============================================================

output "app_url" {
  description = "URL publica de la aplicacion desplegada"
  value       = "http://${aws_elastic_beanstalk_environment.nexus_env.cname}"
}
