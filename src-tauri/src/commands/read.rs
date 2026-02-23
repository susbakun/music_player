use std::sync::Mutex;
use std::path::{Path, PathBuf};
use crate::AppData;
use crate::prelude::*;
use std::ffi::OsStr;
use tauri::{Manager, Window};
use walkdir::WalkDir;

#[tauri::command(rename_all = "snake_case")]
pub fn read_songs(
    dir: String, 
    window: Window
) -> Result<Vec<ReadSong>, String> {
    let path = PathBuf::from(&dir);
    let mut songs = vec![];
    let entries = WalkDir::new(&path).max_depth(4);

    for entry in entries.into_iter(){
        let file_entry = entry
            .map_err(|e| e.to_string())?;

        let file_name = file_entry.file_name();
        let file_extenstion = Path::new(&file_name)
            .extension()
            .and_then(OsStr::to_str)
            .unwrap_or_default();

        if SUPPORTED_FORMATS.contains(&file_extenstion) {
            let song = ReadSong::from_file_entry(file_entry)
                .map_err(|e| e.to_string())?;

            songs.push(song);
        }     
    }

    add_tracks_to_db(&songs, window)?;

    Ok(songs)
}


fn add_tracks_to_db(
    songs: &Vec<ReadSong>, 
    window: Window
) -> Result<(), String> {
    let app_handle = window.app_handle();
    let state = app_handle.state::<Mutex<AppData>>();

    let state= state.lock()
        .map_err(|e| e.to_string())?;

    let db_conn = &state.db_conn;

    songs.iter().try_for_each(|song| -> Result<(), String> {
        let ReadSong {
            song_name,
            song_path,
            duration,
            artist,
            icon,
        } = song;

        // Upsert: update in place so we don't DELETE the row (which would CASCADE
        // and remove this song from all playlists).
        db_conn
            .execute(
                "INSERT INTO track(song_name, song_path, duration, artist, icon)
                    VALUES (?1, ?2, ?3, ?4, ?5)
                    ON CONFLICT(song_name) DO UPDATE SET
                    song_path = excluded.song_path,
                    duration = excluded.duration,
                    artist = excluded.artist,
                    icon = excluded.icon
                    ",
                rusqlite::params![song_name, song_path, *duration as i64, artist, icon.as_slice()],
            )
            .map_err(|e| e.to_string())?;
        Ok(())
    })?;

    // Remove tracks from DB that are no longer in the songs list
    let song_names: Vec<&String> = songs.iter()
        .map(|s| &s.song_name)
        .collect();
    
    if !song_names.is_empty() {
        let placeholders = song_names.iter()
            .map(|_| "?")
            .collect::<Vec<_>>()
            .join(",");
        
        let query = format!(
            "DELETE FROM track 
            WHERE song_name NOT IN ({})", 
            placeholders);
        
        let params: Vec<&dyn rusqlite::ToSql> = song_names.iter()
            .map(|name| name as &dyn rusqlite::ToSql)
            .collect();
        
        db_conn.execute(&query, params.as_slice())
            .map_err(|e| e.to_string())?;
    }

    Ok(())
}

#[tauri::command(rename_all = "snake_case")]
pub fn get_song_position(window: Window) -> Result<usize, String> {
    let app_handle = window.app_handle();
    let state = app_handle.state::<Mutex<AppData>>();

    let state = state.lock()
        .map_err(|e| e.to_string())?;

    let Some(ref sink) = state.sink else {return Ok(0)};

    Ok(sink.get_pos().as_secs() as usize)
}
