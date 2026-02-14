use rodio::{Decoder, OutputStreamBuilder, Sink};
use walkdir::WalkDir;
use std::path::{Path, PathBuf};
use std::sync::{Arc, Mutex};
use std::thread;
use std::time::Duration;
use std::{ffi::OsStr, fs::File};
use tauri::{Emitter, Manager, Window};

use crate::prelude::*;
use crate::AppData;

#[tauri::command(rename_all = "snake_case")]
pub fn read_songs(dir: String) -> Vec<ReadSong> {
    let path = PathBuf::from(&dir);
    WalkDir::new(&path)
        .max_depth(4)
        .into_iter()
        .map(|res| res.unwrap())
        .filter(|file_entry| {
            let file_name = file_entry.file_name();
            let file_extenstion = Path::new(&file_name)
                .extension()
                .and_then(OsStr::to_str)
                .unwrap_or_default();

            SUPPORTED_FORMATS.contains(&file_extenstion)
        })
        .map(ReadSong::from_file_entry)
        .collect()
}

#[tauri::command(rename_all = "snake_case")]
pub fn play_song(song_path: String, window: Window) {
    std::thread::spawn(move || {
        let app_handle = window.app_handle();
        let state = app_handle.state::<Mutex<AppData>>();

        let mut state = state.lock().unwrap();

        let song_name = Path::new(&song_path)
            .file_name()
            .unwrap();
        let song_name_string = song_name
            .to_string_lossy()
            .to_string();
            
        // resume the current song (if there's any)
        if let Some(current_song_name) = &state.current_song_name {
            if *current_song_name == song_name_string {
                match &state.sink {
                    Some(sink) => sink.play(),
                    _ => (),
                }
                return;
            }
        }

        let stream_handle =
            OutputStreamBuilder::open_default_stream().expect("open default audio strem");

        let sink = Sink::connect_new(&stream_handle.mixer());

        let file = File::open(&song_path)
            .expect("couldn't open the file");

        let source = Decoder::try_from(file).expect("couldn't decode the file");

        sink.append(source);

        let sink = Arc::new(sink);

        if let Some(state_sink) = &state.sink {
            state_sink.clear()
        }

        state.sink = Some(Arc::clone(&sink));
        state.current_song_name = Some(song_name_string.clone());
        drop(state);

        sink.sleep_until_end();

        app_handle.emit("finished-song", song_name_string)
            .unwrap();
    });
}

#[tauri::command(rename_all = "snake_case")]
pub fn pause_song(window: Window) {
    std::thread::spawn(move || {
        let app_handle = window.app_handle();
        let state = app_handle.state::<Mutex<AppData>>();

        let state = state.lock().unwrap();

        if let Some(sink) = &state.sink {
            sink.pause();
        }
    });
}

#[tauri::command(rename_all = "snake_case")]
pub fn get_song_position(window: Window) -> u64 {
    std::thread::spawn(move || {
        let app_handle = window.app_handle();
        let state = app_handle.state::<Mutex<AppData>>();

        let state = state.lock().unwrap();

        if let Some(sink) = &state.sink {
            return sink.get_pos().as_secs();
        }

        0
    })
    .join()
    .unwrap()
}

#[tauri::command(rename_all = "snake_case")]
pub fn change_song_position(window: Window, position: u64) {
    thread::spawn(move || {
        let app_handle = window.app_handle();
        let state = app_handle.state::<Mutex<AppData>>();

        let state = state.lock().unwrap();

        println!("{position}");

        if let Some(sink) = &state.sink {
            sink.try_seek(Duration::from_secs(position))
                .expect("couldn't seek the song")
        }
    });
}