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

	"github.com/Gabryjiel/solar-system/internal"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

const (
	ENV_STATUS_URL    = "STATUS_URL"
	ENV_FREQUENCY     = "FREQ"
	ENV_DB_URL        = "DB_URL"
	ENV_AUTH_USER     = "AUTH_USER"
	ENV_AUTH_PASSWORD = "AUTH_PASSWORD"
)

func main() {
	loadEnvars()

	db := getDbClient()
	defer db.Close()
	initDb(db)

	ticker := time.Tick(time.Duration(getFrequency()) * time.Second)
	for range ticker {
		statusPage, err := getStatusPage()
		if err != nil {
			log.Println(err)
			continue
		}

		row := parseStatusPage(statusPage)

		lastId, err := insertRow(db, &row)
		if err != nil {
			log.Println(err)
			continue
		}

		log.Println("Inserted row with id", lastId)
	}
}

func loadEnvars() {
	requiredEnvars := []string{
		os.Getenv(ENV_STATUS_URL),
		os.Getenv(ENV_DB_URL),
		os.Getenv(ENV_AUTH_USER),
		os.Getenv(ENV_AUTH_PASSWORD),
	}

	for _, envar := range requiredEnvars {
		if envar == "" {
			err := godotenv.Load()
			if err != nil {
				log.Fatalln("Error loading .env file")
			}
			break
		}
	}
}

func getDbClient() *sql.DB {
	db, err := sql.Open("postgres", os.Getenv(ENV_DB_URL))
	if err != nil {
		log.Fatal(err)
	}

	return db
}

func getFrequency() int {
	frequencyStr := os.Getenv(ENV_FREQUENCY)
	frequency := 60

	if frequencyStr != "" {
		value, err := strconv.Atoi(frequencyStr)

		if err != nil {
			log.Println("[Collector] Invalid FREQ value", frequencyStr, err)
		} else {
			frequency = value
		}
	}

	return frequency
}

func insertRow(db *sql.DB, row *internal.Row) (int64, error) {
	var lastId int64

	err := db.QueryRow(
		`INSERT INTO logs (
		cover_sta_rssi,
		timestamp,
		energy_total,
		energy_today,
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
		row.Cover_sta_rssi,
		row.Timestamp.Format(time.RFC3339),
		row.Energy_total,
		row.Energy_today,
		row.Power_now,
		row.Utime,
		row.Alarm,
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

func getStatusPage() (string, error) {
	client := &http.Client{}
	request, err := http.NewRequest("GET", os.Getenv(ENV_STATUS_URL), nil)
	if err != nil {
		log.Fatal("Could not create new request")
	}

	request.SetBasicAuth(os.Getenv(ENV_AUTH_USER), os.Getenv(ENV_AUTH_PASSWORD))

	resp, err := client.Do(request)

	if err != nil {
		log.Println("EROR: ", os.Getenv(ENV_STATUS_URL))
		return "", errors.New("Could not get status page")
	}

	body, err := io.ReadAll(resp.Body)

	if err != nil {
		return "", errors.New("Could not get response body")
	}

	return string(body), nil
}

func parseStatusPage(bodyStr string) internal.Row {
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

		if varIndex == -1 || equalIndex == -1 {
			continue
		}

		key := line[varIndex+4 : equalIndex-1]

		startIndex := strings.Index(line, "\"") + 1
		endIndex := strings.LastIndex(line, "\"")

		value := line[startIndex:endIndex]

		keyMap[key] = value
	}

	newRow := internal.Row{
		Power_now:      getFloatFromMap(keyMap, "webdata_now_p"),
		Energy_today:   getFloatFromMap(keyMap, "webdata_today_e"),
		Energy_total:   getFloatFromMap(keyMap, "webdata_total_e"),
		Alarm:          getStringFromMap(keyMap, "webdata_alarm"),
		Utime:          getFloatFromMap(keyMap, "webdata_utime"),
		Cover_sta_rssi: getStringFromMap(keyMap, "cover_sta_rssi"),
		Timestamp:      time.Now(),
	}

	return newRow
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
