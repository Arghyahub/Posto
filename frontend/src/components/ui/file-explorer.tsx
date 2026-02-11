import * as React from "react";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Collapse from "@mui/material/Collapse";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import FolderIcon from "@mui/icons-material/Folder";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import Divider from "@mui/material/Divider";
import { SelectAllCollectionsWithFiles } from "../../../wailsjs/go/api/CollectionApi";

type FolderOrFileType =
  | { is_folder: 1; files?: FileJoinType[] }
  | { is_folder: 0 };

export type CollectionJoinType = {
  collection_id?: number;
  name: string;
  files?: FileJoinType[];
};

export type FileJoinType = FolderOrFileType & {
  file_id?: number;
  name: string;
  is_folder: number;
  parent_id?: any;
  collection_id?: number;
  // files?: FileJoinType[];
};

const FileSystemItem = ({
  file,
  depth,
}: {
  file: FileJoinType;
  depth: number;
}) => {
  const [open, setOpen] = React.useState(false);

  const handleClick = () => {
    if (file.is_folder) {
      setOpen(!open);
    }
  };

  return (
    <>
      <ListItemButton
        sx={{
          pl: 2 * depth,
          "&:hover": { bgcolor: "rgba(255, 255, 255, 0.1)" },
        }}
        onClick={handleClick}
      >
        <ListItemIcon sx={{ color: "#d4d4d8" }}>
          {file.is_folder ? (
            open ? (
              <FolderOpenIcon />
            ) : (
              <FolderIcon />
            )
          ) : (
            <InsertDriveFileIcon />
          )}
        </ListItemIcon>
        <ListItemText primary={file.name} sx={{ color: "#e4e4e7" }} />
        {file.is_folder ? (
          open ? (
            <ExpandLess sx={{ color: "#d4d4d8" }} />
          ) : (
            <ExpandMore sx={{ color: "#d4d4d8" }} />
          )
        ) : null}
      </ListItemButton>
      {file.is_folder && (
        <Collapse in={open} timeout={150} unmountOnExit>
          {file?.files && (
            <List component="div" disablePadding>
              {file.files.map((childFile) => (
                <FileSystemItem
                  key={childFile.file_id}
                  file={childFile}
                  depth={depth + 1}
                />
              ))}
            </List>
          )}
        </Collapse>
      )}
    </>
  );
};

const CollectionItem = ({ collection }: { collection: CollectionJoinType }) => {
  const [open, setOpen] = React.useState(true); // Collections default open

  const handleClick = () => {
    setOpen(!open);
  };

  return (
    <>
      <ListItemButton
        onClick={handleClick}
        sx={{
          backgroundColor: "rgba(255, 255, 255, 0.05)",
          "&:hover": { bgcolor: "rgba(255, 255, 255, 0.1)" },
        }}
      >
        <ListItemIcon>
          <FolderIcon color="primary" />
        </ListItemIcon>
        <ListItemText
          primary={collection.name}
          primaryTypographyProps={{ fontWeight: "bold", color: "white" }}
        />
        {open ? (
          <ExpandLess sx={{ color: "white" }} />
        ) : (
          <ExpandMore sx={{ color: "white" }} />
        )}
      </ListItemButton>
      <Collapse in={open} timeout={150} unmountOnExit>
        {collection?.files && (
          <List component="div" disablePadding>
            {collection.files.map((file) => (
              <FileSystemItem key={file.file_id} file={file} depth={2} />
            ))}
          </List>
        )}
      </Collapse>
    </>
  );
};

export default function FileExplorer() {
  const [Collection, setCollection] = React.useState<CollectionJoinType[]>([]);

  React.useEffect(() => {
    SelectAllCollectionsWithFiles().then((res) => {
      if (res.success && res.data) {
        setCollection((res.data ?? []) as CollectionJoinType[]);
      }
    });
  }, []);

  return (
    <List sx={{ width: "100%", bgcolor: "#27272a" }} component="nav">
      {Collection.map((collection, index) => (
        <React.Fragment key={collection.collection_id}>
          <CollectionItem collection={collection} />
          {index < Collection.length - 1 && (
            <Divider sx={{ borderColor: "#52525c" }} />
          )}
        </React.Fragment>
      ))}
    </List>
  );
}
