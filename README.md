<p align="center">
  <img src="build/appicon.png" alt="Posto Logo" width="128" height="128" />
</p>

<h1 align="center">Posto</h1>

<p align="center">
  <strong>A blazing-fast, lightweight desktop API client built with <a href="https://wails.io">Wails</a></strong>
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-why-posto">Why Posto?</a> •
  <a href="#%EF%B8%8F-tech-stack">Tech Stack</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-development">Development</a> •
  <a href="#-building">Building</a> •
  <a href="#-project-structure">Project Structure</a> •
  <a href="#-contributing">Contributing</a>
</p>

---

## ✨ Download builds here

- [Linux](https://drive.google.com/file/d/1BPci1GgE-mJBisn-uTmekmA_6Zj5-KHG/view?usp=drive_link)
- [Windows](https://drive.google.com/file/d/1gVNRiblnEnJB7WjsoTHfpHGCxCmz1V2G/view?usp=drive_link)
- [Mac](https://drive.google.com/file/d/1e74Cyj8u6gUMJ4pszcZIHIp-PL8wogR-/view?usp=drive_link) then run `xattr -d com.apple.quarantine ~/Applications/Posto.app`

## ✨ Features

- 🚀 **Send HTTP Requests** — Support for GET, POST, PUT, PATCH, DELETE and more
- 📁 **Collections & Folders** — Organize your API requests into collections with nested folder structures
- 📝 **Request Builder** — Intuitive tabs for **Params**, **Headers**, and **Body** editing
- 👁️ **Response Viewer** — View responses as **raw data** or rendered **HTML preview**
- 💾 **Persistent Storage** — All your collections and requests are saved locally in SQLite
- 🔄 **Auto-save** — Throttled auto-save ensures your work is never lost
- 🎨 **Beautiful UI** — Clean, dark-themed interface built with Material UI
- ⚡ **Native Performance** — Runs as a native desktop app, not an Electron memory hog

---

## 🪶 Why Posto?

### Incredibly Lightweight

Posto was built with **extreme efficiency** in mind. In a world where API clients like Postman consume **hundreds of megabytes of RAM** and ship as **500MB+ Electron bundles**, Posto takes a radically different approach.

| Metric                | Posto                | Typical Electron API Client |
| --------------------- | -------------------- | --------------------------- |
| **Final Binary Size** | **~13 MB**           | 500+ MB                     |
| **Source Code**       | **~3,600 lines**     | 100,000+ lines              |
| **Runtime Memory**    | **Minimal** (native) | 300+ MB (Chromium)          |
| **Startup Time**      | **Instant**          | 3-10 seconds                |
| **Dependencies (Go)** | **~15**              | Hundreds                    |

### How is this possible?

Posto is built with [**Wails**](https://wails.io) — a framework that lets you build desktop applications using **Go** for the backend and **web technologies** for the frontend, but _without bundling an entire Chromium browser_. Instead, Wails uses the **native WebView** already present on your operating system:

- **Linux** → WebKitGTK
- **macOS** → WKWebView
- **Windows** → WebView2 (Edge/Chromium-based, pre-installed)

This means the entire compiled binary — **backend logic, embedded frontend assets, SQLite database engine, and HTTP client** — ships as a **single ~13 MB executable**. No installer bloat, no runtime dependencies, no Electron overhead.

The entire source code of the application is under **3,600 lines** — spanning Go backend, TypeScript/React frontend, SQL migrations, and configuration. Every line serves a purpose. There's no framework bloat, no unnecessary abstractions — just clean, purposeful code.

---

## 🛠️ Tech Stack

### Backend (Go)

| Component    | Technology                                             |
| ------------ | ------------------------------------------------------ |
| Framework    | [Wails v2](https://wails.io)                           |
| Database     | SQLite (via `go-sqlite3`)                              |
| Architecture | Repository Pattern (Models → Repositories → API layer) |
| HTTP Client  | Go standard library `net/http`                         |
| Migrations   | Embedded SQL files with custom migration runner        |

### Frontend (TypeScript/React)

| Component        | Technology                                   |
| ---------------- | -------------------------------------------- |
| Framework        | [React 19](https://react.dev)                |
| Language         | TypeScript 5                                 |
| Build Tool       | [Vite 6](https://vitejs.dev)                 |
| UI Library       | [Material UI (MUI) v7](https://mui.com)      |
| Styling          | Tailwind CSS v4 + Emotion                    |
| State Management | [Zustand](https://github.com/pmndrs/zustand) |

---

## 🚀 Getting Started

### Prerequisites

Before you begin, make sure you have the following installed:

1. **Go** (1.23 or later) — [Download Go](https://go.dev/dl/)
2. **Node.js** (18 or later) — [Download Node.js](https://nodejs.org)
3. **Wails CLI** — Install it with:
   ```bash
   go install github.com/wailsapp/wails/v2/cmd/wails@latest
   ```
4. **Platform-specific dependencies**:
   - **Linux**: `sudo apt install libgtk-3-dev libwebkit2gtk-4.0-dev` (Debian/Ubuntu)
   - **macOS**: Xcode Command Line Tools
   - **Windows**: WebView2 runtime (usually pre-installed on Windows 10/11)

> 📖 For detailed installation instructions for your platform, see the official **[Wails Installation Guide](https://wails.io/docs/gettingstarted/installation)**.

### Clone & Run

```bash
# Clone the repository
git clone https://github.com/Arghyahub/Posto.git
cd Posto

# Run in development mode
wails dev
```

That's it! Posto will open as a native desktop window with live-reloading enabled.

---

## 💻 Development

### `wails dev` — Live Development Mode

The `wails dev` command is your primary development tool. It provides an exceptional developer experience:

```bash
wails dev
```

**What it does:**

- 🔥 Starts a **Vite dev server** with instant Hot Module Replacement (HMR) for the frontend
- 🔄 **Watches for Go file changes** and automatically rebuilds the backend
- 🖥️ Opens the application in a **native window** with DevTools access
- 🌐 Exposes a **dev server** at `http://localhost:34115` so you can also develop in your browser

**Browser development:** If you prefer developing in a browser with access to your Go methods, navigate to `http://localhost:34115`. You can call your Go backend functions directly from the browser's DevTools console.

**Troubleshooting on Linux:** If you encounter WebKit-related errors, try:

```bash
wails dev -tags webkit2_41
```

> 📖 See the full `wails dev` reference: **[Wails CLI Reference — Dev](https://wails.io/docs/reference/cli#dev)**

### Project Configuration

The project is configured via `wails.json`. Key configuration options:

```json
{
  "name": "posto",
  "frontend:install": "npm install",
  "frontend:build": "npm run build",
  "frontend:dev:watcher": "npm run dev",
  "frontend:dev:serverUrl": "auto"
}
```

> 📖 Full configuration reference: **[Wails Project Config](https://wails.io/docs/reference/project-config)**

---

## 📦 Building

### `wails build` — Production Build

To compile Posto into a single, distributable binary:

```bash
wails build
```

**What it does:**

1. Runs `npm install` and `npm run build` in the `frontend/` directory
2. Embeds the compiled frontend assets into the Go binary via `go:embed`
3. Compiles the entire application into a **single native executable**
4. Outputs the binary to `build/bin/`

The result? A **single ~13 MB file** that contains everything — the Go backend, the React frontend, the SQLite engine, and all assets. No runtime dependencies required.

### Build Options

```bash
# Standard production build
wails build

# Build with debug symbols (useful for troubleshooting)
wails build -debug

# Build for a clean/stripped binary (even smaller)
wails build -trimpath -ldflags="-s -w"

# Cross-compile for Windows (from Linux/macOS)
wails build -platform windows/amd64

# Build with NSIS installer (Windows)
wails build -nsis

# See all options
wails build --help
```

> 📖 Full build reference: **[Wails CLI Reference — Build](https://wails.io/docs/reference/cli#build)**

---

## 📁 Project Structure

```
posto/
├── main.go                     # Application entry point
├── app.go                      # Wails app struct & lifecycle hooks
├── wails.json                  # Wails project configuration
├── go.mod                      # Go module definition
│
├── app/                        # Backend application logic
│   ├── api/                    # API layer (exposed to frontend via Wails bindings)
│   │   ├── api.go              # API container struct
│   │   ├── collection_api.go   # Collection CRUD endpoints
│   │   └── file_api.go         # File/request CRUD + HTTP request executor
│   ├── config/                 # Application configuration
│   ├── db/                     # Database initialization & migrations
│   │   ├── db.go               # SQLite connection setup
│   │   ├── migrate.go          # Custom migration runner
│   │   └── migrations/         # SQL migration files
│   ├── models/                 # Data models
│   │   ├── collection_model.go # Collection struct
│   │   └── file_model.go       # File/Request struct
│   ├── repositories/           # Data access layer
│   │   ├── repositories.go     # Repository container
│   │   ├── collection_repo.go  # Collection DB operations
│   │   └── file_repo.go        # File/Request DB operations
│   └── services/               # Business logic (reserved)
│
├── frontend/                   # React/TypeScript frontend
│   ├── src/
│   │   ├── App.tsx             # Root component
│   │   ├── main.tsx            # React entry point
│   │   ├── components/
│   │   │   ├── left-sidebar/   # Collection tree & file explorer
│   │   │   └── tabs-panes/     # Request builder & response viewer
│   │   └── store/              # Zustand state management
│   ├── wailsjs/                # Auto-generated Wails bindings
│   └── index.html              # HTML entry point
│
└── build/                      # Build assets & output
    ├── appicon.png             # Application icon
    └── bin/                    # Compiled binaries
```

### Architecture Overview

Posto follows a clean, layered architecture:

```
┌─────────────────────────────────────────────────┐
│                  Frontend (React)               │
│  ┌───────────┐ ┌───────────┐ ┌───────────────┐  │
│  │  Sidebar  │ │  Builder  │ │   Response    │  │
│  │  Explorer │ │  Tabs     │ │   Viewer      │  │
│  └─────┬─────┘ └─────┬─────┘ └───────┬───────┘  │
│        │             │               │          │
│        └─────────────┬───────────────┘          │
│              Wails JS Bindings                  │
├─────────────────────────────────────────────────┤
│                  Backend (Go)                   │
│  ┌────────────────────────────────────────────┐ │
│  │              API Layer                     │ │
│  │   CollectionApi  │   FileApi               │ │
│  └────────┬─────────┴────────┬────────────────┘ │
│  ┌────────┴──────────────────┴────────────────┐ │
│  │           Repository Layer                 │ │
│  │   CollectionRepo   │   FileRepo            │ │
│  └────────────────────┴───────────┬───────────┘ │
│  ┌────────────────────────────────┴───────────┐ │
│  │              SQLite Database               │ │
│  └────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

---

## 🔗 Wails Resources

New to Wails? Here are the essential resources to get started:

| Resource                  | Link                                                                                           |
| ------------------------- | ---------------------------------------------------------------------------------------------- |
| **Official Website**      | [wails.io](https://wails.io)                                                                   |
| **Getting Started Guide** | [wails.io/docs/gettingstarted](https://wails.io/docs/gettingstarted)                           |
| **Installation**          | [wails.io/docs/gettingstarted/installation](https://wails.io/docs/gettingstarted/installation) |
| **CLI Reference**         | [wails.io/docs/reference/cli](https://wails.io/docs/reference/cli)                             |
| **Project Config**        | [wails.io/docs/reference/project-config](https://wails.io/docs/reference/project-config)       |
| **API Reference**         | [wails.io/docs/reference/runtime](https://wails.io/docs/reference/runtime)                     |
| **GitHub Repository**     | [github.com/wailsapp/wails](https://github.com/wailsapp/wails)                                 |
| **Community Discord**     | [discord.gg/wails](https://discord.gg/wails)                                                   |

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Development Tips

- Run `wails dev` for live-reloading development
- The Go backend auto-rebuilds on file changes
- Frontend changes are reflected instantly via Vite HMR
- Use the browser dev server at `http://localhost:34115` for frontend debugging
- SQLite database is stored locally — no external services needed

---

## 📄 License

This project is created by **Arghya Das**.

---

<p align="center">
  Built with ❤️ using <a href="https://wails.io">Wails</a>, <a href="https://go.dev">Go</a>, and <a href="https://react.dev">React</a>
</p>
