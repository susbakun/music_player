export type View = "tracks" | "queue" | "playlist";

export type ReadSongType = {
    song_name: string,
    song_path: string,
    duration: number,
    icon: number[]
}

export type CurrentSongType = ReadSongType & 
    { is_playing: boolean }