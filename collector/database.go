package main

import (
	"database/sql"
	"time"

	"github.com/Gabryjiel/solar-system/internal"
)

func getDBClient(config Config) (*sql.DB, error) {
	db, err := sql.Open("postgres", config.DBUrl)
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
		id SERIAL NOT NULL,
		cover_sta_rssi VARCHAR(8),
		timestamp timestamp,
		energy_total double precision,
		energy_today numeric(5, 2),
		power_now numeric(6, 2),
		utime VARCHAR(8),
		alarm VARCHAR(8),
		name VARCHAR(32),
		PRIMARY KEY (id)
	);`)

	return err
}
