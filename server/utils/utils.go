package utils

import (
	"net/http"
	"strconv"
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
