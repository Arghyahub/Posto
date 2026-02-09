package db

import (
	"database/sql"
	"fmt"
	"posto/app/config"

	_ "github.com/mattn/go-sqlite3"
)

var DB *sql.DB

func InitDB() error {
	var err error
	configData := config.ConfigData
	if configData == nil {
		return fmt.Errorf("config not initialized")
	}

	DB, err = sql.Open("sqlite3", configData.DBPath)
	if err != nil {
		return err
	}

	DB.SetMaxOpenConns(1)

	return DB.Ping()
}
