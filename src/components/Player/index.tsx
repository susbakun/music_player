import { SongType } from "@/shared/types"
import { iconBytesToBlobUrl } from "@/utils";
import { invoke } from "@tauri-apps/api/core";
import { JSX, useEffect, useState } from "react";
import { MdOutlineSkipNext, MdOutlineSkipPrevious } from "react-icons/md";
import { PlayerBar } from "./PlayerBar";
import { useAppContentStore } from "@/store/useAppContentStore";
import { VolumeBar } from "./VolumeBar";




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
            <div className="h-[90px] flex bg-black/50 px-4 mr-4 
            items-center justify-between rounded-xl">
                <div className="flex items-center gap-3 min-w-[180px] max-w-[30%] shrink-0">
                    {iconUrl && (
                        <img
                            src={iconUrl}
                            className="w-14 h-14 rounded object-cover shrink-0"
                        />
                    )}
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-white truncate">
                            {currentSong.song_name}
                        </p>
                        <p className="text-xs text-white/60 truncate">{currentSong.artist}</p>
                    </div>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center gap-1 px-4">
                    <div className="flex justify-center items-center gap-2">
                        <button 
                            className="text-white/70 hover:text-white transition-colors p-1"
                            onClick={playPrev}
                        >
                            <MdOutlineSkipPrevious className="w-5 h-5" />
                        </button>
                        {getPlayPauseButton(currentSong, true)}
                        <button 
                            className="text-white/70 hover:text-white transition-colors p-1"
                            onClick={playNext}
                        >
                            <MdOutlineSkipNext className="w-5 h-5" />
                        </button>
                    </div>
                    <PlayerBar
                        duration={duration}
                        progress={progress}
                    />
                </div>
                <VolumeBar />
            </div>
        )
}
