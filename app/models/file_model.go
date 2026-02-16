package models

import "time"

type File struct {
	PkFileId     int64     `json:"pk_file_id"`
	Name         string    `json:"name"`
	CollectionId int64     `json:"collection_id"`
	IsFolder     bool      `json:"is_folder"`
	ParentId     int64     `json:"parent_id"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
	Method       *string   `json:"method"`
	Url          *string   `json:"url"`
	Headers      *string   `json:"headers"`
	Body         *string   `json:"body"`
}
