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
