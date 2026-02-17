import { SongType } from "@/shared/types"
import { iconBytesToBlobUrl } from "@/utils";
import { invoke } from "@tauri-apps/api/core";
import { JSX, useEffect, useState } from "react";
import { MdOutlineSkipNext, MdOutlineSkipPrevious } from "react-icons/md";
import { PlayerBar } from "./PlayerBar";
import { useAppContentStore } from "@/store/useAppContentStore";




type PlayerProps = {
    playPrev: () => void,
    playNext: () => void,
    getPlayPauseButton: (song: SongType, is_player?: boolean) 
        => JSX.Element
}

export const Player = ({
    playNext, 
    playPrev, 
    getPlayPauseButton}: PlayerProps) => {
    const [progress, setProgress] = useState(0);
    const [iconUrl, setIconUrl] = useState<string | null>(null)
    
    const currentSong = useAppContentStore((s) => s.currentSong)

    const duration = currentSong?.duration || 0
    

    const getSongPosition = async () => {
        let position = await invoke<number>("get_song_position");

        setProgress(position)
    }

    useEffect(() => {
        if (!currentSong) return
        const url = iconBytesToBlobUrl(currentSong.icon)
        setIconUrl(url)
        return () => {
            if (url) URL.revokeObjectURL(url)
        }
    }, [currentSong?.icon])

    useEffect(() => {
        let intervalId = setInterval(() => {
            getSongPosition()
        }, 100)
        
        return () => {
            clearInterval(intervalId)
            setProgress(0)
        }
    }, [currentSong?.song_name])

    if (currentSong)
        return (
            <div className="h-[35%] flex bg-black/50 rounded-lg py-4
                flex-col mr-4 items-center justify-between">
                <div className="flex flex-col gap-4 items-center">
                    <p className="text-center">{currentSong.song_name}</p>
                    {iconUrl && (
                        <img
                            src={iconUrl}
                            className="w-16 h-16 xl:w-44 xl:h-44 rounded object-cover shrink-0"
                        />
                    )}
                    <div className="flex justify-center w-full h-fit gap-8">
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
                </div>
                <PlayerBar
                    duration={duration}
                    progress={progress}
                />
            </div>
        )
}
