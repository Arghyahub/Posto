import * as React from 'react';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import FolderIcon from '@mui/icons-material/Folder';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import Divider from '@mui/material/Divider';

// Types adapted from permanent-drawer.tsx
type FolderOrFileType = { is_folder: true; files: FileType[] } | { is_folder: false };

export type FileType = FolderOrFileType & {
  pk_file_id: number;
  collection_id: number;
  parent_id?: number;
  name: string;
  created_at: string;
  updated_at: string;
};

export interface CollectionType {
  pk_collection_id: number;
  name: string;
  created_at: string;
  updated_at: string;
  files: FileType[];
}

// Dummy Data
const initialCollections: CollectionType[] = [
  {
    pk_collection_id: 1,
    name: 'My Collection',
    created_at: '2023-01-01',
    updated_at: '2023-01-02',
    files: [
      {
        pk_file_id: 101,
        collection_id: 1,
        name: 'Project Alpha',
        is_folder: true,
        created_at: '2023-01-01',
        updated_at: '2023-01-01',
        files: [
          {
            pk_file_id: 102,
            collection_id: 1,
            parent_id: 101,
            name: 'Readme.md',
            is_folder: false,
            created_at: '2023-01-03',
            updated_at: '2023-01-03',
          },
          {
            pk_file_id: 103,
            collection_id: 1,
            parent_id: 101,
            name: 'src',
            is_folder: true,
            created_at: '2023-01-03',
            updated_at: '2023-01-03',
            files: [
              {
                pk_file_id: 104,
                collection_id: 1,
                parent_id: 103,
                name: 'index.ts',
                is_folder: false,
                created_at: '2023-01-04',
                updated_at: '2023-01-04',
              },
               {
                pk_file_id: 106,
                collection_id: 1,
                parent_id: 103,
                name: 'utils.ts',
                is_folder: false,
                created_at: '2023-01-04',
                updated_at: '2023-01-04',
              }
            ],
          }
        ],
      },
      {
        pk_file_id: 105,
        collection_id: 1,
        name: 'global-config.json',
        is_folder: false,
        created_at: '2023-01-05',
        updated_at: '2023-01-05',
      },
    ],
  },
  {
    pk_collection_id: 2,
    name: 'Archived Projects',
    created_at: '2023-02-01',
    updated_at: '2023-02-02',
    files: [
        {
            pk_file_id: 201,
            collection_id: 2,
            name: 'Old Project',
            is_folder: true,
            files: [],
            created_at: '2023-02-01',
            updated_at: '2023-02-01',
        }
    ],
  }
];

const FileSystemItem = ({ file, depth }: { file: FileType; depth: number }) => {
  const [open, setOpen] = React.useState(false);

  const handleClick = () => {
    if (file.is_folder) {
      setOpen(!open);
    }
  };

  return (
    <>
      <ListItemButton sx={{ pl: 2 * depth, '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' } }} onClick={handleClick}>
        <ListItemIcon sx={{ color: '#d4d4d8' }}>
          {file.is_folder ? (open ? <FolderOpenIcon /> : <FolderIcon />) : <InsertDriveFileIcon />}
        </ListItemIcon>
        <ListItemText primary={file.name} sx={{ color: '#e4e4e7' }} />
        {file.is_folder ? (open ? <ExpandLess sx={{ color: '#d4d4d8' }} /> : <ExpandMore sx={{ color: '#d4d4d8' }} />) : null}
      </ListItemButton>
      {file.is_folder && (
        <Collapse in={open} timeout={150} unmountOnExit>
          <List component="div" disablePadding>
            {file.files.map((childFile) => (
              <FileSystemItem key={childFile.pk_file_id} file={childFile} depth={depth + 1} />
            ))}
          </List>
        </Collapse>
      )}
    </>
  );
};

const CollectionItem = ({ collection }: { collection: CollectionType }) => {
    const [open, setOpen] = React.useState(true); // Collections default open

    const handleClick = () => {
        setOpen(!open);
    };

    return (
        <>
            <ListItemButton onClick={handleClick} sx={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' } }}>
                <ListItemIcon>
                    <FolderIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary={collection.name} primaryTypographyProps={{ fontWeight: 'bold', color: 'white' }} />
                {open ? <ExpandLess sx={{ color: 'white' }} /> : <ExpandMore sx={{ color: 'white' }} />}
            </ListItemButton>
            <Collapse in={open} timeout={150} unmountOnExit>
                <List component="div" disablePadding>
                    {collection.files.map((file) => (
                        <FileSystemItem key={file.pk_file_id} file={file} depth={2} />
                    ))}
                </List>
            </Collapse>
        </>
    );
};

export default function FileExplorer() {
  const [collections] = React.useState<CollectionType[]>(initialCollections);

  return (
    <List
      sx={{ width: '100%', bgcolor: '#27272a' }}
      component="nav"
    >
      {collections.map((collection, index) => (
        <React.Fragment key={collection.pk_collection_id}>
            <CollectionItem collection={collection} />
            {index < collections.length - 1 && <Divider sx={{ borderColor: '#52525c' }} />}
        </React.Fragment>
      ))}
    </List>
  );
}
