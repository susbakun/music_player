# Music Player

Desktop music player built with Tauri 2, React and Rust.

<img width="1025" height="679" alt="screenshot" src="https://github.com/user-attachments/assets/e172025b-0235-40b9-be30-8c356f47fab4" />

## Commands

| Command | Description |
|---------|-------------|
| `npm run tauri dev` | Run in development |
| `npm run tauri build` | Build for production |
| `npm run dev` | Frontend only (Vite) |

## Features

- **Library:** Scan folder (up to 4 levels), play/pause, seek, next/prev, shuffle, repeat
- **Queue:** Add/remove tracks, dedicated queue page
- **Playlists:** Create, rename, delete; add/remove tracks; play from playlist context
- **UI:** Transparent window (macOS), directory picker, keyboard shortcuts (e.g. Space, M for mute)
- **Sync:** Watches working directory for changes

## Technologies

- **Frontend:** React 19, Vite, TypeScript, Tailwind CSS, Zustand, React Router
- **Backend:** Tauri 2, Rust (rodio, lofty, rusqlite, notify), SQLite
