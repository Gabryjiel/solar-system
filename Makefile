build-collector:
	env GOOS=linux GOARCH=arm go build -o ./build/collector_raspberry ./collector/collector.go

build-local:
	env GOOS=linux GOARCH=amd64 go build -o ./build/collector_local ./collector/collector.go
