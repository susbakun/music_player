use rodio::{Decoder, OutputStreamBuilder, Sink};
use std::path::{Path, PathBuf};
use std::sync::{Arc, Mutex};
use std::thread;
use std::time::Duration;
use std::{ffi::OsStr, fs::File};
use tauri::{Emitter, Manager, Window};
use walkdir::WalkDir;

use crate::prelude::*;
use crate::AppData;

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
pub fn play_song(song_path: String, volume: f32, window: Window) -> Result<(), String> {
    thread::spawn(move || -> Result<(), String> {
        let app_handle = window.app_handle();
        let state = app_handle.state::<Mutex<AppData>>();

        let mut state = state.lock()
            .map_err(|e| e.to_string())?;

        let song_name = Path::new(&song_path).file_name()
            .ok_or_else(|| String::from("file name is empty"))?;

        let song_name_string = song_name.to_string_lossy()
            .to_string();

        if state.current_song_name
            .as_ref()
            .is_some_and(|current_song_name| *current_song_name == song_name_string) {
                match &state.sink {
                    Some(sink) => sink.play(),
                    _ => (),
                }
                return Ok(());
            }

        let stream_handle =
            OutputStreamBuilder::open_default_stream()
                .map_err(|e| e.to_string())?;

        let sink = Sink::connect_new(&stream_handle.mixer());

        let file = File::open(&song_path)
            .map_err(|e| e.to_string())?;

        let source = Decoder::try_from(file)
            .map_err(|e| e.to_string())?;

        sink.append(source);
        sink.set_volume(volume);

        let sink = Arc::new(sink);

        if let Some(state_sink) = &state.sink {
            state_sink.clear()
        }

        state.sink = Some(Arc::clone(&sink));
        state.current_song_name = Some(song_name_string.clone());
        drop(state);

        sink.sleep_until_end();

        app_handle.emit("finished-song", song_name_string)
            .map_err(|e| e.to_string())?;

        Ok(())
    });

    Ok(())
}


#[tauri::command(rename_all = "snake_case")]
pub fn pause_song(window: Window) -> Result<(), String> {
    let app_state = window.app_handle().state::<Mutex<AppData>>();
    let state = app_state.lock()
        .map_err(|e| e.to_string())?;
    if let Some(sink) = &state.sink {
        sink.pause();
    }
    Ok(())
}

#[tauri::command(rename_all = "snake_case")]
pub fn get_song_position(window: Window) -> Result<u64, String> {
    let app_handle = window.app_handle();
    let state = app_handle.state::<Mutex<AppData>>();

    let state = state.lock()
        .map_err(|e| e.to_string())?;

    let Some(ref sink) = state.sink else {return Ok(0)};

    Ok(sink.get_pos().as_secs())
}

#[tauri::command(rename_all = "snake_case")]
pub fn change_song_position(
    window: Window,
    position: u64,
) -> Result<(), String> {
    let app_state = window.app_handle().state::<Mutex<AppData>>();
    let state = app_state.lock()
        .map_err(|e| e.to_string())?;
    if let Some(sink) = &state.sink {
        sink.try_seek(Duration::from_secs(position))
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command(rename_all = "snake_case")]
pub fn change_master_volume(window: Window, volume: f32) -> Result<(), String> {
    let app_state = window.app_handle().state::<Mutex<AppData>>();
    let state = app_state.lock()
        .map_err(|e| e.to_string())?;
    if let Some(sink) = &state.sink {
        sink.set_volume(volume);
    }
    Ok(())
}
