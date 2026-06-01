package main

import (
	"encoding/json"
	"io"
	"log"
	"os"
)

type Device struct {
	StatusUrl string `json:"status_url"`
	Name      string `json:"name"`
	Username  string `json:"username"`
	Password  string `json:"password"`
}

type Config struct {
	Devices   []Device `json:"devices"`
	DBUrl     string   `json:"db_url"`
	Frequency int      `json:"frequency"`
}

func LoadConfig(filepath string) Config {
	file, err := os.Open(filepath)

	if err != nil {
		log.Printf("Failed to load config file at %s (%v)", filepath, err)
		return Config{}
	}

	defer file.Close()

	byteValue, err := io.ReadAll(file)

	if err != nil {
		log.Printf("Failed to read file at %s (%v)", filepath, err)
		return Config{}
	}

	var config Config
	err = json.Unmarshal(byteValue, &config)

	if err != nil {
		log.Printf("Error unmarshalling json file %s (%v)", filepath, err)
		return Config{}
	}

	if config.Frequency == 0 {
		config.Frequency = 60
	}

	return config
}
