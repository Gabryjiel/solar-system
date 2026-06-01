build-collector:
	env GOOS=linux GOARCH=arm go build -C ./collector -o ../build/collector_raspberry .

build-local:
	env GOOS=linux GOARCH=amd64 go build -C ./collector -o ../build/collector_local .

templ:
	templ generate -watch -proxy=http://localhost:8888
