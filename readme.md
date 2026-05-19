# Jot

CodeWorks Unit 03 checkpoint — a note-taking app built with JavaScript MVC and `localStorage` persistence.

## Run locally

**Option A — npm script (recommended):**

```powershell
npm install
npm start
```

**Option B — one-off (note the space before `.`):**

```powershell
npx http-server . -p 8080
```

**Option C — CodeWorks CLI** (requires global install: `npm i -g bcw`):

```powershell
bcw-serve
```

Then open **http://127.0.0.1:8080** (or the URL printed in the terminal).

**Common mistake:** `http-server.` with a dot after the package name causes a 404. The `.` is the folder to serve and must be **separate**: `http-server .`

## Architecture

| Layer | Responsibility | Files |
|-------|----------------|-------|
| Model | Jot shape and defaults | `app/models/Jot.js` |
| State | Observable app data | `app/AppState.js` |
| Service | CRUD + persistence | `app/services/JotsService.js` |
| Controller | Events + DOM rendering | `app/controllers/JotsController.js` |
| View | Markup + styles | `index.html`, `assets/css/style.css` |
| Shared | Config, validation, helpers | `app/constants/`, `app/utils/` |

## Checkpoint checklist

- [x] Notes can be created
- [x] Title limited to 3–15 characters (HTML + service validation)
- [x] Color picker with 6 options (single source in `jotConfig.js`)
- [x] List with numerical count
- [x] One note in focus at a time
- [x] Body editable and saved
- [x] Notes can be deleted
- [x] `createdAt` on create
- [x] `updatedAt` on save
- [x] Delete confirmation (`window.confirm`)
- [x] UI aligned with design mock
- [x] `localStorage` persistence (`jot_jots` key)
