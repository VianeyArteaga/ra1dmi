group "default" {
  targets = ["validacion"]
}

target "validacion" {
  context = "."
  dockerfile = "Dockerfile"
  tags = ["mjtaehyung/sitio002:latest"]
}
