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
import useQueryStore, {
  CollectionJoinType,
  FileJoinType,
} from "../../store/query_store";

const FileSystemItem = ({
  file,
  depth,
}: {
  file: FileJoinType;
  depth: number;
}) => {
  const [open, setOpen] = React.useState(false);
  const setCurrentDirSelection = useQueryStore(
    (state) => state.setCurrentDirSelection,
  );

  const handleClick = () => {
    if (file.is_folder) {
      setOpen(!open);
    }
    if (file.collection_id) {
      setCurrentDirSelection({
        file_id: file.file_id,
        collection_id: file.collection_id,
        parent_id: file.parent_id,
        is_folder: file.is_folder,
        type: file.is_folder ? "folder" : "file",
      });
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
  const setCurrentDirSelection = useQueryStore(
    (state) => state.setCurrentDirSelection,
  );

  const handleClick = () => {
    setOpen(!open);
    if (collection.collection_id) {
      setCurrentDirSelection({
        collection_id: collection.collection_id,
        type: "collection",
      });
    }
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
  const Collections = useQueryStore((state) => state.Collections);
  const setCollection = useQueryStore((state) => state.setCollection);

  React.useEffect(() => {
    SelectAllCollectionsWithFiles().then((res) => {
      if (res.success && res.data) {
        setCollection((res.data ?? []) as CollectionJoinType[]);
      }
    });
  }, []);

  return (
    <List sx={{ width: "100%", bgcolor: "#27272a" }} component="nav">
      {Collections.map((collection, index) => (
        <React.Fragment key={collection.collection_id}>
          <CollectionItem collection={collection} />
          {index < Collections.length - 1 && (
            <Divider sx={{ borderColor: "#52525c" }} />
          )}
        </React.Fragment>
      ))}
    </List>
  );
}
