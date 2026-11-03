package main

import (
	"database/sql"
	"log"
	"sync"
	"time"

	_ "github.com/mattn/go-sqlite3"
)

func main() {
	config := LoadConfig("./config.json")

	db, err := getDBClient(config)
	if err != nil {
		log.Fatalf("Failed to get DB client (%v)", err)
	}
	defer db.Close()

	err = initDB(db)
	if err != nil {
		log.Fatalf("Error while initing DB (%v)", err)
	}

	ticker := time.Tick(time.Duration(config.Frequency) * time.Second)

	for range ticker {
		var wg sync.WaitGroup

		for _, device := range config.Devices {
			wg.Add(1)
			go handleDevice(&wg, db, device)
		}

		wg.Wait()
	}
}

func handleDevice(wg *sync.WaitGroup, db *sql.DB, device Device) {
	defer wg.Done()

	statusPage, err := getStatusPage(device)
	if err != nil {
		log.Println(err)
		return
	}

	row, err := parseStatusPage(statusPage)
	if err != nil {
		log.Println(err)
		return
	}

	row.Name = device.Name

	lastId, err := insertRow(db, &row)
	if err != nil {
		log.Println(err)
		return
	}

	log.Println("Inserted row with id", lastId)
}
