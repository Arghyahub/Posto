import React, { memo, useCallback, useEffect, useRef, useState } from "react";
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

// ---------- Shared styles (kept module-level to avoid re-creation) ----------

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

type HeaderRow = {
  key: string;
  value: string;
  enabled: boolean;
};

const BLANK_ROW: HeaderRow = { key: "", value: "", enabled: true };

// ---------- Helpers ----------

/**
 * Convert a headers Record into a HeaderRow[] with a blank trailing row.
 */
function parseHeaders(
  headers: Record<string, string> | undefined,
): HeaderRow[] {
  if (!headers || Object.keys(headers).length === 0) {
    return [{ ...BLANK_ROW }];
  }
  const rows: HeaderRow[] = Object.entries(headers).map(([key, value]) => ({
    key,
    value: String(value),
    enabled: true,
  }));
  return [...rows, { ...BLANK_ROW }];
}

/**
 * Serialize enabled rows into a plain headers Record (omits empty keys).
 */
function buildHeaders(rows: HeaderRow[]): Record<string, string> {
  const result: Record<string, string> = {};
  for (const row of rows) {
    if (row.enabled && row.key.trim()) {
      result[row.key.trim()] = row.value;
    }
  }
  return result;
}

/** Ensure the last row is always a blank sentinel. */
function ensureBlankTrailingRow(rows: HeaderRow[]): HeaderRow[] {
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

const HeadersComponent = ({ lastFileOpen, onRequestChange }: Props) => {
  const [headers, setHeaders] = useState<HeaderRow[]>([{ ...BLANK_ROW }]);

  // Track what we last pushed so inbound sync doesn't self-trigger.
  const lastPushedRef = useRef<string>("");

  // ── Sync inbound: headers changed externally (e.g. file switched) ─────────
  useEffect(() => {
    const incoming = lastFileOpen?.api_data?.headers as
      | Record<string, string>
      | undefined;

    // Cheaply stringify to detect real changes
    const incomingStr = JSON.stringify(incoming ?? {});
    if (incomingStr === lastPushedRef.current) return; // we triggered this

    setHeaders(parseHeaders(incoming));
  }, [lastFileOpen?.api_data?.headers]);

  // ── Push outward ──────────────────────────────────────────────────────────
  const pushHeaders = useCallback(
    (rows: HeaderRow[]) => {
      const headersObj = buildHeaders(rows);
      lastPushedRef.current = JSON.stringify(headersObj);
      onRequestChange("headers", headersObj);
    },
    [onRequestChange],
  );

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleCellChange = (
    idx: number,
    field: "key" | "value",
    newValue: string,
  ) => {
    setHeaders((prev) => {
      const updated = prev.map((row, i) =>
        i === idx ? { ...row, [field]: newValue } : row,
      );
      const withTrailing = ensureBlankTrailingRow(updated);
      pushHeaders(withTrailing);
      return withTrailing;
    });
  };

  const handleToggle = (idx: number) => {
    setHeaders((prev) => {
      const updated = prev.map((row, i) =>
        i === idx ? { ...row, enabled: !row.enabled } : row,
      );
      pushHeaders(updated);
      return updated;
    });
  };

  const handleDelete = (idx: number) => {
    setHeaders((prev) => {
      const filtered = prev.filter((_, i) => i !== idx);
      const withTrailing = ensureBlankTrailingRow(filtered);
      pushHeaders(withTrailing);
      return withTrailing;
    });
  };

  // ── Render ────────────────────────────────────────────────────────────────

  if (!lastFileOpen?.api_data) return <></>;

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
            />
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
              Header
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
              sx={{ ...cellSx, borderLeft: "1px solid #333" }}
            />
          </TableRow>
        </TableHead>

        {/* ── Body ── */}
        <TableBody>
          {headers.map((row, idx) => {
            const isBlankTrailing =
              idx === headers.length - 1 && row.key === "" && row.value === "";

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

                {/* Header key */}
                <TableCell
                  sx={{ ...cellSx, borderLeft: "1px solid #2a2a2a", p: 0 }}
                >
                  <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    placeholder={isBlankTrailing ? "Add header…" : "Header"}
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

                {/* Header value */}
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
                    <Tooltip title="Remove header" placement="left">
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

export default memo(HeadersComponent);
