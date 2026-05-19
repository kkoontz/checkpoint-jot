# Jot

CodeWorks Unit 03 checkpoint — a note-taking app built with JavaScript MVC and `localStorage` persistence.

## Run locally

Serve the project root as static files (ES modules require a server):

```bash
npx bcw-serve
```

Or:

```bash
npx http-server . -p 8080
```

Open the URL shown in the terminal (e.g. `http://127.0.0.1:8080`).

## Features

- Create jots with a title (3–15 characters) and color (6 preset options)
- Sidebar list with jot count, preview, and created date
- Select one active jot at a time
- Edit body and save (updates `updatedAt`)
- Delete with confirmation prompt
- Data persists in `localStorage` across refresh

## Architecture

| Layer | Files |
|-------|--------|
| Model | `app/models/Jot.js` |
| State | `app/AppState.js` |
| Service | `app/services/JotsService.js` |
| Controller | `app/controllers/JotsController.js` |
| View | `index.html`, `assets/css/style.css` |

## Checkpoint checklist

- [x] Notes can be created
- [x] Title limited to 3–15 characters
- [x] Color picker with 5+ options
- [x] List with numerical count
- [x] One note in focus at a time
- [x] Body editable and saved
- [x] Notes can be deleted
- [x] `createdAt` on create
- [x] `updatedAt` on save
- [x] Delete confirmation
- [x] UI aligned with design mock
- [x] `localStorage` persistence
