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
import EditIcon from "@mui/icons-material/Edit";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { UpdateFile } from "../../../wailsjs/go/api/FileApi";

import { SelectAllCollectionsWithFiles } from "../../../wailsjs/go/api/CollectionApi";
import useQueryStore, {
  CollectionNestedType,
  CurrentDirSelectionType,
  FileJoinType,
} from "../../store/query_store";

const FileSystemItem = ({
  file,
  depth,
  collection_name,
  onContextMenu,
}: {
  file: FileJoinType;
  depth: number;
  collection_name: string;
  onContextMenu: (
    event: React.MouseEvent<HTMLElement>,
    item: CurrentDirSelectionType,
  ) => void;
}) => {
  const [open, setOpen] = React.useState(false);
  const setCurrentDirSelection = useQueryStore(
    (state) => state.setCurrentDirSelection,
  );
  const CurrentDirSelection = useQueryStore(
    (state) => state.CurrentDirSelection,
  );
  const FileTabsOpen = useQueryStore((state) => state.FileTabsOpen);
  const OpenFileTab = useQueryStore((state) => state.OpenFileTab);

  const isSelected = React.useMemo(
    () => CurrentDirSelection?.file_id === file.file_id,
    [CurrentDirSelection, file.file_id],
  );

  const handleClick = () => {
    if (!file.file_id || !file.collection_id) return;

    if (file.is_folder) {
      setOpen(!open);
    } else {
      OpenFileTab({
        file_id: file.file_id,
        name: file.name,
      });
    }

    setCurrentDirSelection({
      file_id: file.file_id,
      collection_id: file.collection_id,
      parent_id: file.parent_id, // @ts-ignore
      is_folder: file.is_folder,
      type: file.is_folder ? "folder" : "file",
      file_name: file.name,
      collection_name: collection_name,
    });
  };

  React.useEffect(() => {
    if (
      CurrentDirSelection &&
      CurrentDirSelection?.parent_id == file?.file_id &&
      !open
    )
      setOpen(true);
  }, [CurrentDirSelection, file, open]);

  return (
    <>
      <ListItemButton
        onContextMenu={(e) =>
          onContextMenu(e, {
            file_id: file.file_id,
            collection_id: file.collection_id,
            parent_id: file.parent_id, // @ts-ignore
            is_folder: file.is_folder,
            type: file.is_folder ? "folder" : "file",
            file_name: file.name,
            collection_name: collection_name,
          })
        }
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
                  onContextMenu={onContextMenu}
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
  onContextMenu,
}: {
  collection: CollectionNestedType;
  onContextMenu: (
    event: React.MouseEvent<HTMLElement>,
    item: CurrentDirSelectionType,
  ) => void;
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
    if (
      CurrentDirSelection?.file_id &&
      collection.collection_id == CurrentDirSelection?.collection_id &&
      !open
    )
      setOpen(true);
  }, [CurrentDirSelection, collection, open]);

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
        onContextMenu={(e) =>
          onContextMenu(e, {
            collection_id: collection.collection_id,
            collection_name: collection.name,
            type: "collection",
          })
        }
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
              <FileSystemItem
                key={file.file_id}
                file={file}
                depth={2}
                collection_name={collection.name}
                onContextMenu={(e, item) => {
                  if (item?.collection_id) {
                    onContextMenu(e, item);
                  }
                }}
              />
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
  const CurrentDirSelection = useQueryStore(
    (state) => state.CurrentDirSelection,
  );
  const setCurrentDirSelection = useQueryStore(
    (state) => state.setCurrentDirSelection,
  );
  const setCollection = useQueryStore((state) => state.setCollection);
  const Collections = useQueryStore((state) => state.Collections);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [renameDialogOpen, setRenameDialogOpen] = React.useState(false);
  const [newName, setNewName] = React.useState("");
  const open = Boolean(anchorEl);

  const handleContextMenu = (
    event: React.MouseEvent<HTMLElement>,
    item: CurrentDirSelectionType,
  ) => {
    event.preventDefault();
    event.stopPropagation();
    setAnchorEl(event.currentTarget);

    console.log("context menu : ", item);
    setCurrentDirSelection({ ...item } as CurrentDirSelectionType);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleRenameClick = () => {
    if (CurrentDirSelection) {
      // setNewName(CurrentDirSelection.name ?? "");
      if ("file_id" in CurrentDirSelection) {
        // FileJoinType
        setNewName(CurrentDirSelection.file_name ?? "");
      } else {
        // CollectionNestedType
        setNewName(CurrentDirSelection.collection_name ?? "");
      }
      setRenameDialogOpen(true);
      handleClose();
    }
  };

  const handleRenameClose = () => {
    setRenameDialogOpen(false);
    setNewName("");
  };

  const handleRenameSave = async () => {
    if (!CurrentDirSelection?.file_id) return;
    try {
      console.log("Renaming item:", CurrentDirSelection);
      console.log("New name:", newName);
      const resp = await UpdateFile(CurrentDirSelection?.file_id, {
        name: newName,
      });
      if (!resp.success) {
        alert(resp.message);
        return;
      }
      const newCollection = Collections.map((item) => {
        if (item.file_id == CurrentDirSelection.file_id) {
          item.file_name = newName;
        }
        return item;
      });
      setCollection(newCollection);
      handleRenameClose();
    } catch (error) {
      alert("Some error occurred");
    }
  };

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
    <>
      <List sx={{ width: "100%", bgcolor: "#27272a" }} component="nav">
        {CollectionInNestedForm.map((collection, index) => (
          <React.Fragment key={`collection-${collection.collection_id}`}>
            <CollectionItem
              collection={collection}
              onContextMenu={handleContextMenu}
            />
            {index < CollectionInNestedForm.length - 1 && (
              <Divider sx={{ borderColor: "#52525c" }} />
            )}
          </React.Fragment>
        ))}
      </List>

      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        slotProps={{
          list: {
            "aria-labelledby": "basic-button",
            sx: { p: 0.5 },
          },
          paper: {
            elevation: 8,
            sx: {
              bgcolor: "#27272a",
              color: "#e4e4e7",
              border: "1px solid #3f3f46",
              borderRadius: "8px",
              boxShadow:
                "0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.3)",
              minWidth: "140px",
            },
          },
        }}
      >
        <MenuItem
          onClick={handleRenameClick}
          sx={{
            borderRadius: "6px",
            fontSize: "0.875rem",
            mx: 0.5,
            color: "#e4e4e7",
            "&:hover": { bgcolor: "rgba(255, 255, 255, 0.08)" },
          }}
        >
          <ListItemIcon sx={{ minWidth: "28px !important", color: "inherit" }}>
            <EditIcon fontSize="small" style={{ fontSize: "1.1rem" }} />
          </ListItemIcon>
          Rename
        </MenuItem>
      </Menu>

      <Dialog
        open={renameDialogOpen}
        onClose={handleRenameClose}
        PaperProps={{
          sx: {
            bgcolor: "#27272a",
            color: "white",
            border: "1px solid #52525c",
          },
        }}
      >
        <DialogTitle sx={{ color: "white" }}>Rename</DialogTitle>
        <DialogContent sx={{ width: 400 }}>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            type="text"
            fullWidth
            variant="outlined"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleRenameSave();
              }
            }}
            sx={{
              "& .MuiInputBase-input": { color: "white" },
              "& .MuiInputLabel-root": { color: "#a1a1aa" },
              "& .MuiInputLabel-root.Mui-focused": { color: "#3b82f6" },
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#52525c" },
                "&:hover fieldset": { borderColor: "#a1a1aa" },
                "&.Mui-focused fieldset": { borderColor: "#3b82f6" },
              },
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleRenameClose} sx={{ color: "white" }}>
            Cancel
          </Button>
          <Button
            onClick={handleRenameSave}
            sx={{
              color: "#60a5fa",
              "&:hover": { color: "#93c5fd" },
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
