import React, { useEffect, useMemo, useState } from "react";
import useQueryStore, {
  FileTabOpenType,
  HttpMethodType,
} from "../../store/query_store";
import {
  Box,
  Tabs,
  Tab,
  TextField,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import { GetRequestData, UpdateFile } from "../../../wailsjs/go/api/FileApi";
import { useThrottledCallback } from "use-debounce";
import ParamsComponent from "./params-component";
import HeadersComponent from "./headers-component";
import BodyComponent from "./body-component";

type Props = {};

const httpMethods: HttpMethodType[] = ["GET", "POST", "PUT", "DELETE", "PATCH"];

const Panes = (props: Props) => {
  const FileTabsOpen = useQueryStore((state) => state.FileTabsOpen);
  const setFileTabsOpen = useQueryStore((state) => state.setFileTabsOpen);
  const FileIdsOpenHistory = useQueryStore((state) => state.FileIdsOpenHistory);
  const [innerTab, setInnerTab] = useState(0);
  const throttledDbFileUpdate = useThrottledCallback(handleDbFileUpdate, 800);

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

  const handleRequestChange = (field: any, value: any = "") => {
    if (!lastFileOpen) return;
    const updatedTabs = FileTabsOpen.map((tab) => {
      if (tab.file_id === lastFileOpen.file_id) {
        if (!tab.api_data) tab.api_data = {};
        // @ts-ignore
        tab.api_data[field] = value;
        return { ...tab };
      }
      return tab;
    });
    setFileTabsOpen(updatedTabs);
    throttledDbFileUpdate(lastFileOpen.file_id, { [field]: value });
  };

  console.log("FileTabsOpen", FileTabsOpen);

  const handleInnerTabChange = (
    event: React.SyntheticEvent,
    newValue: number,
  ) => {
    setInnerTab(newValue);
  };

  async function handleDbFileUpdate(
    file_id: number,
    data: { url?: string; method?: HttpMethodType; body?: any; headers?: any },
  ) {
    try {
      // Go stores body/headers as JSON strings — serialize objects before sending.
      const dbPayload: typeof data = { ...data };
      if (dbPayload.body !== undefined)
        dbPayload.body = JSON.stringify(dbPayload.body);
      if (dbPayload.headers !== undefined)
        dbPayload.headers = JSON.stringify(dbPayload.headers);

      const resp = await UpdateFile(file_id, dbPayload);
      if (resp.success) {
        console.log("updated to db");
      } else {
        alert(resp.message);
      }
    } catch (error) {
      alert("Something went wrong");
    }
  }

  async function handleGetRequestData(file_id: number) {
    try {
      const res = await GetRequestData(file_id);
      if (res.success) {
        // Go returns body/headers as JSON strings — parse them into objects for the store.
        const parseJsonField = (raw: any, fallback: any) => {
          if (!raw) return fallback;
          try {
            return JSON.parse(raw);
          } catch {
            return fallback;
          }
        };

        const updatedTabs = FileTabsOpen.map((tab) => {
          if (tab.file_id === file_id) {
            return {
              ...tab,
              api_data: {
                method: res.data?.method ?? "GET",
                url: res.data?.url ?? "",
                body: parseJsonField(res.data?.body, {}),
                headers: parseJsonField(res.data?.headers, {}),
              },
            };
          }
          return tab;
        }) as FileTabOpenType[];

        setFileTabsOpen(updatedTabs);
      } else {
        alert(res.message);
      }
    } catch (error) {
      alert("Something went wrong");
    }
  }

  useEffect(() => {
    if (lastFileOpen && !lastFileOpen?.api_data) {
      handleGetRequestData(lastFileOpen.file_id);
    }
  }, [lastFileOpen]);

  if (!lastFileOpen) return <></>;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        flexGrow: 1,
        p: 2,
        gap: 2,
        bgcolor: "#1e1e1e",
        color: "white",
      }}
    >
      {/* Method and URL */}
      <Box sx={{ display: "flex", gap: 2 }}>
        <Select
          value={lastFileOpen.api_data?.method || "GET"}
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
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "#606060",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#3b82f6",
            },
            ".MuiSvgIcon-root": { color: "white" },
          }}
        >
          {httpMethods.map((m) => (
            <MenuItem key={m} value={m}>
              {m}
            </MenuItem>
          ))}
        </Select>
        <TextField
          fullWidth
          size="small"
          placeholder="Enter request URL"
          value={lastFileOpen.api_data?.url || ""}
          onChange={(e) => handleRequestChange("url", e.target.value ?? "")}
          sx={{
            input: { color: "white" },
            ".MuiOutlinedInput-notchedOutline": { borderColor: "#404040" },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "#606060",
            },
            "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#3b82f6",
            },
          }}
        />
      </Box>

      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        <Tabs
          value={innerTab}
          onChange={handleInnerTabChange}
          sx={{
            borderBottom: 1,
            borderColor: "#404040",
            minHeight: 36,
            "& .MuiTab-root": {
              color: "#9ca3af",
              textTransform: "none",
              minHeight: 36,
              py: 1,
            },
            "& .Mui-selected": { color: "#3b82f6" },
            "& .MuiTabs-indicator": { backgroundColor: "#3b82f6" },
          }}
        >
          <Tab label="Params" />
          <Tab label="Headers" />
          <Tab label="Body" />
        </Tabs>
        <Box
          sx={{
            p: 2,
            flexGrow: 1,
            border: "1px solid #404040",
            borderTop: 0,
          }}
        >
          {/* Params */}
          {innerTab === 0 && (
            <ParamsComponent
              lastFileOpen={lastFileOpen}
              onRequestChange={handleRequestChange}
            />
          )}
          {/* Headers */}
          {innerTab === 1 && (
            <HeadersComponent
              lastFileOpen={lastFileOpen}
              onRequestChange={handleRequestChange}
            />
          )}
          {/* Body */}
          {innerTab === 2 && (
            <BodyComponent
              lastFileOpen={lastFileOpen}
              onRequestChange={handleRequestChange}
            />
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Panes;
