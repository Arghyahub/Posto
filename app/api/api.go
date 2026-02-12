package api

import (
	"posto/app/repositories"
)

type ApiResponse[T any] struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	Error   string `json:"error,omitempty"`
	Data    T      `json:"data"`
}

type Api struct {
	Repositories  *repositories.Repositories
	CollectionApi *CollectionApi
	FileApi       *FileApi
}

func NewApi(repositories *repositories.Repositories) *Api {
	return &Api{
		Repositories:  repositories,
		CollectionApi: NewCollectionApi(repositories),
		FileApi:       NewFileApi(repositories),
	}
}

func (a *Api) Test() string {
	return "test"
}
