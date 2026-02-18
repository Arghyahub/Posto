package repositories

import (
	"database/sql"
	"fmt"
	"strings"
)

type FileRepo struct {
	DB *sql.DB
}

func NewFileRepo(DB *sql.DB) *FileRepo {
	return &FileRepo{DB: DB}
}

type FileCreationParam struct {
	CollectionId int
	ParentId     *int
	IsFolder     bool
	Name         string
}

func (f *FileRepo) CreateFileOrFolder(param FileCreationParam) (*int, error) {
	rows := f.DB.QueryRow(`
		INSERT INTO file(collection_id,parent_id,is_folder,name)
		VALUES($1,$2,$3,$4)
		RETURNING pk_file_id
	`, param.CollectionId, param.ParentId, param.IsFolder, param.Name)

	var fileId int
	err := rows.Scan(&fileId)
	if err != nil {
		return nil, err
	}

	return &fileId, nil
}

type FileRequestData struct {
	Name    *string `json:"name,omitempty"`
	Method  *string `json:"method,omitempty"`
	Url     *string `json:"url,omitempty"`
	Headers *string `json:"headers,omitempty"`
	Body    *string `json:"body,omitempty"`
}

func (f *FileRepo) GetRequestData(fileId int) (FileRequestData, error) {
	rows := f.DB.QueryRow(`
		SELECT method,url,headers,body FROM file WHERE pk_file_id = $1
	`, fileId)

	var fileRequestData FileRequestData
	err := rows.Scan(fileRequestData.Method, fileRequestData.Url, fileRequestData.Headers, fileRequestData.Body)
	if err != nil {
		return FileRequestData{}, err
	}

	return fileRequestData, nil
}

func (f *FileRepo) UpdateFile(fileId int, requestData FileRequestData) error {
	queryString := []string{}
	params := []any{}
	queryIdx := 0

	if requestData.Name != nil {
		queryIdx++
		query := fmt.Sprintf("name = $%v", queryIdx)
		queryString = append(queryString, query)
		params = append(params, *requestData.Name)
	}
	if requestData.Method != nil {
		queryIdx++
		query := fmt.Sprintf("method = $%v", queryIdx)
		queryString = append(queryString, query)
		params = append(params, *requestData.Method)
	}

	if requestData.Url != nil {
		queryIdx++
		query := fmt.Sprintf("url = $%v", queryIdx)
		queryString = append(queryString, query)
		params = append(params, *requestData.Url)
	}

	if requestData.Headers != nil {
		queryIdx++
		query := fmt.Sprintf("headers = $%v", queryIdx)
		queryString = append(queryString, query)
		params = append(params, *requestData.Headers)
	}

	if requestData.Body != nil {
		queryIdx++
		query := fmt.Sprintf("body = $%v", queryIdx)
		queryString = append(queryString, query)
		params = append(params, *requestData.Body)
	}

	if queryIdx == 0 {
		return fmt.Errorf("No params provided, url/method/body/headers is missing")
	}

	setQuery := strings.Join(queryString, ",")

	finalQuery := fmt.Sprintf("UPDATE file SET %v WHERE pk_file_id = %d", setQuery, fileId)

	_, err := f.DB.Exec(finalQuery, params...)
	if err != nil {
		return err
	}

	return nil
}
