package internal

import "time"

type Row struct {
	Id             int64
	Power_now      float64
	Energy_total   float64
	Energy_today   float64
	Alarm          string
	Utime          float64
	Cover_sta_rssi string
	Timestamp      time.Time
}
