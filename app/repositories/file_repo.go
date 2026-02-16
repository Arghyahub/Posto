package repositories

import "database/sql"

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
	Method  *string `json:"method"`
	Url     *string `json:"url"`
	Headers *string `json:"headers"`
	Body    *string `json:"body"`
}

func (f *FileRepo) GetRequestData(fileId int) (FileRequestData, error) {
	rows := f.DB.QueryRow(`
		SELECT method,url,headers,body FROM file WHERE pk_file_id = $1
	`, fileId)

	var fileRequestData FileRequestData
	err := rows.Scan(&fileRequestData.Method, &fileRequestData.Url, &fileRequestData.Headers, &fileRequestData.Body)
	if err != nil {
		return FileRequestData{}, err
	}

	return fileRequestData, nil
}

func (f *FileRepo) UpdateRequestData(fileId int, requestData FileRequestData) error {
	_, err := f.DB.Exec(`
		UPDATE file SET method = $1, url = $2, headers = $3, body = $4 WHERE pk_file_id = $5
	`, requestData.Method, requestData.Url, requestData.Headers, requestData.Body, fileId)
	if err != nil {
		return err
	}

	return nil
}
