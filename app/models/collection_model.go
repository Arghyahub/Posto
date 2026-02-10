package models

import "time"

type Collection struct {
	PkCollectionId int64     `json:"pk_collection_id"`
	Name           string    `json:"name"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}
