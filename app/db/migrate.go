package db

import (
	"fmt"
	"os"
	"path"
	"sort"
	"strings"
)

func Migrate() error {
	dbConn := DB
	if dbConn == nil {
		return fmt.Errorf("database connection not initialized")
	}

	cwd, err := os.Getwd()
	if err != nil {
		return fmt.Errorf("error getting current working directory: %v", err)
	}

	files, err := os.ReadDir(path.Join(cwd, "app/db/migrations"))

	if err != nil {
		return fmt.Errorf("error reading migrations directory: %v", err)
	}

	migration_files := []string{}

	for _, file := range files {
		if file.IsDir() {
			continue
		}

		if !strings.HasSuffix(file.Name(), ".sql") || len(file.Name()) <= 4 {
			continue
		}

		migration_files = append(migration_files, file.Name())
	}

	// sort files by name
	sort.Strings(migration_files)

	if len(migration_files) == 0 {
		return nil
	}

	// Create migration talbe if not exist
	_, err = dbConn.Exec(`
	CREATE TABLE IF NOT EXISTS migration (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		name TEXT NOT NULL,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	)
	`)

	if err != nil {
		return fmt.Errorf("error creating migration table: %v", err)
	}

	latest_migration, err := dbConn.Query(`
	SELECT name FROM migration ORDER BY id DESC LIMIT 1
	`)

	if err != nil {
		return fmt.Errorf("error getting latest migration: %v", err)
	}

	defer latest_migration.Close()

	var latest_migration_name string
	if latest_migration.Next() {
		err := latest_migration.Scan(&latest_migration_name)
		if err != nil {
			return fmt.Errorf("error scanning latest migration: %v", err)
		}
	}

	migrations_to_apply := []string{}
	for _, migration_file := range migration_files {
		if migration_file > latest_migration_name {
			migrations_to_apply = append(migrations_to_apply, migration_file)
		}
	}

	for _, migration_file := range migrations_to_apply {
		file_path := path.Join(cwd, "app/db/migrations", migration_file)

		migration_content, err := os.ReadFile(file_path)
		if err != nil {
			return fmt.Errorf("error reading migration file: %v", err)
		}

		_, err = dbConn.Exec(string(migration_content))
		if err != nil {
			return fmt.Errorf("error executing migration file: %v", err)
		}

		_, err = dbConn.Exec(`
		INSERT INTO migration (name) VALUES (?)
		`, migration_file)
		if err != nil {
			return fmt.Errorf("error inserting migration: %v", err)
		}
	}

	fmt.Println("All migrations applied successfully")

	return nil
}
