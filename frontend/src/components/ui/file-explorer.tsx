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
import {
  SelectAllCollectionsWithFiles,
  SelectAllCollectionsWithFilesNested,
} from "../../../wailsjs/go/api/CollectionApi";
import useQueryStore, {
  CollectionNestedType,
  FileJoinType,
} from "../../store/query_store";

const FileSystemItem = ({
  file,
  depth,
  collection_name
}: {
  file: FileJoinType;
  depth: number;
  collection_name: string;
}) => {
  const [open, setOpen] = React.useState(false);
  const setCurrentDirSelection = useQueryStore(
    (state) => state.setCurrentDirSelection,
  );
  const CurrentDirSelection = useQueryStore(
    (state) => state.CurrentDirSelection,
  );

  const isSelected = React.useMemo(
    () => CurrentDirSelection?.file_id === file.file_id,
    [CurrentDirSelection, file.file_id],
  );

  const handleClick = () => {
    if (file.is_folder) {
      setOpen(!open);
    }
    if (file.collection_id) {
      setCurrentDirSelection({
        file_id: file.file_id,
        collection_id: file.collection_id,
        parent_id: file.parent_id, // @ts-ignore
        is_folder: file.is_folder,
        type: file.is_folder ? "folder" : "file",
        collection_name: collection_name,
      });
    }
  };

  React.useEffect(() => {
    if (CurrentDirSelection && CurrentDirSelection?.parent_id==file?.file_id)
      setOpen(true)
  },[CurrentDirSelection,file])

  return (
    <>
      <ListItemButton
        disableRipple
        sx={{
          pl: 2 * depth,
          bgcolor: isSelected ? "rgba(255, 255, 255, 0.05)" : "transparent",
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
                  collection_name={collection_name}
                />
              ))}
            </List>
          )}
        </Collapse>
      )}
    </>
  );
};

const CollectionItem = ({
  collection,
}: {
  collection: CollectionNestedType;
}) => {
  const [open, setOpen] = React.useState(false); // Collections default open
  const setCurrentDirSelection = useQueryStore(
    (state) => state.setCurrentDirSelection,
  );
  const CurrentDirSelection = useQueryStore(
    (state) => state.CurrentDirSelection,
  );

  const isSelected = React.useMemo(
    () =>
      CurrentDirSelection?.collection_id === collection.collection_id &&
      CurrentDirSelection?.type === "collection",
    [CurrentDirSelection, collection.collection_id],
  );

  React.useEffect(() => {
    if (CurrentDirSelection && collection.collection_id==CurrentDirSelection.collection_id)
      setOpen(true)
  },[CurrentDirSelection,collection])

  const handleClick = () => {
    setOpen(!open);
    if (collection.collection_id) {
      setCurrentDirSelection({
        collection_id: collection.collection_id,
        type: "collection",
        collection_name: collection.name,
      });
    }
  };

  return (
    <>
      <ListItemButton
        onClick={handleClick}
        disableRipple
        sx={{
          bgcolor: isSelected ? "rgba(255, 255, 255, 0.05)" : "transparent",
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
              <FileSystemItem key={file.file_id} file={file} depth={2} collection_name={collection.name} />
            ))}
          </List>
        )}
      </Collapse>
    </>
  );
};

export default function FileExplorer() {
  const CollectionInNestedForm = useQueryStore(
    (state) => state.CollectionInNestedForm,
  );
  const setCollection = useQueryStore((state) => state.setCollection);

  React.useEffect(() => {
    // SelectAllCollectionsWithFilesNested().then((res) => {
    //   if (res.success && res.data) {
    //     setCollection((res.data ?? []) as CollectionJoinType[]);
    //   }
    // });

    SelectAllCollectionsWithFiles().then((res) => {
      if (res.success && res.data) {
        setCollection(res.data ?? []);
      }
    });
  }, []);

  return (
    <List sx={{ width: "100%", bgcolor: "#27272a" }} component="nav">
      {CollectionInNestedForm.map((collection, index) => (
        <React.Fragment key={`collection-${collection.collection_id}`}>
          <CollectionItem collection={collection} />
          {index < CollectionInNestedForm.length - 1 && (
            <Divider sx={{ borderColor: "#52525c" }} />
          )}
        </React.Fragment>
      ))}
    </List>
  );
}
