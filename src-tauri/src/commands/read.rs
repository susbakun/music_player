use std::sync::Mutex;
use std::path::{Path, PathBuf};
use crate::AppData;
use crate::prelude::*;
use std::ffi::OsStr;
use tauri::{Manager, Window};
use walkdir::WalkDir;

#[tauri::command(rename_all = "snake_case")]
pub fn read_songs(dir: String) -> Result<Vec<ReadSong>, String> {
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

    Ok(songs)
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
