import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import LibraryAddIcon from "@mui/icons-material/LibraryAdd";
import CreateNewFolderIcon from "@mui/icons-material/CreateNewFolder";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import FileExplorer from "./file-explorer";
import useQueryStore from "../../store/query_store";
import {CreateFileOrFolder} from "../../../wailsjs/go/api/FileApi"
import logo from "../../assets/images/logo.png"

const drawerWidth = 300;

export default function PermanentDrawerLeft() {
  const CurrentDirSelection = useQueryStore(
    (state) => state.CurrentDirSelection,
  );
  const Collections = useQueryStore((state) => state.Collections);
  const setCollection = useQueryStore((state) => state.setCollection);
  const setCurrentDirSelection = useQueryStore(
    (state) => state.setCurrentDirSelection,
  );

  async function handleFileCreation({ is_folder }: { is_folder: boolean }) {
    if (!CurrentDirSelection) return;
    console.log(CurrentDirSelection)

    let parent_id;
    if (CurrentDirSelection.type == "file")
      parent_id = CurrentDirSelection.parent_id
    if (CurrentDirSelection.type == "folder")
      parent_id = CurrentDirSelection.file_id

    const resp = await CreateFileOrFolder({
      CollectionId: CurrentDirSelection.collection_id,
      ParentId: parent_id,
      IsFolder: is_folder,
      Name: is_folder ? "New Folder" : "New File",      
    })

    if (resp.success && resp.data) {
      const newCollection = [...Collections]

      newCollection.push({
        collection_id: CurrentDirSelection.collection_id,
        collection_name: CurrentDirSelection.collection_name,
        file_id: resp.data,
        file_name: is_folder ? "New Folder" : "New File",
        is_folder: is_folder,
        parent_id: parent_id,
      })
      setCollection(newCollection)
      setCurrentDirSelection({
        collection_id: CurrentDirSelection.collection_id,
        collection_name: CurrentDirSelection.collection_name,
        type: is_folder ? "folder" : "file",
        file_id: resp.data,
        is_folder: is_folder,
        parent_id: parent_id
      })
    }
  }

  return (
    <Box sx={{ width: drawerWidth, flexShrink: 0 }}>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            bgcolor: "#27272a",
            borderRight: "1px solid #52525c",
          },
        }}
        variant="permanent"
        anchor="left"
      >
        {/* <Toolbar /> */}
        <div className="flex flex-row gap-2 items-center">
          <img src={logo} alt="Logo" className="size-16 p-1" />
          <p className="text-white font-bold text-2xl">Posto</p>
        </div>
        <div className="flex flex-row gap-1 w-full items-center px-4 pb-2">
          <Tooltip title="Add Collection">
            <IconButton
              size="small"
              sx={{ color: "#d4d4d8", "&.Mui-disabled": { color: "#71717a" } }}
            >
              <LibraryAddIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Import Collection">
            <IconButton
              size="small"
              sx={{ color: "#d4d4d8", "&.Mui-disabled": { color: "#71717a" } }}
            >
              <FileUploadIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Export Collection">
            <IconButton
              size="small"
              sx={{ color: "#d4d4d8", "&.Mui-disabled": { color: "#71717a" } }}
            >
              <FileDownloadIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <div className="ml-auto"></div>

          <Tooltip title="New Folder" sx={{ marginLeft: "auto" }}>
            <IconButton
              size="small"
              onClick={() => handleFileCreation({ is_folder: true })}
              sx={{ color: "#d4d4d8", "&.Mui-disabled": { color: "#71717a" } }}
              disabled={!CurrentDirSelection}
            >
              <CreateNewFolderIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="New File">
            <IconButton
              size="small"
              onClick={() => handleFileCreation({ is_folder: false })}
              sx={{ color: "#d4d4d8", "&.Mui-disabled": { color: "#71717a" } }}
              disabled={!CurrentDirSelection}
            >
              <NoteAddIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </div>

        <Divider />
        <FileExplorer />
        {/* <List>
          {['Inbox', 'Starred', 'Send email', 'Drafts'].map((text, index) => (
            <ListItem key={text} disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
                </ListItemIcon>
                <ListItemText primary={text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Divider />
        <List>
          {['All mail', 'Trash', 'Spam'].map((text, index) => (
            <ListItem key={text} disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
                </ListItemIcon>
                <ListItemText primary={text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List> */}
      </Drawer>
    </Box>
  );
}
