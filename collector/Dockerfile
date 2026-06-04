# collector/Dockerfile (multi-arch)
FROM --platform=$BUILDPLATFORM golang:1.23.6-alpine3.21 AS build
ARG TARGETOS TARGETARCH
WORKDIR /usr/src/app

COPY go.mod go.sum ./
RUN go mod download && go mod verify

COPY collector/ ./collector/
COPY internal/ ./internal/
RUN GOOS=$TARGETOS GOARCH=$TARGETARCH go build -o collector ./collector

FROM alpine:3.21
WORKDIR /usr/src/app
COPY --from=build /usr/src/app/collector .
ENTRYPOINT ["./collector"]
