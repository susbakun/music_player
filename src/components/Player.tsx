import { SongType } from "@/shared/types"
import { invoke } from "@tauri-apps/api/core";
import { JSX, useEffect, useState } from "react";
import { MdOutlineSkipNext, MdOutlineSkipPrevious } from "react-icons/md";


type PlayerProps = {
    currentSong: SongType | null
    playPrev: () => void,
    playNext: () => void,
    getPlayPauseButton: (song: SongType, is_player?: boolean) 
        => JSX.Element
}

export const Player = ({
    currentSong, 
    playNext, 
    playPrev, 
    getPlayPauseButton}: PlayerProps) => {
    let [progress, setProgress] = useState(0);

    let duration = currentSong?.duration || 0
    let formatted_duration = `${Math.floor(duration / 60)}:${String(duration % 60).padStart(2, "0")}`;
    let formatted_progress = `${Math.floor(progress / 60)}:${String(progress % 60).padStart(2, "0")}`;

    const get_song_position = async () => {
        let position = await invoke<number>("get_song_position");

        setProgress(position)
    }

    useEffect(() => {
        let intervalId = setInterval(() => {
            get_song_position()
        }, 1000)
        
        return () => {
            clearInterval(intervalId)
            setProgress(0)
        }
    }, [currentSong?.song_name])

    if (currentSong)
        return (
            <div className="h-[25%] flex bg-black/50 rounded-lg py-4
                flex-col gap-4 mr-4">
                <p className="text-center">{currentSong.song_name}</p>
                <div className="flex justify-center w-full h-fit gap-2">
                    <button className="bg-black/80 rounded-full px-2 py-2"
                        onClick={playPrev}
                    >
                        <MdOutlineSkipPrevious />
                    </button>
                    {getPlayPauseButton(currentSong, true)}
                    <button className="bg-black/80 rounded-full px-2 py-2"
                        onClick={playNext}>
                        <MdOutlineSkipNext />
                    </button>
                </div>
                <div className="w-full px-2 flex gap-2 items-center">
                    <p className="text-sm text-white/80">{formatted_progress}</p>
                    <div className="h-1 w-full bg-white/20 rounded-full overflow-hidden">
                        <div
                            style={{ width: duration ? `${(progress * 100) / duration}%` : "0%" }}
                            className="h-full bg-white/80 rounded-full transition-[width] duration-75 ease-linear"
                        />
                    </div>
                    <p className="text-sm text-white/80">{formatted_duration}</p>
                </div>
            </div>
        )
}
