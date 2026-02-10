package main

import (
	"embed"
	"fmt"
	"posto/app/api"
	"posto/app/config"
	"posto/app/db"
	"posto/app/repositories"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	// Create an instance of the app structure
	app := NewApp()

	// Setup config
	_, err := config.NewConfig()
	if err != nil {
		fmt.Println("Error setting up config:", err)
		return
	}

	// init db
	DB, err := db.InitDB()
	if err != nil {
		fmt.Println("Error initializing database:", err)
		return
	}

	// run migrations
	err = db.Migrate()
	if err != nil {
		fmt.Println("Error running migrations:", err)
		return
	}

	// Create repositories
	Repositories := repositories.NewRepositories(DB)

	// Create api
	Api := api.NewApi(Repositories)

	Repositories.Collection.SelectAllCollectionsWithFiles()

	// Create application with options
	err = wails.Run(&options.App{
		Title:  "posto",
		Width:  1024,
		Height: 768,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 1},
		OnStartup:        app.startup,
		Bind: []interface{}{
			app,
			Api.CollectionApi,
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}
