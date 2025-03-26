package utils

import (
	"net/http"
	"strconv"

	"github.com/Gabryjiel/solar-system/server/handlers"
)

func GetStringParamFormQuery(req *http.Request, name, defaultValue string) string {
	value := req.URL.Query().Get(name)

	if len(value) == 0 {
		value = defaultValue
	}

	return value
}

func GetIntParamFromQuery(req *http.Request, name string, defaultValue int) int {
	value := req.URL.Query().Get(name)
	valueNumber := defaultValue

	if len(value) > 0 {
		temp, err := strconv.Atoi(value)
		if err == nil {
			valueNumber = temp
		}
	}

	return valueNumber
}

type DataDeltaValue struct {
	Date  string
	Value string
	Delta string
}

func AddDelta(data []handlers.DataValue) []DataDeltaValue {
	result := make([]DataDeltaValue, len(data))

	prevValue := 0.0
	for i := 0; i < len(data); i++ {
		delta := data[i].Value - prevValue

		result[i] = DataDeltaValue{
			Date:  data[i].Date,
			Value: FormatFloat64(data[i].Value),
			Delta: FormatFloat64(delta),
		}

		prevValue = data[i].Value
	}

	return result
}

func FormatFloat64(value float64) string {
	return strconv.FormatFloat(value, 'f', 2, 64)
}
