package main

import (
	"context"
	"database/sql"
	"errors"
	"log"
	"net/http"
	"os"

	"github.com/Gabryjiel/solar-system/internal"
	"github.com/Gabryjiel/solar-system/server/mytemplates"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

func main() {
	workingDir, err := os.Getwd()

	if err != nil {
		log.Fatal(err)
	}

	err = godotenv.Load(workingDir + "/.env")

	if err != nil {
		log.Fatal("Error loading .env file from", workingDir+"/.env")
	}
	log.Println("[Collector] Env file loaded")

	db, err := sql.Open("postgres", os.Getenv("DB_URL"))

	if err != nil {
		panic(err)
	}
	defer db.Close()
	log.Println("[Collector] Database connected")

	fileServer := http.FileServer(http.Dir("./server/static"))
	staticHandler := http.StripPrefix("/static", fileServer)

	mux := http.NewServeMux()
	mux.Handle("GET /static/", staticHandler)
	mux.Handle("GET /", handlerHomepage(db))
	err = http.ListenAndServe(":8888", mux)

	if errors.Is(err, http.ErrServerClosed) {
		log.Println("Server closed")
	} else if err != nil {
		log.Println("Error starting server: ", err)
	}
}

func handlerHomepage(db *sql.DB) http.Handler {
	return http.HandlerFunc(func(res http.ResponseWriter, req *http.Request) {
		var log internal.Row

		row := db.QueryRow("SELECT * FROM logs ORDER BY timestamp DESC LIMIT 1;")
		err := row.Scan(
			&log.Id,
			&log.Cover_sta_rssi,
			&log.Timestamp,
			&log.Energy_total,
			&log.Energy_today,
			&log.Power_now,
			&log.Utime,
			&log.Alarm,
		)

		if err != nil {
			panic(err)
		}

		_ = mytemplates.Home(log).Render(context.Background(), res)	
	})
}
