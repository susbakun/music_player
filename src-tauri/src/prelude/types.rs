use std::fs::File;
use rodio::{Decoder, Source};
use walkdir::DirEntry;

#[derive(serde::Serialize)]
pub struct ReadSong {
    pub song_name: String,
    pub song_path: String,
    pub duration: u64,
}


impl ReadSong {
    pub fn from_file_entry(file_entry: DirEntry) -> Self {
        let path = file_entry.path();

            let file = File::open(&path)
                .expect("couldn't open the file");

            let file_name = path.file_name()
                .unwrap();
            let song_name = file_name.to_str()
                .expect("failed to convert OsString to &str")
                .to_string();
    
            let source = Decoder::try_from(file)
                .expect("couldn't decode the file");
            let duration_in_secs = source.total_duration()
                .unwrap()
                .as_secs();

            let file_path = path.to_string_lossy()
                .to_string();
        
            Self {
                song_name,
                song_path: file_path,
                duration: duration_in_secs,
            }
    }
}