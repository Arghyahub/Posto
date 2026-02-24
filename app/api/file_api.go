package api

import (
	"encoding/base64"
	"encoding/json"
	"io"
	"net/http"
	"posto/app/repositories"
	"strings"
)

type FileApi struct {
	Repositories *repositories.Repositories
}

func NewFileApi(repositories *repositories.Repositories) *FileApi {
	return &FileApi{Repositories: repositories}
}

// HttpResponse is the structured result returned to the frontend after an HTTP request.
type HttpResponse struct {
	StatusCode  int    `json:"status_code"`
	ContentType string `json:"content_type"`
	// Body holds the response body as a UTF-8 string (JSON / plain text) or
	// a base64-encoded string when IsBinary is true.
	Body     string `json:"body"`
	IsBinary bool   `json:"is_binary"`
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

func (f *FileApi) UpdateFile(fileId int, requestData repositories.FileRequestData) ApiResponse[bool] {
	resp := ApiResponse[bool]{Data: false}
	err := f.Repositories.File.UpdateFile(fileId, requestData)
	if err != nil {
		resp.Message = "Unable to update data"
		resp.Error = err.Error()
		resp.Success = false
	} else {
		resp.Message = "Data updated successfully"
		resp.Success = true
		resp.Data = true
	}
	return resp
}

func (f *FileApi) GetRequestData(fileId int) ApiResponse[repositories.FileRequestData] {
	resp := ApiResponse[repositories.FileRequestData]{}

	data, err := f.Repositories.File.GetRequestData(fileId)

	if err != nil {
		resp.Message = "Unable to fetch Api data"
		resp.Error = err.Error()
		resp.Success = false
	} else {
		resp.Message = "Api fetched successfully"
		resp.Data = data
		resp.Success = true
	}

	return resp
}

// SendRequest fetches the stored request data for the given fileId and executes
// the HTTP call. The result is returned as an ApiResponse[HttpResponse].
func (f *FileApi) SendRequest(fileId int) ApiResponse[HttpResponse] {
	resp := ApiResponse[HttpResponse]{}

	// 1. Load the stored request from the DB.
	data, err := f.Repositories.File.GetRequestData(fileId)
	if err != nil {
		resp.Success = false
		resp.Message = "Failed to load request data"
		resp.Error = err.Error()
		return resp
	}

	url := ""
	if data.Url != nil {
		url = *data.Url
	}
	if url == "" {
		resp.Success = false
		resp.Message = "URL is empty"
		return resp
	}

	method := "GET"
	if data.Method != nil && *data.Method != "" {
		method = *data.Method
	}

	// 2. Build the request body (for non-GET requests).
	var bodyReader io.Reader
	if method != "GET" && data.Body != nil && *data.Body != "" {
		bodyReader = strings.NewReader(*data.Body)
	}

	req, err := http.NewRequest(method, url, bodyReader)
	if err != nil {
		resp.Success = false
		resp.Message = "Failed to build HTTP request"
		resp.Error = err.Error()
		return resp
	}

	// 3. Apply stored headers.
	req.Header.Set("Content-Type", "application/json")
	if data.Headers != nil && *data.Headers != "" {
		var headers map[string]string
		if jsonErr := json.Unmarshal([]byte(*data.Headers), &headers); jsonErr == nil {
			for k, v := range headers {
				req.Header.Set(k, v)
			}
		}
	}

	// 4. Execute the request.
	client := &http.Client{}
	httpResp, err := client.Do(req)
	if err != nil {
		resp.Success = false
		resp.Message = "HTTP request failed"
		resp.Error = err.Error()
		return resp
	}
	defer httpResp.Body.Close()

	bodyBytes, err := io.ReadAll(httpResp.Body)
	if err != nil {
		resp.Success = false
		resp.Message = "Failed to read response body"
		resp.Error = err.Error()
		return resp
	}

	contentType := httpResp.Header.Get("Content-Type")

	httpResult := HttpResponse{
		StatusCode:  httpResp.StatusCode,
		ContentType: contentType,
	}

	// Treat JSON and text responses as plain strings; everything else as base64.
	if strings.Contains(contentType, "application/json") || strings.Contains(contentType, "text/") {
		httpResult.Body = string(bodyBytes)
		httpResult.IsBinary = false
	} else {
		httpResult.Body = base64.StdEncoding.EncodeToString(bodyBytes)
		httpResult.IsBinary = true
	}

	resp.Success = true
	resp.Message = "Request completed"
	resp.Data = httpResult
	return resp
}
