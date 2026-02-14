import { ReadSongType } from "@/shared/types"
import { JSX } from "react"

type SongProps = {
    song: ReadSongType,
    togglePlay: (song: ReadSongType) => void,
    getPlayPauseButton: (song: ReadSongType, is_player?: boolean) 
        => JSX.Element
}

export const Song = ({
    song,
    togglePlay,
    getPlayPauseButton
}: SongProps) => {
  return (
    <li key={song.song_name}
        className="flex items-center justify-between
        hover:bg-white/5 rounded-xl px-2 py-1"
        onDoubleClick={() => togglePlay(song)}>
        <h3>{song.song_name}</h3>
        {getPlayPauseButton(song)}
    </li>
  )
}
