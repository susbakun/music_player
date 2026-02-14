import { CurrentSongType, ReadSongType } from "@/shared/types"
import { iconBytesToBlobUrl } from "@/utils";
import { invoke } from "@tauri-apps/api/core";
import { JSX, useEffect, useState } from "react";
import { MdOutlineSkipNext, MdOutlineSkipPrevious } from "react-icons/md";


type PlayerProps = {
    currentSong: CurrentSongType | null
    playPrev: () => void,
    playNext: () => void,
    getPlayPauseButton: (song: ReadSongType, is_player?: boolean) 
        => JSX.Element
}

export const Player = ({
    currentSong, 
    playNext, 
    playPrev, 
    getPlayPauseButton}: PlayerProps) => {
    const [progress, setProgress] = useState(0);
    const [iconUrl, setIconUrl] = useState<string | null>(null)


    let duration = currentSong?.duration || 0
    let formatted_duration = `${Math.floor(duration / 60)}:${String(duration % 60).padStart(2, "0")}`;
    let formatted_progress = `${Math.floor(progress / 60)}:${String(progress % 60).padStart(2, "0")}`;

    const getSongPosition = async () => {
        let position = await invoke<number>("get_song_position");

        setProgress(position)
    }


    const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!duration) return
        const bar = e.currentTarget
        const rect = bar.getBoundingClientRect()
        const fraction = Math.max(0, (e.clientX - rect.left) / rect.width)
        const position = Math.floor(fraction * duration);

        invoke("change_song_position", { position })
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
                </div>
                <div className="w-full px-2 flex gap-2 items-center">
                    <p className="text-sm text-white/80">{formatted_progress}</p>
                    <div
                        role="progressbar"
                        aria-valuenow={progress}
                        aria-valuemin={0}
                        aria-valuemax={duration}
                        className="h-[6px] w-full bg-white/20 rounded-full
                        cursor-pointer flex items-center group"
                        onClick={handleProgressBarClick}
                    >
                        <div
                            style={{ width: duration ? `${(progress * 100) / duration}%` : "0%" }}
                            className="h-full bg-white/80 rounded-full transition-[width] 
                            duration-75 ease-linear pointer-events-none -mr-1"
                        />
                        <div
                            className="w-4 h-0 group-hover:h-4
                            rounded-full bg-white transition-all duration-75 ease-linear"
                        />
                    </div>
                    <p className="text-sm text-white/80">{formatted_duration}</p>
                </div>
            </div>
        )
}
