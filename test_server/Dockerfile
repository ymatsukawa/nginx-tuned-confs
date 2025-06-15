FROM golang:1.24.3

WORKDIR /app

COPY go.mod ./
RUN go mod download

COPY . .

RUN go build -o main .
