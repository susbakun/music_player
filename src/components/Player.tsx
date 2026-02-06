import { CurrentSong } from "@/shared/types"
import { JSX } from "react";
import { MdOutlineSkipNext, MdOutlineSkipPrevious } from "react-icons/md";


type PlayerProps = {
    currentSong: CurrentSong | null
    playPrev: () => void,
    playNext: () => void,
    getPlayPauseButton: (song_name: string, is_player?: boolean) 
        => JSX.Element
}

export const Player = ({
    currentSong, 
    playNext, 
    playPrev, 
    getPlayPauseButton}: PlayerProps) => {
  if (currentSong)
    return (
        <div className="h-[20%] flex bg-black/50 rounded-lg py-2
            flex-col gap-4 mr-4">
            <p className="text-center">{currentSong.song_name}</p>
            <div className="flex justify-center w-full h-fit gap-2">
                <button className="bg-black/80 rounded-full px-2 py-2"
                    onClick={playPrev}
                >
                    <MdOutlineSkipPrevious />
                </button>
                {getPlayPauseButton(currentSong.song_name, true)}
                <button className="bg-black/80 rounded-full px-2 py-2"
                    onClick={playNext}>
                    <MdOutlineSkipNext />
                </button>
            </div>
        </div>
  )
}
