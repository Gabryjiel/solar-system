# Build
FROM golang:1.23.6-alpine3.21 AS build
WORKDIR /usr/src/app
COPY go.mod go.sum ./
RUN go install github.com/a-h/templ/cmd/templ@latest
RUN go mod download && go mod verify
COPY . .
RUN ["templ", "generate"]
RUN go build ./server/main.go


# Production
FROM alpine:3.21 AS prod
WORKDIR /usr/src/app
COPY --from=build /usr/src/app/main ./server
ENTRYPOINT ["./server"]
