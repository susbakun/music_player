import { iconBytesToBlobUrl } from "@/utils";
import { PlayerBar } from "./PlayerBar";
import { useAppContentStore } from "@/store/useAppContentStore";
import { VolumeBar } from "./VolumeBar";
import { ButtonsRow } from "./ButtonsRow";
import { useEffect, useState } from "react";

export const Player = () => {
    const [progress, setProgress] = useState(0);
    const [iconUrl, setIconUrl] = useState<string | null>(null)
    
    const currentSong = useAppContentStore((s) => s.currentSong)
    const getSongPosition = useAppContentStore((s) => s.getSongPosition)

    const duration = currentSong?.duration || 0
    

    const songPosition = async () => {
        let position = await getSongPosition() || 0;

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
            songPosition()
        }, 100)
        
        return () => {
            clearInterval(intervalId)
            setProgress(0)
        }
    }, [currentSong?.song_name])

    if (currentSong)
        return (
            <div className="h-[100px] flex bg-black/50 px-4 mr-4 
            items-center justify-between rounded-xl mt-auto">
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
                    <ButtonsRow currentSong={currentSong} />
                    <PlayerBar
                        duration={duration}
                        progress={progress}
                    />
                </div>
                <VolumeBar />
            </div>
        )
}
