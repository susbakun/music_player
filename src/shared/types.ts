export type View = "tracks" | "queue" | "playlist";

export type ReadFileType = {
    song_name: string,
    song_path: string,
    duration: number,
    icon: number[]
}

export type SongType = ReadFileType & 
    { is_playing: boolean }