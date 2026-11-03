# collector/Dockerfile (multi-arch)
FROM --platform=$BUILDPLATFORM golang:1.26 AS build
ARG TARGETOS TARGETARCH
WORKDIR /usr/src/app

COPY go.mod go.sum ./
RUN go mod download && go mod verify

COPY collector/ ./collector/
COPY internal/ ./internal/
RUN GOOS=$TARGETOS GOARCH=$TARGETARCH CGO_ENABLED=0 \
    go build -trimpath -ldflags="-s -w" -o /usr/src/app/bin/collector ./collector

FROM scratch
WORKDIR /app
COPY --from=build /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/ca-certificates.crt
COPY --from=build /usr/src/app/bin/collector ./collector
COPY --from=build /usr/src/app/collector/sample.json ./data/config.json
ENTRYPOINT ["./collector"]
