package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"os"
	"strconv"
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
		start := req.URL.Query().Get("start")
		end := req.URL.Query().Get("end")

		if start == "" {
			start = internal.StartOfDay(now).Format(time.RFC1123)
		}
		if end == "" {
			end = internal.EndOfDay(now).Format(time.RFC1123)
		}

		rows, err := db.Query(`
			SELECT max(energy_today), EXTRACT(HOUR from timestamp) 
			FROM logs
			WHERE timestamp > $1 AND timestamp < $2
			GROUP BY EXTRACT(HOUR from timestamp);`,
			start,
			end,
		)

		if err != nil {
			log.Println("[Handler] Failed: ", err)
			return
		}

		data := make([]internal.TimeValue, 0)

		for rows.Next() {
			var entry internal.TimeValue
			err = rows.Scan(&entry.Value, &entry.Key)

			if err != nil {
				log.Println("[Handler] Failed: ", err)
				continue
			}

			data = append(data, entry)
		}

		dataStr := make([]mytemplates.EnergyTemplProps, len(data))
		for index, item := range data {
			key := strconv.Itoa(item.Key + 1)

			if len(key) < 2 {
				key = "0" + key
			}

			prevValue := 0.0
			if index > 0 {
				prevValue = data[index-1].Value
			}

			delta := item.Value - prevValue
			dataStr[index].Key = key + ":00"
			dataStr[index].Value = strconv.FormatFloat(item.Value, 'f', 2, 64)
			dataStr[index].Delta = strconv.FormatFloat(delta, 'f', 2, 64)

			if delta > 0 {
				dataStr[index].Delta = "+" + dataStr[index].Delta
			}
		}

		_ = mytemplates.Energy(dataStr).Render(context.Background(), res)
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
