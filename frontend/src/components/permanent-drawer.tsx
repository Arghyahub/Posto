import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import MailIcon from "@mui/icons-material/Mail";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import LibraryAddIcon from "@mui/icons-material/LibraryAdd";
import CreateNewFolderIcon from "@mui/icons-material/CreateNewFolder";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { useEffect, useState } from "react";
import { models } from "../../wailsjs/go/models";
import { SelectAllCollections } from "../../wailsjs/go/api/CollectionApi";
import FileExplorer from "./ui/file-explorer";
import logo from "../assets/images/logo.png";

const drawerWidth = 300;

type FolderOrFileType =
  | { is_folder: true; files: FileType[] }
  | { is_folder: false };

type FileType = FolderOrFileType & {
  pk_file_id: number;
  collection_id: number;
  parent_id?: number;
  name: string;
  created_at: string;
  updated_at: string;
};

interface CollectionType {
  pk_collection_id: number;
  name: string;
  created_at: string;
  updated_at: string;
  files: FileType[];
}

export default function PermanentDrawerLeft() {
  const [Collection, setCollection] = useState<CollectionType[]>([]);

  useEffect(() => {
    SelectAllCollections().then((res) => {
      console.log("res : ", res);
    });
  }, []);

  return (
    <Box sx={{ display: "flex" }}>
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
            <IconButton size="small" sx={{ color: "#d4d4d8" }}>
              <LibraryAddIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Import Collection">
            <IconButton size="small" sx={{ color: "#d4d4d8" }}>
              <FileUploadIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Export Collection">
            <IconButton size="small" sx={{ color: "#d4d4d8" }}>
              <FileDownloadIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <div className="ml-auto"></div>
          <Tooltip title="New Folder" sx={{ marginLeft: "auto" }}>
            <IconButton size="small" sx={{ color: "#d4d4d8" }}>
              <CreateNewFolderIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="New File">
            <IconButton size="small" sx={{ color: "#d4d4d8" }}>
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
