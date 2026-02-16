import React, { useMemo, useState } from "react";
import useQueryStore from "../../store/query_store";
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

type Props = {};

const TabSelection = (props: Props) => {
  const FileTabsOpen = useQueryStore((state) => state.FileTabsOpen);
  const CloseFileTab = useQueryStore((state) => state.CloseFileTab);
  const OpenFileTab = useQueryStore((state) => state.OpenFileTab);
  const FileIdsOpenHistory = useQueryStore((state) => state.FileIdsOpenHistory);

  const { lastFileOpen, lastFileIdx } = useMemo(() => {
    if (
      !FileTabsOpen ||
      FileTabsOpen.length === 0 ||
      FileIdsOpenHistory.length === 0
    )
      return { lastFileOpen: null, lastFileIdx: -1 };
    const lastId = FileIdsOpenHistory[FileIdsOpenHistory.length - 1];
    const lastFileOpen = FileTabsOpen.find((tab) => tab.file_id === lastId);
    const lastFileIdx = FileTabsOpen.findIndex((tab) => tab.file_id === lastId);
    return { lastFileOpen, lastFileIdx };
  }, [FileTabsOpen, FileIdsOpenHistory]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    const tabToOpen = FileTabsOpen[newValue];
    if (tabToOpen) {
      OpenFileTab(tabToOpen);
    }
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
    <Paper
      elevation={0}
      square
      sx={{ bgcolor: "#252526", borderBottom: 1, borderColor: "divider" }}
    >
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
                {tab.name}
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
  );
};

export default TabSelection;
