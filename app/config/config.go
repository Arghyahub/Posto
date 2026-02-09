package config

import (
	"fmt"
	"os"
	"path/filepath"
)

type Config struct {
	DBPath string
}

var ConfigData *Config

func NewConfig() (*Config, error) {
	homeDir, err := os.UserHomeDir()
	if err != nil {
		return nil, fmt.Errorf("error getting home directory: %v", err)
	}

	configDir := filepath.Join(homeDir, ".posto")
	if err := os.MkdirAll(configDir, 0755); err != nil {
		return nil, fmt.Errorf("error creating config directory: %v", err)
	}

	ConfigData = &Config{
		DBPath: filepath.Join(configDir, "posto.db"),
	}

	return ConfigData, nil
}
