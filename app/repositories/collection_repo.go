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
	FileId       int            `json:"file_id"`
	Name         string         `json:"name"`
	IsFolder     int            `json:"is_folder"`
	ParentId     *int           `json:"parent_id"`
	CollectionId *int           `json:"collection_id"`
	Files        []FileJoinType `json:"files"`
}

type CollectionJoinType struct {
	CollectionId int            `json:"collection_id"`
	Name         string         `json:"name"`
	Files        []FileJoinType `json:"files"`
}

func (c *CollectionRepo) SelectAllCollectionsWithFiles() ([]any, error) {
	rows, err := c.DB.Query(`
		Select 
    	c.pk_collection_id,
    	c.name,
    	json_group_array(
        	json_object(
            	'file_id',f.pk_file_id,
            	'name',f.name,
            	'is_folder',f.is_folder,
            	'parent_id',f.parent_id,
            	'collection_id',f.collection_id
        	)
    	)  
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
	// collections := []any{}
	for rows.Next() {
		var collection CollectionJoinType
		var filesStr string
		var files []FileJoinType
		rows.Scan(&collection.CollectionId, &collection.Name, &filesStr)

		err := json.Unmarshal([]byte(filesStr), &files)
		if err != nil {
			return nil, err
		}

	}
	return nil, nil
}

func (c *CollectionRepo) InsertCollection(name string) error {
	_, err := c.DB.Exec("INSERT INTO collection(name) VALUES(?)", name)
	if err != nil {
		return err
	}
	return nil
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
