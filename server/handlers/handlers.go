package handlers

import (
	"database/sql"
	"fmt"
	"log"
)

type DataValue struct {
	Date  string
	Value float64
}

func getFormatForInterval(interval string) string {
	switch interval {
	case "year":
		return "YYYY"
	case "month":
		return "YYYY-MM"
	case "day":
		return "YYYY-MM-DD"
	case "hour":
		return "YYYY-MM-DD HH24:00"
	default:
		return ""
	}
}

func GeneralGetBy(db *sql.DB, kind, interval, start, end string) []DataValue {
	formatForInterval := getFormatForInterval(interval)
	query := fmt.Sprintf(`
    SELECT
      MAX(%s),
      TO_CHAR(max(timestamp), '%s')
    FROM
      logs
    WHERE
      timestamp BETWEEN $1 AND $2
    GROUP BY
      TO_CHAR(timestamp, '%s')
    ORDER BY
      TO_CHAR(timestamp, '%s');
  `, kind, formatForInterval, formatForInterval, formatForInterval)
	rows, err := db.Query(query, start, end)
	if err != nil {
		log.Println("[GeneralGetBy]: Failed query", err, kind, interval, start, end)
		return nil
	}

	data := make([]DataValue, 0)

	for rows.Next() {
		var entry DataValue
		err = rows.Scan(&entry.Value, &entry.Date)

		if err != nil {
			log.Println("[GeneralGetBy] Failed scan", err, kind, interval, start, end)
			continue
		}

		data = append(data, entry)
	}

	return data
}
