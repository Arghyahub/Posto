package api

import "posto/app/repositories"

type FileApi struct {
	Repositories *repositories.Repositories
}

func NewFileApi(repositories *repositories.Repositories) *FileApi {
	return &FileApi{Repositories: repositories}
}

func (f *FileApi) CreateFileOrFolder(param repositories.FileCreationParam) ApiResponse[*int] {
	resp := ApiResponse[*int]{}

	fileId, err := f.Repositories.File.CreateFileOrFolder(param)
	if err != nil {
		resp.Error = err.Error()
		resp.Success = false
		resp.Message = "Failed to create file or folder"
		return resp
	}

	resp.Success = true
	resp.Message = "File or folder created successfully"
	resp.Data = fileId
	return resp
}
