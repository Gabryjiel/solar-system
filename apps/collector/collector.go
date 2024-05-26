package main

import (
	"database/sql"
	"errors"
	"io"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

type Row struct {
	power_now float64
	energy_total float64
	energy_today float64
	alarm string
	utime float64
	cover_sta_rssi string
	timestamp time.Time
}

func main() {
	err := godotenv.Load(".env")

	if err != nil {
		log.Fatal("Error loading .env file")
	}
	log.Println("[Collector] Env file loaded")

	db, err := sql.Open("postgres", os.Getenv("DB_URL"))

	if err != nil {
		panic(err.Error())
	}
	defer db.Close()
	log.Println("[Collector] Database connected")

	initDb(db)

	ticker := time.Tick(10 * time.Second)
	for range ticker {
		row, err := getRow()

		if err != nil {
			log.Println(err)
			continue
		}

		lastId, err := insertRow(db, &row)

		if err != nil {
			log.Println(err)
			continue
		}

		log.Println("Inserted row with id", lastId)
	}
}

func insertRow(db *sql.DB, row *Row) (int64, error) {
	var lastId int64

	err := db.QueryRow(
		`INSERT INTO logs (
		cover_sta_rssi,
		timestamp,
		energy_today,
		energy_total,
		power_now,
		utime,
		alarm			
		) VALUES (
		$1,
		$2,
		$3,
		$4,
		$5,	
		$6,
		$7
		) RETURNING id;`,
		row.cover_sta_rssi,
		row.timestamp.Format(time.RFC3339),
		row.energy_today,
		row.energy_total,
		row.power_now,
		row.utime,
		row.alarm,
		).Scan(&lastId)

	return lastId, err
}

func initDb(db *sql.DB) {
	_, err := db.Exec(`CREATE TABLE IF NOT EXISTS logs (
		id SERIAL NOT NULL,
		cover_sta_rssi VARCHAR(8),
		timestamp timestamp,
		energy_total double precision,
		energy_today numeric(5, 2),
		power_now numeric(6, 2),
		utime VARCHAR(8),
		alarm VARCHAR(8),
		PRIMARY KEY (id)
	);`)

	if err != nil {
		log.Println("[initDB] Failed to initialize database: ", err.Error())
	}
}

func getRow() (Row, error) {
	client := &http.Client{}
	request, err := http.NewRequest("GET", os.Getenv("STATUS_URL"), nil)
	if err != nil {
		log.Fatal("Could not create new request")
	}

	request.SetBasicAuth(os.Getenv("AUTH_USER"), os.Getenv("AUTH_PASSWORD"))

	resp, err := client.Do(request)

	if err != nil {
		log.Println("EROR: ", os.Getenv("STATUS_URL"))
		return Row{}, errors.New("Could not get status page")
	}

	body, err := io.ReadAll(resp.Body)

	if err != nil {
		return Row{}, errors.New("Could not get response body")
	}

	bodyStr := string(body)

	startText := "var webdata_sn"
	endText := "function initPageText"
	startIndex := strings.Index(bodyStr, startText)
	endIndex := strings.Index(bodyStr, endText)

	bodyStr = bodyStr[startIndex:endIndex]
	bodyStr = strings.TrimSpace(bodyStr)

	splitBody := strings.Split(bodyStr, ";")

	keyMap := map[string]string{}	
	for _, line := range splitBody {
		varIndex := strings.Index(line, "var")
		equalIndex := strings.Index(line, "=")

		if (varIndex == -1 || equalIndex == -1) {
			continue
		}

		key := line[varIndex + 4:equalIndex - 1]

		startIndex := strings.Index(line, "\"") + 1
		endIndex := strings.LastIndex(line, "\"")

		value := line[startIndex:endIndex]

		keyMap[key] = value
	}

	newRow := Row{
		power_now: getFloatFromMap(keyMap, "webdata_now_p"),
		energy_today: getFloatFromMap(keyMap, "webdata_today_e"),
		energy_total: getFloatFromMap(keyMap, "webdata_total_e"),
		alarm: getStringFromMap(keyMap, "webdata_alarm"),
		utime: getFloatFromMap(keyMap, "webdata_utime"),
		cover_sta_rssi: getStringFromMap(keyMap, "cover_sta_rssi"),
		timestamp: time.Now(),
	}

	return newRow, nil
}

func getFloatFromMap(keyMap map[string]string, key string) float64 {
	value, ok := keyMap[key]

	if !ok {
		return 0
	}

	valueF, err := strconv.ParseFloat(value, 64)

	if err != nil {
		return 0
	}

	return valueF
}

func getStringFromMap(keyMap map[string]string, key string) string {
	value, ok := keyMap[key]

	if !ok {
		return ""
	}

	return value
}
