group "default" {
  targets = ["sitio002"]
}

target "sitio002" {
  context = "."
  dockerfile = "Dockerfile"
  tags = ["mjtaehyung/sitio002:latest"]
}
