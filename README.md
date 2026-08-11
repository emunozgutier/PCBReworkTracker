# PCB Rework Tracker

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Click%20Here-success?style=for-the-badge)](https://emunozgutier.github.io/Rework-Tracker/)

A full-stack tracking application designed to simplify the management of projects, Printed Circuit Boards (PCBs), and hardware rework histories.

Built with a **React + TypeScript + Vite** frontend against an **Express.js + SQLite** backend, designed entirely around a sleek, modern, dark-purple interface.

## 🚀 Features

- **Project Management:** Create projects with auto-generated 3-letter project keys (`e.g. MOD`).
- **PCB Tracking:** Add and assign individual PCBs specifically to projects.
- **Rework History:** Log detailed rework steps inside PCBs, complete with statuses, tags, dates, and ownership assignment.
- **Strict Database Integrity:** Built-in safeguards at the SQLite database level prevent users from deleting projects if they still contain active PCBs attached to them.
- **Dynamic Duplication Prevention:** The database physically prevents duplicate project keys, lowercase/uppercase clashes, or duplicate board numbers inside the exact same project!

## ⚙️ Tech Stack

- **Frontend:** React, TypeScript, Vite, Zustand (for centralized Store management), Lucide React (for icons)
- **Backend:** Node.js, Express, `cors`
- **Database:** SQLite (`pcb_tracker.db`) running with enforced `PRAGMA foreign_keys = ON` and `COLLATE NOCASE` index scoping.
- **Testing:** Vitest & JSDOM (`start-server-and-test`)

---

## 🐳 Running with Podman (Recommended)

No need to clone the repository — Podman downloads and builds everything directly from GitHub.

### Prerequisites

- [Podman](https://podman.io/docs/installation) installed on your machine.

### First-time setup

**1. Initialize and start the Podman Linux VM** *(one-time only)*
```bash
podman machine init
podman machine start
```

**2. Build the image from GitHub**
```bash
podman build https://github.com/emunozgutier/Rework-Tracker.git -t rework-tracker
```

**3. Run the container**
```powershell
# Windows (PowerShell)
podman run -d `
  --name rework-tracker-app `
  -p 5001:5001 `
  -p 5002:5002 `
  -v "C:\podman\rework-tracker:/usr/src/app/src/store/serverDataBase/data:Z" `
  --restart unless-stopped `
  rework-tracker
```
```bash
# macOS / Linux
podman run -d \
  --name rework-tracker-app \
  -p 5001:5001 \
  -p 5002:5002 \
  -v "$HOME/rework-tracker-data:/usr/src/app/src/store/serverDataBase/data:Z" \
  --restart unless-stopped \
  rework-tracker
```

The database file will be saved to `C:\podman\rework-tracker\` (Windows) or `~/rework-tracker-data/` (macOS/Linux).

Open **http://localhost:5001** in your browser.

### Updating to the latest version

```bash
podman stop rework-tracker-app
podman rm rework-tracker-app
podman build --no-cache https://github.com/emunozgutier/Rework-Tracker.git -t rework-tracker

# Then re-run using the same `podman run` command from Step 3 above
```

### Useful Podman commands

```bash
# Check if the container is running
podman ps

# View live logs
podman logs -f rework-tracker-app

# Stop the container
podman stop rework-tracker-app

# Start it again (without rebuilding)
podman start rework-tracker-app
```

---

## 🛠️ Local Development

For active development, run the frontend and backend together:

**1. Clone the repository**
```bash
git clone https://github.com/emunozgutier/Rework-Tracker.git
cd Rework-Tracker
```

**2. Install dependencies**
```bash
npm install
```

**3. Start the dev servers**
```bash
npm run dev
```

*This starts two servers concurrently:*
1. **Express backend** → `http://localhost:5002`
2. **Vite frontend** → `http://localhost:5001` *(open this in your browser)*

---

## 🧪 Integration Testing

The application features a fully automated integration test suite that proves the database constraints (duplication prevention, foreign-key blocks, cascading teardowns) work flawlessly.

```bash
npm run test
```

*Uses `start-server-and-test` to automatically spin up a temporary ghost backend, run all Vitest integration suites against a temporary database, and safely shut everything down afterward.*

---

## 📦 Project Structure

```
src/                          # Frontend React logic, styles, and UI pages
src/store/                    # Zustand state files linking React to the backend
src/store/serverDataBase/
  ├── server.ts               # Express backend serving the REST API endpoints
  ├── db.ts                   # Database schema configuration and migration logic
  └── data/                   # SQLite database file (persisted on host via volume mount)
tests/                        # Vitest integration test files
Dockerfile                    # Container build file
docker-compose.yml            # Container orchestration config
```

---

## 📝 Attribution

The PCB parser in this application was adapted from the GitHub repository **board ripper** (which appears to have sourced its parsing logic from **KiCad**).
