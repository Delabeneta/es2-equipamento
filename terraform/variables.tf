variable "commit" {default = ""}

locals {
  commit = var.commit
  docker_image = "joaocansi/es2-equipamento"
}