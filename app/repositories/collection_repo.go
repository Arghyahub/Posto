package repositories

import (
	"database/sql"
	"encoding/json"
	"posto/app/models"
)

type CollectionRepo struct {
	DB *sql.DB
}

func NewCollectionRepo(DB *sql.DB) *CollectionRepo {
	return &CollectionRepo{DB}
}

func (c *CollectionRepo) SelectAllCollections() ([]models.Collection, error) {
	rows, err := c.DB.Query(`
		SELECT 
		* 
		FROM collection ORDER BY name ASC`,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	collections := []models.Collection{}
	for rows.Next() {
		var collection models.Collection
		if err := rows.Scan(&collection.PkCollectionId, &collection.Name, &collection.CreatedAt, &collection.UpdatedAt); err != nil {
			return nil, err
		}
		collections = append(collections, collection)
	}
	return collections, nil
}

type FileJoinType struct {
	FileId       *int           `json:"file_id"`
	Name         string         `json:"name"`
	IsFolder     int            `json:"is_folder"`
	ParentId     *int           `json:"parent_id"`
	CollectionId *int           `json:"collection_id"`
	Files        []FileJoinType `json:"files"`
	Visited      bool           `json:"visited"`
}

type CollectionJoinType struct {
	CollectionId *int           `json:"collection_id"`
	Name         string         `json:"name"`
	Files        []FileJoinType `json:"files"`
}

// creates nested structure of files
func nestedFiles(files []FileJoinType, i int) FileJoinType {
	files[i].Visited = true

	for j := range files {
		if files[j].ParentId == nil {
			continue
		}

		if !files[j].Visited && *files[j].ParentId == *files[i].FileId {
			child := nestedFiles(files, j)
			files[i].Files = append(files[i].Files, child)
		}
	}

	return files[i]
}

func (c *CollectionRepo) SelectAllCollectionsWithFilesNested() ([]CollectionJoinType, error) {
	rows, err := c.DB.Query(`
		Select 
        	c.pk_collection_id,
        	c.name,
        	CASE
        	when f.pk_file_id is null then json('[]')
        	else
        	json_group_array(
        		json_object(
        			'file_id',f.pk_file_id,
        			'name',f.name,
        			'is_folder',f.is_folder,
        			'parent_id',f.parent_id,
        			'collection_id',f.collection_id
        		)
        	)  
            END
        from collection as c
        left join file as f on c.pk_collection_id=f.collection_id
        group by c.pk_collection_id, c.name
        order by c.name asc, f.is_folder desc, f.name asc;
	`,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	collections := []CollectionJoinType{}
	for rows.Next() {
		var collection CollectionJoinType
		var filesStr string
		var allFiles []FileJoinType
		rows.Scan(&collection.CollectionId, &collection.Name, &filesStr)

		err := json.Unmarshal([]byte(filesStr), &allFiles)
		// for i := range allFiles {
		// 	allFiles[i].Visited = false
		// }

		if err != nil {
			return nil, err
		}

		for i := range allFiles {
			if allFiles[i].ParentId == nil {
				root := nestedFiles(allFiles, i)
				collection.Files = append(collection.Files, root)
			}
		}

		collections = append(collections, collection)
	}
	return collections, nil
}

type CollectionJoinFileType struct {
	CollectionId   int     `json:"collection_id"`
	CollectionName string  `json:"collection_name"`
	FileId         *int    `json:"file_id"`
	FileName       *string `json:"file_name"`
	IsFolder       *bool   `json:"is_folder"`
	ParentId       *int    `json:"parent_id"`
}

func (c *CollectionRepo) SelectAllCollectionJoinFiles() ([]CollectionJoinFileType, error) {
	rows, err := c.DB.Query(`
    SELECT 
    	collection.pk_collection_id,
    	collection.name as collection_name,
    	file.pk_file_id,
        file.name as file_name,
        file.is_folder,
        file.parent_id
     FROM collection
    left join file on collection.pk_collection_id = file.collection_id
	order by collection.name
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	collections := []CollectionJoinFileType{}
	for rows.Next() {
		var collection CollectionJoinFileType
		err := rows.Scan(&collection.CollectionId, &collection.CollectionName, &collection.FileId, &collection.FileName, &collection.IsFolder, &collection.ParentId)
		if err != nil {
			return nil, err
		}
		collections = append(collections, collection)
	}
	return collections, nil
}

func (c *CollectionRepo) InsertCollection(name string) (int, error) {
	var id int
	err := c.DB.QueryRow("INSERT INTO collection(name) VALUES(?) RETURNING pk_collection_id", name).Scan(&id)
	if err != nil {
		return -1, err
	}
	return id, nil
}

func (c *CollectionRepo) DeleteCollection(id int) error {
	_, err := c.DB.Exec("DELETE FROM collection WHERE pk_collection_id = ?", id)
	if err != nil {
		return err
	}
	return nil
}

func (c *CollectionRepo) UpdateCollection(id int, name string) error {
	_, err := c.DB.Exec("UPDATE collection SET name = ? WHERE pk_collection_id = ?", name, id)
	if err != nil {
		return err
	}
	return nil
}
