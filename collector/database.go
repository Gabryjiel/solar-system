package main

import (
	"database/sql"
	"time"

	"github.com/Gabryjiel/solar-system/internal"
)

func getDBClient(config Config) (*sql.DB, error) {
	db, err := sql.Open("sqlite", config.DBUrl)
	if err != nil {
		return nil, err
	}

	err = db.Ping()
	if err != nil {
		return nil, err
	}

	return db, nil
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
		alarm,
		name
		) VALUES (
		$1,
		$2,
		$3,
		$4,
		$5,
		$6,
		$7,
		$8
		) RETURNING id;`,
		row.Cover_sta_rssi,
		row.Timestamp.Format(time.RFC3339),
		row.Energy_total,
		row.Energy_today,
		row.Power_now,
		row.Utime,
		row.Alarm,
		row.Name,
	).Scan(&lastId)

	return lastId, err
}

func initDB(db *sql.DB) error {
	_, err := db.Exec(`CREATE TABLE IF NOT EXISTS logs (
		id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
		cover_sta_rssi TEXT,
		"timestamp" TEXT,
		energy_total REAL,
		energy_today REAL,
		power_now REAL,
		utime TEXT,
		alarm TEXT,
		name TEXT
	);`)

	return err
}
