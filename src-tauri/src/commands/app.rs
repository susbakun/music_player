use std::fs::OpenOptions;
use std::path::Path;
use std::sync::mpsc;
use std::thread;

use notify::{RecursiveMode, Watcher};
use rusqlite::Connection;
use tauri::menu::{Menu, MenuItem, Submenu};
use tauri::{AppHandle, Emitter, Manager, Wry};

use crate::prelude::*;

pub fn build_menu(app: &AppHandle) -> tauri::Result<Menu<Wry>> {
    let menu = Menu::default(app)?;

    // removing the default file submenu
    // and inserting our own submenu
    menu.remove_at(1)?;
    let file_submenu = Submenu::new(app, "File", true)?;

    file_submenu.append(&MenuItem::with_id(
        app,
        "change_directory_id",
        "Change Directory",
        true,
        Some("CmdOrCtrl+D"),
    )?)?;

    menu.insert(&file_submenu, 1)?;

    Ok(menu)
}

pub fn change_directory(app: &AppHandle) {
    app.emit("choose-directory", ())
        .expect("failed to change directory")
}

pub fn setup_db() -> Result<Connection, Box<dyn std::error::Error>> {
    OpenOptions::new()
        .create(true)
        .write(true)
        .open(DB_PATH)?;

    let conn = Connection::open(DB_PATH)?;

    let playlists_exists = conn.table_exists(
        Some("main"), 
        "playlists")?;

    if !playlists_exists {
        conn.execute(
            "CREATE TABLE playlists(
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL
                )",
            ()
        )?;
    }

    let track_exists = conn.table_exists(
        Some("main"), 
        "track")?;

    if !track_exists {
        conn.execute(
            "CREATE TABLE track(
                song_name TEXT PRIMARY KEY,
                song_path TEXT NOT NULL,
                duration INTEGER,
                artist TEXT,
                icon BLOB
                )",
            ()
        )?;
    }

    let playlist_tracks_exists = conn.table_exists(
        Some("main"), 
        "playlist_tracks")?;

    if !playlist_tracks_exists {
        conn.execute(
            "CREATE TABLE playlist_tracks(
                playlist_id INTEGER,
                song_name TEXT NOT NULL,
                PRIMARY KEY (playlist_id, song_name),
                FOREIGN KEY (playlist_id) REFERENCES playlists(id),
                FOREIGN KEY (song_name) REFERENCES track(song_name)
                )",
            ()
        )?;
    }

    Ok(conn)
}

#[tauri::command(rename_all = "snake_case")]
pub fn watch_dir(path: String, window: AppHandle) -> Result<(), String> {
    
    thread::spawn(move || -> Result<(), String> {
        let apphandle = window.app_handle();

        let (tx, rx) = mpsc::channel();
    
        let mut watcher = notify::recommended_watcher(tx)
            .map_err(|e| e.to_string())?;
        watcher.watch(Path::new(&path), RecursiveMode::Recursive)
            .map_err(|e| e.to_string())?;

        for res in rx {
            match res {
                Ok(_) => {
                    apphandle.emit("directory-changed", ())
                        .map_err(|e| e.to_string())
                },
                Err(e) => Err(e.to_string()),
            }?
        }
        Ok(())
    });

    Ok(())
}
