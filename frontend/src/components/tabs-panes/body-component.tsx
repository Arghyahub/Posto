import React, { memo, useEffect, useRef, useState } from "react";
import { FileTabOpenType } from "../../store/query_store";
import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

// ---------- Editor style constants (must be identical on textarea + mirror) --

const FONT_FAMILY = "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace";
const FONT_SIZE = "0.875rem";
const LINE_HEIGHT = "1.6";
const PADDING = "12px";

// ---------- Types ------------------------------------------------------------

type Props = {
  lastFileOpen: FileTabOpenType;
  onRequestChange: (field: string, value: any) => void;
};

type ValidationState = "empty" | "valid" | "invalid";

type TokenType =
  | "key"
  | "string"
  | "number"
  | "boolean"
  | "null"
  | "punctuation"
  | "whitespace"
  | "unknown";

type Token = { text: string; type: TokenType };

// ---------- JSON Tokenizer ---------------------------------------------------

function tokenize(src: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < src.length) {
    // Whitespace (including newlines)
    if (/\s/.test(src[i])) {
      let j = i + 1;
      while (j < src.length && /\s/.test(src[j])) j++;
      tokens.push({ text: src.slice(i, j), type: "whitespace" });
      i = j;
      continue;
    }

    // String token — scan to the closing unescaped quote
    if (src[i] === '"') {
      let j = i + 1;
      while (j < src.length) {
        if (src[j] === "\\") {
          j += 2;
          continue;
        }
        if (src[j] === '"') {
          j++;
          break;
        }
        j++;
      }
      const raw = src.slice(i, j);
      // Peek past optional whitespace for a colon → it's a key
      let k = j;
      while (k < src.length && (src[k] === " " || src[k] === "\t")) k++;
      const isKey = src[k] === ":";
      tokens.push({ text: raw, type: isKey ? "key" : "string" });
      i = j;
      continue;
    }

    // Number (including negative and decimals)
    if (src[i] === "-" || /\d/.test(src[i])) {
      let j = i + 1;
      while (j < src.length && /[\d.eE+\-]/.test(src[j])) j++;
      tokens.push({ text: src.slice(i, j), type: "number" });
      i = j;
      continue;
    }

    // Keywords
    for (const kw of ["true", "false"] as const) {
      if (src.startsWith(kw, i)) {
        tokens.push({ text: kw, type: "boolean" });
        i += kw.length;
        continue;
      }
    }
    if (src.startsWith("null", i)) {
      tokens.push({ text: "null", type: "null" });
      i += 4;
      continue;
    }

    // Punctuation
    if ("{}[],:".includes(src[i])) {
      tokens.push({ text: src[i], type: "punctuation" });
      i++;
      continue;
    }

    // Fallback — emit one character as unknown
    tokens.push({ text: src[i], type: "unknown" });
    i++;
  }

  return tokens;
}

const TOKEN_COLOR: Record<TokenType, string> = {
  key: "#e5c07b", // warm yellow
  string: "#61afef", // blue
  number: "#61afef", // blue
  boolean: "#c678dd", // purple
  null: "#c678dd", // purple
  punctuation: "#abb2bf", // light gray
  whitespace: "inherit",
  unknown: "#d4d4d4",
};

function renderHighlighted(src: string): React.ReactNode {
  if (!src) return null;
  return tokenize(src).map((tok, idx) => (
    <span key={idx} style={{ color: TOKEN_COLOR[tok.type] }}>
      {tok.text}
    </span>
  ));
}

// ---------- Helpers ----------------------------------------------------------

function serializeBody(body: Record<any, any> | undefined): string {
  if (body === undefined || body === null) return "";
  try {
    return JSON.stringify(body, null, 2);
  } catch {
    return "";
  }
}

function validateJson(text: string): {
  state: ValidationState;
  parsed?: Record<any, any>;
  errorMsg?: string;
} {
  const trimmed = text.trim();
  if (!trimmed) return { state: "empty" };
  try {
    const parsed = JSON.parse(trimmed);
    if (
      typeof parsed !== "object" ||
      Array.isArray(parsed) ||
      parsed === null
    ) {
      return {
        state: "invalid",
        errorMsg: "Body must be a JSON object { }, not an array or primitive.",
      };
    }
    return { state: "valid", parsed };
  } catch (e: any) {
    return { state: "invalid", errorMsg: e?.message ?? "Invalid JSON" };
  }
}

// ---------- Component --------------------------------------------------------

const BodyComponent = ({ lastFileOpen, onRequestChange }: Props) => {
  const [text, setText] = useState<string>("");
  const [validation, setValidation] = useState<{
    state: ValidationState;
    errorMsg?: string;
  }>({ state: "empty" });

  const lastPushedRef = useRef<string>("");
  const mirrorRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ── Inbound sync ────────────────────────────────────────────────────────────
  useEffect(() => {
    const incoming = lastFileOpen?.api_data?.body as
      | Record<any, any>
      | undefined;
    const serialized = serializeBody(incoming);
    if (serialized === lastPushedRef.current) return;
    setText(serialized);
    setValidation(validateJson(serialized));
  }, [lastFileOpen?.api_data?.body]);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    const result = validateJson(newText);
    setValidation({ state: result.state, errorMsg: result.errorMsg });

    if (result.state === "valid" && result.parsed !== undefined) {
      const serialized = serializeBody(result.parsed);
      lastPushedRef.current = serialized;
      onRequestChange("body", result.parsed);
    } else if (result.state === "empty") {
      lastPushedRef.current = "";
      onRequestChange("body", {});
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== "Tab") return;
    e.preventDefault();
    const el = e.currentTarget;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const spaces = "  ";
    const next = text.substring(0, start) + spaces + text.substring(end);
    setText(next);
    requestAnimationFrame(() => {
      el.selectionStart = start + spaces.length;
      el.selectionEnd = start + spaces.length;
    });
  };

  const handleFormat = () => {
    const result = validateJson(text);
    if (result.state === "valid" && result.parsed !== undefined) {
      const pretty = JSON.stringify(result.parsed, null, 2);
      setText(pretty);
      lastPushedRef.current = pretty;
      onRequestChange("body", result.parsed);
    }
  };

  // Sync textarea scroll → mirror div so highlighted text tracks perfectly
  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (mirrorRef.current) {
      mirrorRef.current.scrollTop = e.currentTarget.scrollTop;
      mirrorRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  if (!lastFileOpen?.api_data) return <></>;

  const isValid = validation.state === "valid";
  const isInvalid = validation.state === "invalid";
  const isEmpty = validation.state === "empty";

  const borderColor = isInvalid ? "#ef4444" : isValid ? "#22c55e" : "#333";

  const editorStyle: React.CSSProperties = {
    fontFamily: FONT_FAMILY,
    fontSize: FONT_SIZE,
    lineHeight: LINE_HEIGHT,
    padding: PADDING,
    whiteSpace: "pre-wrap",
    wordBreak: "break-all",
    boxSizing: "border-box",
  };

  return (
    <Box
      sx={{ display: "flex", flexDirection: "column", height: "100%", gap: 0 }}
    >
      {/* ── Toolbar ── */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 1.5,
          py: 0.5,
          bgcolor: "#252526",
          borderRadius: "4px 4px 0 0",
          border: `1px solid ${borderColor}`,
          borderBottom: "none",
          transition: "border-color 0.2s",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
          {isEmpty && (
            <Typography
              variant="caption"
              sx={{ color: "#6b7280", fontFamily: "monospace" }}
            >
              JSON body · empty
            </Typography>
          )}
          {isValid && (
            <>
              <CheckCircleOutlineIcon sx={{ fontSize: 14, color: "#22c55e" }} />
              <Typography
                variant="caption"
                sx={{ color: "#22c55e", fontFamily: "monospace" }}
              >
                Valid JSON
              </Typography>
            </>
          )}
          {isInvalid && (
            <>
              <ErrorOutlineIcon sx={{ fontSize: 14, color: "#ef4444" }} />
              <Typography
                variant="caption"
                sx={{
                  color: "#ef4444",
                  fontFamily: "monospace",
                  maxWidth: 480,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {validation.errorMsg}
              </Typography>
            </>
          )}
        </Box>

        <Tooltip title="Format JSON" placement="left">
          <span>
            <IconButton
              size="small"
              onClick={handleFormat}
              disabled={!isValid}
              sx={{
                color: isValid ? "#3b82f6" : "#444",
                p: 0.5,
                "&:hover": { color: isValid ? "#60a5fa" : "#444" },
              }}
            >
              <AutoFixHighIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </span>
        </Tooltip>
      </Box>

      {/* ── Editor area ── */}
      <Box
        sx={{
          position: "relative",
          flexGrow: 1,
          minHeight: 220,
          border: `1px solid ${borderColor}`,
          borderTop: "none",
          borderRadius: "0 0 4px 4px",
          transition: "border-color 0.2s",
          overflow: "hidden",
          bgcolor: "#1a1a1a",
        }}
      >
        {/* Highlighted mirror layer — sits behind, pointer-events disabled */}
        <Box
          ref={mirrorRef}
          aria-hidden="true"
          sx={{
            position: "absolute",
            inset: 0,
            overflow: "hidden", // scroll is driven by onScroll above
            pointerEvents: "none",
            ...editorStyle,
            m: 0,
          }}
        >
          {text ? (
            renderHighlighted(text)
          ) : (
            <span style={{ color: "#3d3d3d" }}>{'{\n  "key": "value"\n}'}</span>
          )}
        </Box>

        {/* Transparent textarea — captures all input */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onScroll={handleScroll}
          spellCheck={false}
          style={{
            ...editorStyle,
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            resize: "none",
            background: "transparent",
            color: "transparent",
            caretColor: "#abb2bf",
            border: "none",
            outline: "none",
            overflowY: "auto",
            overflowX: "auto",
            zIndex: 1,
            // Scrollbar
            scrollbarWidth: "thin",
            scrollbarColor: "#3a3a3a transparent",
          }}
        />
      </Box>
    </Box>
  );
};

export default memo(BodyComponent);
