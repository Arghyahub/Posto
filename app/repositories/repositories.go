package repositories

import "database/sql"

type Repositories struct {
	Collection *CollectionRepo
}

func NewRepositories(DB *sql.DB) *Repositories {
	return &Repositories{
		Collection: NewCollectionRepo(DB),
	}
}
