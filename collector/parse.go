package main

import (
	"errors"
	"io"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/Gabryjiel/solar-system/internal"
)

func getStatusPage(device Device) (string, error) {
	client := &http.Client{}
	request, err := http.NewRequest("GET", device.StatusUrl, nil)
	if err != nil {
		log.Println("Could not create new request")
		return "", errors.New("Could not make a GET request to " + device.StatusUrl)
	}

	request.SetBasicAuth(device.Username, device.Password)

	resp, err := client.Do(request)
	if err != nil {
		log.Println("ERROR: ", device.StatusUrl)
		return "", errors.New("Could not get status page")
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", errors.New("Could not get response body")
	}

	return string(body), nil
}

func parseStatusPage(bodyStr string) (internal.Row, error) {
	startText := "var webdata_sn"
	endText := "function initPageText"
	startIndex := strings.Index(bodyStr, startText)
	if startIndex == -1 {
		return internal.Row{}, errors.New("Cannot find startIndex")
	}

	endIndex := strings.Index(bodyStr, endText)
	if endIndex == -1 {
		return internal.Row{}, errors.New("Cannot find endIndex")
	}

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
