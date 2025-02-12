# Build

FROM golang:1.23.6-alpine3.21 AS build

WORKDIR /usr/src/app

COPY go.mod go.sum ./
RUN go mod download && go mod verify

COPY . .
RUN go build ./server/main.go

# Production

FROM alpine:3.21 AS prod
WORKDIR /usr/src/app

COPY --from=build /usr/src/app/main /usr/src/app/server
ENTRYPOINT ["./server"]
