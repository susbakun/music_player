use std::sync::Mutex;

use tauri::{AppHandle, Manager};
use uuid::Uuid;

use crate::prelude::*;

#[tauri::command(rename_all = "snake_case")]
pub fn get_playlists(window: AppHandle) -> Result<Vec<Playlist>, String> {
    let app_handle = window.app_handle();
    let state = app_handle.state::<Mutex<AppData>>();

    let state= state.lock()
        .map_err(|e| e.to_string())?;

    let db_conn = &state.db_conn;

    let mut stmt = db_conn.prepare("SELECT * FROM playlists")
        .map_err(|e| e.to_string())?;
    let mut rows = stmt.query([])
        .map_err(|e| e.to_string())?;

    let mut results = Vec::new();

    while let Some(row) = rows.next().unwrap() {
        let id: String = row.get(0).map_err(|e| e.to_string())?;
        let name: String = row.get(1).map_err(|e| e.to_string())?;
        let playlist = Playlist {id, name};
        results.push(playlist);
    };

    Ok(results)
}

#[tauri::command(rename_all = "snake_case")]
pub fn get_playlist_tracks(
    playlist_id: String,
    window: AppHandle
) -> Result<Vec<ReadSong>, String> {
    let app_handle = window.app_handle();
    let state = app_handle.state::<Mutex<AppData>>();

    let state= state.lock()
        .map_err(|e| e.to_string())?;

    let db_conn = &state.db_conn;

    // playlist_tracks has (playlist_id, song_name); track has (song_name, song_path, duration, artist, icon).
    // SELECT * order: 0=playlist_id, 1=playlist_tracks.song_name, 2=track.song_name, 3=song_path, 4=duration, 5=artist, 6=icon
    let mut stmt = db_conn.prepare(
        "SELECT * FROM playlist_tracks
            INNER JOIN track ON playlist_tracks.song_name = track.song_name
            WHERE playlist_tracks.playlist_id = ?1
        ")
        .map_err(|e| e.to_string())?;
    let mut rows = stmt.query([&playlist_id])
        .map_err(|e| e.to_string())?;

    let mut results = Vec::new();

    while let Some(row) = rows.next().unwrap() {
        let song_name: String = row.get(2).map_err(|e| e.to_string())?;
        let song_path: String = row.get(3).map_err(|e| e.to_string())?;
        let duration: i64 = row.get(4).map_err(|e| e.to_string())?;
        let duration = duration as u64;
        let artist: String = row.get(5).map_err(|e| e.to_string())?;
        let icon: Vec<u8> = row.get(6).map_err(|e| e.to_string())?;


        let song = ReadSong {
            song_name,
            song_path,
            duration,
            artist,
            icon
        };
        results.push(song);
    }

    Ok(results)
}

#[tauri::command(rename_all = "snake_case")]
pub fn create_playlist(
    playlist_name: String, 
    window: AppHandle
) -> Result<String, String> {
    let app_handle = window.app_handle();
    let state = app_handle.state::<Mutex<AppData>>();

    let state= state.lock()
        .map_err(|e| e.to_string())?;

    let db_conn = &state.db_conn;

    let id = Uuid::new_v4().to_string();

    db_conn
        .execute(
            "INSERT INTO playlists (id, name) VALUES (?1, ?2)", 
            [&id, &playlist_name])
        .map_err(|e| e.to_string())?;

    Ok(id)    
}

#[tauri::command(rename_all = "snake_case")]
pub fn edit_playlist_name(
    playlist_id: String,
    new_name: String,
    window: AppHandle
) -> Result<(), String> {
    let app_handle = window.app_handle();
    let state = app_handle.state::<Mutex<AppData>>();

    let state= state.lock()
        .map_err(|e| e.to_string())?;

    let db_conn = &state.db_conn;

    db_conn
        .execute(
            "UPDATE playlists
            SET name = ?2
            WHERE id = ?1
            ", 
            [&playlist_id, &new_name])
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command(rename_all = "snake_case")]
pub fn delete_playlist(
    playlist_id: String,
    window: AppHandle
) -> Result<(), String> {
    let app_handle = window.app_handle();
    let state = app_handle.state::<Mutex<AppData>>();

    let state= state.lock()
        .map_err(|e| e.to_string())?;

    let db_conn = &state.db_conn;

    db_conn
        .execute(
            "DELETE FROM playlists
            WHERE id = ?1
            ", [&playlist_id])
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command(rename_all = "snake_case")]
pub fn add_to_playlist(
    playlist_id: String,
    song_names: Vec<String>,
    window: AppHandle
) -> Result<(), String> {
    let app_handle = window.app_handle();
    let state = app_handle.state::<Mutex<AppData>>();

    let state= state.lock()
        .map_err(|e| e.to_string())?;

    let db_conn = &state.db_conn;

    song_names.iter().try_for_each(|song_name| -> Result<(), String> {
        db_conn
        .execute(
            "INSERT INTO playlist_tracks(playlist_id, song_name)
            VALUES (?1, ?2)
            ", [&playlist_id, song_name])
        .map_err(|e| e.to_string())?;
        
        Ok(())
    })?;
    

    Ok(())
}

#[tauri::command(rename_all = "snake_case")]
pub fn remove_from_playlist(
    playlist_id: String,
    song_name: String,
    window: AppHandle
) -> Result<(), String> {
    let app_handle = window.app_handle();
    let state = app_handle.state::<Mutex<AppData>>();

    let state= state.lock()
        .map_err(|e| e.to_string())?;

    let db_conn = &state.db_conn;

    db_conn
        .execute(
            "DELETE FROM playlist_tracks
            WHERE playlist_id = ?1 AND song_name = ?2
            ", [playlist_id, song_name])
        .map_err(|e| e.to_string())?;

    Ok(())
}