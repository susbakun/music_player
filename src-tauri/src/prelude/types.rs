use std::{error::Error, fs::File, io::Read};

use lofty::error::LoftyError;
use lofty::file::TaggedFileExt;
use lofty::tag::Accessor;
use lofty::read_from_path;

use rodio::{Decoder, Source};
use walkdir::DirEntry;
#[derive(serde::Serialize)]
pub struct ReadSong {
    pub song_name: String,
    pub song_path: String,
    pub duration: u64,
    pub artist: String,
    pub icon: Vec<u8>,
}


impl ReadSong {
    pub fn from_file_entry(file_entry: DirEntry) -> Result<Self, Box<dyn Error>> {
        let path = file_entry.path();

        let file = File::open(&path)?;

        let file_name = path.file_name()
            .unwrap();

        let song_name = file_name.to_str()
            .unwrap()
            .to_string();

        let source = Decoder::try_from(file)?;
        let duration_in_secs = source.total_duration()
            .unwrap()
            .as_secs();

        let file_path = path.to_string_lossy()
            .to_string();

        
        let icon = Self::extract_icon(&file_path)?;

        let artist = Self::extract_artist(&file_path)
            .expect("failed reading the artist");
    
        Ok(Self {
                song_name,
                song_path: file_path,
                duration: duration_in_secs,
                icon: icon,
                artist
            })
    }

    fn extract_icon(file_path: &String) -> Result<Vec<u8>, LoftyError> {
        let file = read_from_path(file_path)?;
        let tags = file.tags();

        if let Some(tag) = tags.first() {
            if let Some(picture) = tag.pictures().first() {
                return Ok(picture.data().into())
            }
        }

        // returning the default music cover if there wasn't any
        let mut file = File::open("./icons/music_cover.png")?;
        let mut buffer = Vec::new();
        
        file.read_to_end(&mut buffer)?;
        return Ok(buffer)
    }

    fn extract_artist(file_path: &String) -> Result<String, LoftyError> {
        let file = read_from_path(file_path)?;
        let tags = file.tags();

        if let Some(tag) = tags.first() {
            if let Some(artist) = tag.artist(){
                return Ok(artist.to_string())
            }
        }

        Ok(String::from("Artist"))
    }
}