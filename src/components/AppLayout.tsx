import { CurrentSong } from "@/shared/types";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { ComponentProps, useEffect, useState } from "react";
import {IoPlay, IoPause} from "react-icons/io5";
import { Player } from "./Player";


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

    const playSong = (song_name: string) => {
        setCurrentSong({song_name, is_playing: true})

        invoke("play_song", { song_name })
    }

    const pauseSong = (song_name: string) => {
        setCurrentSong({song_name, is_playing: false})

        invoke("pause_song", { song_name })
    }

    const playNext = () => {
        if (!currentSong) {
            return
        }

        let currentSongIdx = songs.findIndex((song_name) =>
             song_name === currentSong.song_name)
        let lastSongIdx = songs.length - 1;
        
        let nextSong;

        if (currentSongIdx === lastSongIdx) {
            nextSong = songs[0];
        } else {
            nextSong = songs[currentSongIdx + 1]
        }

        playSong(nextSong)
    }

    const playPrev = () => {
        if (!currentSong) {
            return
        }

        let currentSongIdx = songs.findIndex((song_name) =>
             song_name === currentSong.song_name)
        let lastSongIdx = songs.length - 1;
        
        let prevSong;

        if (currentSongIdx === 0) {
            prevSong = songs[lastSongIdx];
        } else {
            prevSong = songs[currentSongIdx - 1]
        }

        playSong(prevSong)
    }

    const getPlayPauseButton = (song_name: string, is_player?: boolean) => {
        if (currentSong && 
            currentSong.is_playing && 
            currentSong.song_name === song_name) {
            return (
                <button 
                    className={is_player ? 
                        "bg-black/80 rounded-full px-2 py-2" : 
                        ""}
                    onClick={() => pauseSong(song_name)}>
                        <IoPause />
                </button> 
            )
        } else {
            return (
                <button
                    className={is_player ? 
                        "bg-black/80 rounded-full px-2 py-2" : 
                        ""}
                    onClick={() => playSong(song_name)}>
                        <IoPlay />
                </button>
            )
        }
}

    useEffect(() => {
        getSongs()
    }, [])

    useEffect(() => {
        const unlisten = listen<string>('finished-song', (event) => {
            let songName = event.payload;

            if (currentSong && currentSong.song_name !== songName) return

            playNext()
        })

        return () => {
            unlisten.then((fn) => fn())
        }
    }, [currentSong])

    return(
        <div className="h-full flex flex-col w-full">
            <div className="flex-1 px-4 py-8 overflow-y-auto
            overflow-x-clip h-[80%] flex flex-col gap-4">
                <h2>Songs:</h2>
                <ul className="flex flex-col gap-2">
                    {songs.map((song_name) => (
                        <li key={song_name} className="flex items-center justify-between">
                            <h3>{song_name}</h3>
                            {getPlayPauseButton(song_name)}
                        </li>
                    ))}
                </ul>
            </div>
            <Player
                currentSong={currentSong}
                playNext={playNext}
                playPrev={playPrev}
                getPlayPauseButton={getPlayPauseButton}
            />
        </div>
    )
}

export {RootLayout, AppSideBar, AppContent}