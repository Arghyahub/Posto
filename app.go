package main

import (
	"context"
	"fmt"
	"posto/app/config"
	"posto/app/db"
)

// App struct
type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
	// Setup config
	_, err := config.NewConfig()
	if err != nil {
		fmt.Println("Error setting up config:", err)
	}

	// init db
	err = db.InitDB()
	if err != nil {
		fmt.Println("Error initializing database:", err)
	}

	// run migrations

}

// Greet returns a greeting for the given name
func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
}
