package repositories

import "database/sql"

type Repositories struct {
	Collection *CollectionRepo
	File       *FileRepo
}

func NewRepositories(DB *sql.DB) *Repositories {
	return &Repositories{
		Collection: NewCollectionRepo(DB),
		File:       NewFileRepo(DB),
	}
}
