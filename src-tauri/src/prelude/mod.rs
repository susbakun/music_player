pub const SUPPORTED_FORMATS: [&str; 3] = ["wav", "mp3", "flac"];

#[derive(serde::Serialize)]
pub struct ReadSong {
    pub song_name: String,
    pub song_path: String,
    pub duration: u64,
    pub is_playing: bool
}
