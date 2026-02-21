import React, { useCallback, useEffect, useRef, useState } from "react";
import { FileTabOpenType } from "../../store/query_store";
import {
  Box,
  Checkbox,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

const cellSx = {
  borderColor: "#333",
  p: 0,
  "&:last-child": { borderRight: 0 },
};

const inputSx = {
  "& .MuiInputBase-root": {
    color: "white",
    fontSize: "1rem",
  },
  "& .MuiOutlinedInput-notchedOutline": { border: "none" },
  "& .MuiInputBase-input": { px: 1.5, py: 0.75 },
};

// ---------- Types ----------

type ParamRow = {
  key: string;
  value: string;
  enabled: boolean;
};

const BLANK_ROW: ParamRow = { key: "", value: "", enabled: true };

// ---------- Helpers ----------

/**
 * Parse the query-string of a URL string into ParamRow[].
 * Always ends with a blank trailing row.
 */
function parseParams(urlStr: string): ParamRow[] {
  try {
    const url = new URL(urlStr);
    const rows: ParamRow[] = Array.from(url.searchParams.entries()).map(
      ([key, value]) => ({ key, value, enabled: true }),
    );
    return [...rows, { ...BLANK_ROW }];
  } catch {
    return [{ ...BLANK_ROW }];
  }
}

/**
 * Rebuild a URL string by applying the enabled param rows to the base URL.
 * Rows where enabled=false are kept in state but not appended to the URL.
 */
function buildUrl(urlStr: string, rows: ParamRow[]): string {
  try {
    const url = new URL(urlStr);
    // Clear existing search params
    url.search = "";
    for (const row of rows) {
      if (row.enabled && row.key.trim()) {
        url.searchParams.append(row.key, row.value);
      }
    }
    return url.toString();
  } catch {
    return urlStr;
  }
}

/** Ensure the last row is always a blank row (auto-append sentinel). */
function ensureBlankTrailingRow(rows: ParamRow[]): ParamRow[] {
  const last = rows[rows.length - 1];
  if (!last || last.key !== "" || last.value !== "") {
    return [...rows, { ...BLANK_ROW }];
  }
  return rows;
}

// ---------- Component ----------

type Props = {
  lastFileOpen: FileTabOpenType;
  onRequestChange: (field: string, value: any) => void;
};

const ParamsComponent = ({ lastFileOpen, onRequestChange }: Props) => {
  const [params, setParams] = useState<ParamRow[]>([{ ...BLANK_ROW }]);

  // Track which URL we last synced FROM so we don't create circular updates.
  const lastSyncedUrl = useRef<string | undefined>(undefined);

  // ── Sync inbound: URL changes externally (user typed in URL bar) ──────────
  useEffect(() => {
    const currentUrl = lastFileOpen?.api_data?.url;
    if (currentUrl === lastSyncedUrl.current) return; // we triggered this change
    lastSyncedUrl.current = currentUrl;
    setParams(parseParams(currentUrl ?? ""));
  }, [lastFileOpen?.api_data?.url]);

  // ── Internal: propagate param edits back to URL ───────────────────────────
  const pushParams = useCallback(
    (updatedRows: ParamRow[]) => {
      const currentUrl = lastFileOpen?.api_data?.url ?? "";
      const newUrl = buildUrl(currentUrl, updatedRows);
      if (newUrl !== currentUrl) {
        lastSyncedUrl.current = newUrl; // mark so the effect above is a no-op
        onRequestChange("url", newUrl);
      }
    },
    [lastFileOpen?.api_data?.url, onRequestChange],
  );

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleCellChange = (
    idx: number,
    field: "key" | "value",
    newValue: string,
  ) => {
    setParams((prev) => {
      const updated = prev.map((row, i) =>
        i === idx ? { ...row, [field]: newValue } : row,
      );

      // If the user edited the last (blank sentinel) row, auto-append a new blank
      const withTrailing = ensureBlankTrailingRow(updated);

      pushParams(withTrailing);
      return withTrailing;
    });
  };

  const handleToggle = (idx: number) => {
    setParams((prev) => {
      const updated = prev.map((row, i) =>
        i === idx ? { ...row, enabled: !row.enabled } : row,
      );
      pushParams(updated);
      return updated;
    });
  };

  const handleDelete = (idx: number) => {
    setParams((prev) => {
      const filtered = prev.filter((_, i) => i !== idx);
      const withTrailing = ensureBlankTrailingRow(filtered);
      pushParams(withTrailing);
      return withTrailing;
    });
  };

  // ── Render ────────────────────────────────────────────────────────────────

  // Don't render if there is no url available to attach params to
  if (!lastFileOpen?.api_data) return <></>;
  if (!lastFileOpen?.api_data?.url?.length)
    return (
      <Box sx={{ color: "#9ca3af", fontSize: "0.85rem", p: 1 }}>
        Enter a URL above to manage query parameters.
      </Box>
    );

  return (
    <TableContainer
      sx={{
        border: "1px solid #333",
        borderRadius: 1,
        overflow: "auto",
      }}
    >
      <Table size="small" sx={{ tableLayout: "fixed" }}>
        {/* ── Header ── */}
        <TableHead>
          <TableRow sx={{ bgcolor: "#252526" }}>
            <TableCell
              width={40}
              sx={{
                ...cellSx,
                color: "#6b7280",
                fontSize: "0.72rem",
                fontWeight: 600,
                textTransform: "uppercase",
                textAlign: "center",
              }}
            >
              {/* checkbox col */}
            </TableCell>
            <TableCell
              sx={{
                ...cellSx,
                color: "#6b7280",
                fontSize: "0.72rem",
                fontWeight: 600,
                textTransform: "uppercase",
                pl: 1.5,
                borderLeft: "1px solid #333",
              }}
            >
              Key
            </TableCell>
            <TableCell
              sx={{
                ...cellSx,
                color: "#6b7280",
                fontSize: "0.72rem",
                fontWeight: 600,
                textTransform: "uppercase",
                pl: 1.5,
                borderLeft: "1px solid #333",
              }}
            >
              Value
            </TableCell>
            <TableCell
              width={44}
              sx={{
                ...cellSx,
                borderLeft: "1px solid #333",
              }}
            />
          </TableRow>
        </TableHead>

        {/* ── Body ── */}
        <TableBody>
          {params.map((row, idx) => {
            const isBlankTrailing =
              idx === params.length - 1 && row.key === "" && row.value === "";

            return (
              <TableRow
                key={idx}
                sx={{
                  "&:hover": { bgcolor: "#2a2a2a" },
                  bgcolor: idx % 2 === 0 ? "#1e1e1e" : "#212121",
                  opacity: row.enabled ? 1 : 0.45,
                }}
              >
                {/* Enabled checkbox */}
                <TableCell
                  width={40}
                  sx={{ ...cellSx, textAlign: "center", py: 0 }}
                >
                  {!isBlankTrailing && (
                    <Checkbox
                      size="small"
                      checked={row.enabled}
                      onChange={() => handleToggle(idx)}
                      sx={{
                        color: "#555",
                        p: 0.5,
                        "&.Mui-checked": { color: "#3b82f6" },
                      }}
                    />
                  )}
                </TableCell>

                {/* Key */}
                <TableCell
                  sx={{ ...cellSx, borderLeft: "1px solid #2a2a2a", p: 0 }}
                >
                  <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    placeholder={isBlankTrailing ? "Add key…" : "Key"}
                    value={row.key}
                    onChange={(e) =>
                      handleCellChange(idx, "key", e.target.value)
                    }
                    sx={{
                      ...inputSx,
                      "& .MuiInputBase-input::placeholder": {
                        color: "#4b5563",
                        opacity: 1,
                      },
                    }}
                  />
                </TableCell>

                {/* Value */}
                <TableCell
                  sx={{ ...cellSx, borderLeft: "1px solid #2a2a2a", p: 0 }}
                >
                  <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    placeholder={isBlankTrailing ? "Add value…" : "Value"}
                    value={row.value}
                    onChange={(e) =>
                      handleCellChange(idx, "value", e.target.value)
                    }
                    sx={{
                      ...inputSx,
                      "& .MuiInputBase-input::placeholder": {
                        color: "#4b5563",
                        opacity: 1,
                      },
                    }}
                  />
                </TableCell>

                {/* Delete */}
                <TableCell
                  width={44}
                  sx={{
                    ...cellSx,
                    borderLeft: "1px solid #2a2a2a",
                    textAlign: "center",
                    py: 0,
                  }}
                >
                  {!isBlankTrailing && (
                    <Tooltip title="Remove param" placement="left">
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(idx)}
                        sx={{
                          color: "#6b7280",
                          p: 0.5,
                          "&:hover": { color: "#ef4444" },
                        }}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ParamsComponent;
