package api

import (
	"posto/app/models"
	"posto/app/repositories"
)

type CollectionApi struct {
	Repositories *repositories.Repositories
}

func NewCollectionApi(repositories *repositories.Repositories) *CollectionApi {
	return &CollectionApi{Repositories: repositories}
}

func (c *CollectionApi) SelectAllCollections() ApiResponse[[]models.Collection] {
	resp := ApiResponse[[]models.Collection]{}

	collections, err := c.Repositories.Collection.SelectAllCollections()
	if err != nil {
		resp.Error = err.Error()
		resp.Success = false
		resp.Message = "Failed to fetch collections"
		return resp
	}

	resp.Success = true
	resp.Message = "Collections fetched successfully"
	resp.Data = collections
	return resp
}

func (c *CollectionApi) SelectAllCollectionsWithFilesNested() ApiResponse[[]repositories.CollectionJoinType] {
	resp := ApiResponse[[]repositories.CollectionJoinType]{}

	collections, err := c.Repositories.Collection.SelectAllCollectionsWithFilesNested()
	if err != nil {
		resp.Error = err.Error()
		resp.Success = false
		resp.Message = "Failed to fetch collections"
		resp.Data = []repositories.CollectionJoinType{}
		return resp
	}

	resp.Success = true
	resp.Message = "Collections fetched successfully"
	resp.Data = collections
	return resp
}

func (c *CollectionApi) SelectAllCollectionsWithFiles() ApiResponse[[]repositories.CollectionJoinFileType] {
	resp := ApiResponse[[]repositories.CollectionJoinFileType]{}

	collections, err := c.Repositories.Collection.SelectAllCollectionJoinFiles()
	if err != nil {
		resp.Error = err.Error()
		resp.Success = false
		resp.Message = "Failed to fetch collections"
		resp.Data = []repositories.CollectionJoinFileType{}
		return resp
	}

	resp.Success = true
	resp.Message = "Collections fetched successfully"
	resp.Data = collections
	return resp
}
