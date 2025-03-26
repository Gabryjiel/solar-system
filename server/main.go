package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/Gabryjiel/solar-system/internal"
	"github.com/Gabryjiel/solar-system/server/handlers"
	"github.com/Gabryjiel/solar-system/server/mytemplates"
	"github.com/Gabryjiel/solar-system/server/utils"
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
	mux.Handle("GET /energy", handleEnergy(db))
	mux.Handle("GET /total", handleTotal(db))
	mux.Handle("GET /power", handlePower(db))
	mux.Handle("GET /api/{kind}/{interval}", handleGeneralRequest(db))
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

func handleEnergy(db *sql.DB) http.Handler {
	return http.HandlerFunc(func(res http.ResponseWriter, req *http.Request) {
		now := time.Now()
		start := utils.GetStringParamFormQuery(req, "start", now.Format(time.DateOnly))
		end := utils.GetStringParamFormQuery(req, "end", now.AddDate(0, 0, 1).Format(time.DateOnly))
		interval := utils.GetStringParamFormQuery(req, "interval", "hour")

		data := handlers.GeneralGetBy(db, "energy_today", interval, start, end)

		newData := utils.AddDelta(data)
		_ = mytemplates.Energy(newData).Render(context.Background(), res)
	})
}

func handleGeneralRequest(db *sql.DB) http.Handler {
	return http.HandlerFunc(func(res http.ResponseWriter, req *http.Request) {
		now := time.Now()
		start := utils.GetStringParamFormQuery(req, "start", now.Format(time.DateOnly))
		end := utils.GetStringParamFormQuery(req, "end", now.AddDate(0, 0, 1).Format(time.DateOnly))
		kind := req.PathValue("kind")
		interval := req.PathValue("interval")

		switch kind {
		case "energy_total":
		case "energy_today":
		case "power_now":
		default:
			http.NotFound(res, req)
			return
		}

		switch interval {
		case "year":
		case "month":
		case "day":
		case "hour":
		default:
			http.NotFound(res, req)
			return
		}

		data := handlers.GeneralGetBy(db, kind, interval, start, end)
		err := json.NewEncoder(res).Encode(data)
		if err != nil {
			http.Error(res, err.Error(), http.StatusInternalServerError)
		}
	})
}

func handleTotal(db *sql.DB) http.Handler {
	return http.HandlerFunc(func(res http.ResponseWriter, req *http.Request) {
		// _ = mytemplates.Energy().Render(context.Background(), res)
	})
}

func handlePower(db *sql.DB) http.Handler {
	return http.HandlerFunc(func(res http.ResponseWriter, req *http.Request) {
		// _ = mytemplates.Energy().Render(context.Background(), res)
	})
}
