export type View = "tracks" | "queue" | "playlist";

export type ReadFileType = {
    song_name: string,
    song_path: string,
    duration: number,
    icon: number[],
    artist: string
}

export type SongType = ReadFileType & 
    { is_playing: boolean }

export type FileFormat = "all" | "mp3" | "wav" | "flac";