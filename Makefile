build-collector:
	env GOOS=linux GOARCH=arm go build -C ./collector -o ../build/collector_raspberry .

build-local:
	env GOOS=linux GOARCH=amd64 go build -C ./collector -o ../build/collector_local .

docker:
	docker buildx build \
	--platform linux/amd64,linux/arm64,linux/arm/v7 \
  -t your-image:tag \
  -f collector/Dockerfile \
  --load .

templ:
	templ generate -watch -proxy=http://localhost:8888
