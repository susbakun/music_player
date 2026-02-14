import { Menu } from "@tauri-apps/api/menu"
import { ReadSongType } from "@/shared/types"
import { JSX, MouseEvent } from "react"

type SongProps = {
    song: ReadSongType,
    number: number,
    togglePlay: (song: ReadSongType) => void,
    getPlayPauseButton: (song: ReadSongType, is_player?: boolean) 
        => JSX.Element
}

export const Song = ({
    song,
    number,
    togglePlay,
    getPlayPauseButton
}: SongProps) => {
    const menuPromise = Menu.new({
        items: [
            {id: "ctx_option", text: "Add to queue"}
        ]
    })

    const handleContextMenu = async (event: MouseEvent) => {
        event.preventDefault();
        const menu = await menuPromise;
        menu.popup();
    }


  return (
    <li key={song.song_name}
        onContextMenu={handleContextMenu}
        className="flex items-center justify-between
        hover:bg-white/5 rounded-xl px-2 py-1"
        onDoubleClick={() => togglePlay(song)}>
        <div className="flex gap-2 items-center">
            <p className="text-sm text-white/50">{number}.</p>
            <h3>{song.song_name}</h3>
        </div>
        {getPlayPauseButton(song)}
    </li>
  )
}
