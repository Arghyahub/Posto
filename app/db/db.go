package db

import (
	"database/sql"
	"fmt"
	"posto/app/config"

	_ "github.com/mattn/go-sqlite3"
)

var DB *sql.DB

func InitDB() (*sql.DB, error) {
	var err error
	configData := config.ConfigData
	if configData == nil {
		return nil, fmt.Errorf("config not initialized")
	}

	DB, err = sql.Open("sqlite3", configData.DBPath)
	if err != nil {
		return nil, err
	}

	DB.SetMaxOpenConns(1)

	return DB, nil
}
