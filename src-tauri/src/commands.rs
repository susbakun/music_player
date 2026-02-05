use std::sync::{Arc, Mutex};
use std::{ffi::OsStr, fs::File};
use std::fs;
use std::path::Path;
use rodio::{Decoder, OutputStreamBuilder, Sink};
use tauri::{Manager, Window};

use crate::AppData;


#[tauri::command(rename_all = "snake_case")]
pub fn read_songs() -> Vec<String>{
    fs::read_dir("/Users/amir/Downloads")
    .expect("Failed to read the read the directory")
    .map(|res| res.unwrap())
    .map(|file| file.file_name())
    .filter(|file_name| {
        let file_extenstion = Path::new(file_name)
            .extension()
            .and_then(OsStr::to_str)
            .unwrap_or_default();

        file_extenstion == "wav" || file_extenstion == "mp3" || file_extenstion == "flac"
    })
    .map(|file_name| file_name.into_string().unwrap())
    .collect()
}


#[tauri::command(rename_all = "snake_case")]
pub fn play_song(song_name: String, window: Window){
    std::thread::spawn(move|| {
        let stream_handle = OutputStreamBuilder::open_default_stream()
        .expect("open default audio strem");

        let sink = Sink::connect_new(&stream_handle.mixer());

        let file = File::open(format!("/Users/amir/Downloads/{}", song_name))
            .expect("couldn't open the file");
        let source = Decoder::try_from(file)
            .expect("couldn't decode the file");

        sink.append(source);

        let app_handle = window.app_handle();
        let state = app_handle.state::<Mutex<AppData>>();

        let mut state = state.lock().unwrap();
        
        let sink = Arc::new(sink);

        
        if let Some(state_sink) = &state.sink {
            state_sink.clear()
        }
        
        state.sink = Some(Arc::clone(&sink));

        drop(state);
        sink.sleep_until_end();
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