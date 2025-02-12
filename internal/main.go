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

type TimeValue struct {
	Key int
	Value float64
}

func StartOfDay(datetime time.Time) time.Time {
	year, month, day := datetime.Date()
	return time.Date(year, month, day, 0, 0, 0, 0, datetime.Location())
}

func EndOfDay(datetime time.Time) time.Time {
	year, month, day := datetime.Date()
	return time.Date(year, month, day, 23, 59, 59, 0, datetime.Location())
}
