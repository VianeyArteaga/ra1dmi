group "default" {
  targets = ["sitio002"]
}

target "validacion" {
  context = "."
  dockerfile = "Dockerfile"
  tags = ["mjtaehyung/sitio002:latest"]
  
}
