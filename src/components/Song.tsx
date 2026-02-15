import { Menu, MenuItemOptions } from "@tauri-apps/api/menu"
import { ReadSongType } from "@/shared/types"
import { JSX, MouseEvent } from "react"
import { useAppContentStore } from "@/store/useAppContentStore"

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
    const addToQueue = useAppContentStore((s) => s.addToQueue)
    const removeFromQueue = useAppContentStore((s) => s.removeFromQueue)
    const isSongInQueue = useAppContentStore((s) => s.isSongInQueue)

    const handleContextMenu = async (event: MouseEvent) => {
        event.preventDefault()
        const inQueue = isSongInQueue(song)

        const option1: MenuItemOptions = {
            id: "ctx_option1",
            text: "Add to queue",
            enabled: !inQueue,
            action: () => addToQueue(song),
        }

        const option2: MenuItemOptions = {
            id: "ctx_option2",
            text: "Remove from queue",
            enabled: inQueue,
            action: () => removeFromQueue(song),
        }

        const menu = await Menu.new({ items: [option1, option2] })
        menu.popup()
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
