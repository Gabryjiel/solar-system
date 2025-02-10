# Build

FROM golang:1.23.6-alpine3.21 AS build

WORKDIR /usr/src/app

COPY go.mod go.sum ./
RUN go mod download && go mod verify

COPY . .
RUN go build -o ./collector ./collector/main.go

# Production

FROM golang:1.23.6-alpine3.21 AS prod
WORKDIR /usr/src/app

COPY --from=build /usr/src/app/collector /usr/src/app/collector

CMD ["collector"]
