import React, { useMemo, useState } from "react";
import useQueryStore from "../store/query_store";
import {
  Box,
  Tabs,
  Tab,
  IconButton,
  TextField,
  MenuItem,
  Paper,
  Select,
  Typography,
  InputBase,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useThrottledCallback } from 'use-debounce';

type Props = {};

const TabsComponent = (props: Props) => {
  const FileTabsOpen = useQueryStore((state) => state.FileTabsOpen);
  const CloseFileTab = useQueryStore((state) => state.CloseFileTab);
  const OpenFileTab = useQueryStore((state) => state.OpenFileTab);
  const setFileTabsOpen = useQueryStore((state) => state.setFileTabsOpen);
	const FileIdsOpenHistory = useQueryStore((state) => state.FileIdsOpenHistory);

  const [innerTab, setInnerTab] = useState(0);

  const {lastFileOpen, lastFileIdx} = useMemo(() => {
    if (!FileTabsOpen || FileTabsOpen.length === 0 || FileIdsOpenHistory.length === 0) return { lastFileOpen: null, lastFileIdx: -1 };
		const lastId = FileIdsOpenHistory[FileIdsOpenHistory.length - 1];
		const lastFileOpen = FileTabsOpen.find((tab) => tab.file_id === lastId);
		const lastFileIdx = FileTabsOpen.findIndex((tab) => tab.file_id === lastId);
		return {lastFileOpen, lastFileIdx};
  }, [FileTabsOpen,FileIdsOpenHistory]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
		const tabToOpen = FileTabsOpen[newValue];
    if (tabToOpen) {
      OpenFileTab(tabToOpen);	
    }
  };

  const handleInnerTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setInnerTab(newValue);
  };

  const handleRequestChange = (field: string, value: any) => {
    if (!lastFileOpen) return;
    const updatedTabs = FileTabsOpen.map((tab) => {
      if (tab.file_id === lastFileOpen.file_id) {
        return { ...tab, [field]: value };
      }
      return tab;
    });
    setFileTabsOpen(updatedTabs);
  };

  const handleRename = (fileId: number, newName: string) => {
    const updatedTabs = FileTabsOpen.map((tab) => {
      if (tab.file_id === fileId) {
        return { ...tab, name: newName };
      }
      return tab;
    });
    setFileTabsOpen(updatedTabs);
  };

  if (!lastFileOpen) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          width: "100%",
          color: "white",
          bgcolor: "#1e1e1e",
        }}
      >
        <Typography variant="h6">Open a file from the explorer.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", flexGrow: 1, minWidth: 0, height: "100%", bgcolor: "#1e1e1e" }}>
      {/* Top Tabs */}
      <Paper elevation={0} square sx={{ bgcolor: "#252526", borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={lastFileIdx}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: 48,
            "& .MuiTab-root": {
              color: "#9ca3af",
              textTransform: "none",
              minHeight: 48,
              "&.Mui-selected": { color: "#ffffff", bgcolor: "#1e1e1e" },
            },
            "& .MuiTabs-indicator": { backgroundColor: "#3b82f6" },
          }}
          >
          {FileTabsOpen.map((tab) => (
            <Tab
              disableRipple
              key={tab.file_id}
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <InputBase
                    value={tab.name}
                    onChange={(e) => handleRename(tab.file_id, e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                    sx={{
                      maxWidth: 150,
                      color: "inherit",
                      fontSize: "0.875rem",
                      "& .MuiInputBase-input": {
                        padding: 0,
                        textOverflow: "ellipsis",
                      },
                    }}
                  />
                  <IconButton
                    size="small"
                    component="span"
                    onClick={(e) => {
                      e.stopPropagation();
                      CloseFileTab(tab.file_id);
                    }}
                    sx={{
                      padding: 0.25,
                      color: "inherit",
                      opacity: 0.7,
                      "&:hover": { bgcolor: "rgba(255,255,255,0.1)", opacity: 1 },
                    }}
                  >
                    <CloseIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                </Box>
              }
            />
          ))}
        </Tabs>
      </Paper>

      {/* Content Pane */}
      <Box sx={{ display: "flex", flexDirection: "column", flexGrow: 1, p: 2, gap: 2, bgcolor: "#1e1e1e", color: "white" }}>
        {/* Method and URL */}
        <Box sx={{ display: "flex", gap: 2 }}>
          <Select
            value={lastFileOpen.method || "GET"}
            onChange={(e) => handleRequestChange("method", e.target.value)}
            size="small"
            MenuProps={{
              PaperProps: {
                sx: {
                  bgcolor: "#252526",
                  color: "white",
                  "& .MuiMenuItem-root": {
                    "&:hover": {
                      bgcolor: "#3e3e42",
                    },
                    "&.Mui-selected": {
                      bgcolor: "#37373d",
                      "&:hover": {
                        bgcolor: "#3e3e42",
                      },
                    },
                  },
                },
              },
            }}
            sx={{
              width: 120,
              color: "white",
              ".MuiOutlinedInput-notchedOutline": { borderColor: "#404040" },
              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#606060" },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#3b82f6" },
              ".MuiSvgIcon-root": { color: "white" },
            }}
          >
            {["GET", "POST", "PUT", "DELETE", "PATCH"].map((m) => (
              <MenuItem key={m} value={m}>
                {m}
              </MenuItem>
            ))}
          </Select>
          <TextField
            fullWidth
            size="small"
            placeholder="Enter request URL"
            value={lastFileOpen.url || ""}
            onChange={(e) => handleRequestChange("url", e.target.value)}
            sx={{
              input: { color: "white" },
              ".MuiOutlinedInput-notchedOutline": { borderColor: "#404040" },
              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#606060" },
              "& .Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#3b82f6" },
            }}
          />
        </Box>

        {/* Inner Tabs (Params, Body, etc) */}
        <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
          <Tabs
            value={innerTab}
            onChange={handleInnerTabChange}
            sx={{
              borderBottom: 1,
              borderColor: "#404040",
              minHeight: 36,
              "& .MuiTab-root": { color: "#9ca3af", textTransform: "none", minHeight: 36, py: 1 },
              "& .Mui-selected": { color: "#3b82f6" },
              "& .MuiTabs-indicator": { backgroundColor: "#3b82f6" },
            }}
          >
            <Tab label="Params" />
            <Tab label="Headers" />
            <Tab label="Body" />
          </Tabs>
          <Box sx={{ p: 2, flexGrow: 1, border: "1px solid #404040", borderTop: 0 }}>
            {innerTab === 0 && (
              <Typography variant="body2" color="white">
                Query params key-value pairs (Coming soon)
              </Typography>
            )}
            {innerTab === 1 && (
              <Typography variant="body2" color="white">
                Header key-value pairs (Coming soon)
              </Typography>
            )}
            {innerTab === 2 && (
              <Typography variant="body2" color="white">
                Body content (JSON/Form) (Coming soon)
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default TabsComponent;
