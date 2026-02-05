import { CurrentSong } from "@/shared/types";
import { invoke } from "@tauri-apps/api/core";
import { ComponentProps, useEffect, useState } from "react";
import {IoPlay, IoPause} from "react-icons/io5";
import { MdOutlineSkipNext, MdOutlineSkipPrevious } from "react-icons/md";


function RootLayout({children, ...props}: ComponentProps<'main'>){
  return (
    <main {...props}>{children}</main>
  )
}

function AppSideBar(){
    return(
        <aside className="border-r border-r-white/50
        w-[25%] flex flex-col gap-20 px-4 py-8">
            <section className="flex flex-col items-start gap-4">
                <h2 className="font-bold text-lg">Library</h2>
                <ul className="flex flex-col items-start gap-2
                font-light text-sm">
                    <button>Play Queue</button>
                    <button>Tracks</button>
                </ul>
            </section>
            <section className="flex flex-col items-start gap-4
            font-light text-sm">
                <h2 className="font-bold text-lg">Playlists</h2>
                <ul className="flex flex-col items-start gap-2
                font-light text-sm">
                    <button>Create...</button>
                </ul>
            </section>
        </aside>
    )
}


function AppContent(){
    const [songs, setSongs] = useState<string[]>([]);
    const [currentSong, setCurrentSong] = useState<CurrentSong | null>(null);

    const getSongs = async () => {
        const res = await invoke<string[]>("read_songs");
        setSongs(res)
    }

    const playSong = async (song_name: string) => {
        setCurrentSong({song_name, is_playing: true})

        invoke("play_song", { song_name })
    }

    const pauseSong = async(song_name: string) => {
        setCurrentSong({song_name, is_playing: false})

        invoke("pause_song", { song_name })
    }


    useEffect(() => {
        getSongs()
    }, [])

    return(
        <div className="h-full flex flex-col w-full">
            <div className="flex-1 px-4 py-8 overflow-y-auto
            overflow-x-clip h-[80%] flex flex-col gap-4">
                <h2>Songs:</h2>
                <ul className="flex flex-col gap-2">
                    {songs.map((song) => (
                        <li className="flex items-center justify-between">
                            <h3>{song}</h3>
                            <button onClick={() => playSong(song)}>
                                <IoPlay />
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        {currentSong && (
            <div className="h-[20%] flex bg-black/50 rounded-lg py-2 flex-col gap-4 mr-4">
                <p className="text-center">{currentSong.song_name}</p>
                <div className="flex justify-center w-full h-fit gap-2">
                    <button className="bg-black/80 rounded-full px-2 py-2">
                        <MdOutlineSkipPrevious />
                    </button>
                    {currentSong.is_playing ? 
                        <button className="bg-black/80 rounded-full px-2 py-2"
                            onClick={() => pauseSong(currentSong.song_name)}>
                            <IoPause />
                        </button> 
                    : 
                        <button className="bg-black/80 rounded-full px-2 py-2"
                            onClick={() => playSong(currentSong.song_name)}>
                            <IoPlay />
                        </button>
                    }
                    <button className="bg-black/80 rounded-full px-2 py-2">
                        <MdOutlineSkipNext />
                    </button>
                </div>
            </div>
        )}
        </div>
    )
}

export {RootLayout, AppSideBar, AppContent}