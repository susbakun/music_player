import { ComponentProps, useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { open } from '@tauri-apps/plugin-dialog';
import {  ReadSongType, CurrentSongType, View } from "@/shared/types";
import {IoPlay, IoPause} from "react-icons/io5";
import { Player } from "./Player";
import { ActionButton } from "./ActionButton";




function RootLayout({children, ...props}: ComponentProps<'main'>){
  return (
    <main {...props}>{children}</main>
  )
}

function AppSideBar(){
    const [currentView, setCurrentView] = useState<View>("tracks");

    const handleViewChange = (view: View) => {
        setCurrentView(view)
    }

    return(
        <aside className="border-r border-r-white/50
        w-[25%] flex flex-col gap-20 px-4 py-8">
            <section className="flex flex-col items-start gap-4">
                <h2 className="font-bold text-lg">Library</h2>
                <ul className="flex flex-col items-start gap-2
                font-light text-sm w-full">
                    <ActionButton 
                        text="Tracks"
                        view="tracks"
                        currentView={currentView}
                        handleViewChange={handleViewChange}
                    />
                    <ActionButton 
                        text="Play Queue" 
                        currentView={currentView} 
                        view="queue"
                        handleViewChange={handleViewChange}
                    />
                </ul>
            </section>
            <section className="flex flex-col items-start gap-4
            font-light text-sm">
                <h2 className="font-bold text-lg">Playlists</h2>
                <ul className="flex flex-col items-start gap-2
                font-light text-sm">
                    <ActionButton 
                        text="Create..." 
                        currentView={currentView}
                        view="playlist"
                        handleViewChange={handleViewChange}
                    />
                </ul>
            </section>
        </aside>
    )
}


function AppContent(){
    const [songs, setSongs] = useState<ReadSongType[]>([])
    const [currentSong, setCurrentSong] = useState<CurrentSongType | null>(null)

    const selectDirectory = async () => {
        let selectedDir = localStorage.getItem("selected-dir")
        if (selectedDir) {
            return selectedDir
        } else {
            selectedDir = await open({
                multiple: false,
                directory: true,
                defaultPath: "/Users/amir/Downloads/",
                title: "choose directory to scan"
            })

            selectedDir = selectedDir || "/Users/amir/Downloads/"

            localStorage.setItem("selected-dir", selectedDir)
    
            return selectedDir
        }
    }

    const getSongs = async (dir: string) => {
        const res = await invoke<ReadSongType[]>("read_songs", { dir });
        setSongs(res)
    }

    const playSong = (song: ReadSongType) => {
        setCurrentSong({...song, is_playing: true})

        const song_path = song.song_path;
        invoke("play_song", { song_path })
    }

    const pauseSong = (song: ReadSongType) => {
        setCurrentSong({...song, is_playing: false})

        const song_path = song.song_path;
        invoke("pause_song", { song_path })
    }

    const playNext = () => {
        if (!currentSong) {
            return
        }

        let currentSongIdx = songs.findIndex((song) =>
             song.song_name === currentSong.song_name)
        let lastSongIdx = songs.length - 1;
        
        let temp;

        if (currentSongIdx === lastSongIdx) {
            temp = songs[0];
        } else {
            temp = songs[currentSongIdx + 1]
        }

        let nextSong: CurrentSongType = {...temp, is_playing: false}

        playSong(nextSong)
    }

    const playPrev = () => {
        if (!currentSong) {
            return
        }

        let currentSongIdx = songs.findIndex((song) =>
             song.song_name === currentSong.song_name)
        let lastSongIdx = songs.length - 1;
        
        let temp;

        if (currentSongIdx === 0) {
            temp = songs[lastSongIdx];
        } else {
            temp = songs[currentSongIdx - 1]
        }

        let prevSong: CurrentSongType = {...temp, is_playing: false};

        playSong(prevSong)
    }

    const getPlayPauseButton = (song: ReadSongType, is_player?: boolean) => {
        if (currentSong && 
            currentSong.is_playing && 
            currentSong.song_name === song.song_name) {
            return (
                <button 
                    className={is_player ? 
                        "bg-black/80 rounded-full px-2 py-2" : 
                        ""}
                    onClick={() => pauseSong(song)}>
                        <IoPause />
                </button> 
            )
        } else {
            return (
                <button
                    className={is_player ? 
                        "bg-black/80 rounded-full px-2 py-2" : 
                        ""}
                    onClick={() => playSong(song)}>
                        <IoPlay />
                </button>
            )
        }
    }

    const togglePlay = (song: ReadSongType) => {
        if (currentSong && 
            currentSong.is_playing && 
            currentSong.song_name === song.song_name){
            pauseSong(song)
        } else {
            playSong(song)
        }
    }

    useEffect(() => {
        selectDirectory().then((dir) => {
            getSongs(dir)
        })
    }, [])

    useEffect(() => {
        const unlisten = listen<string>('finished-song', (event) => {
            let songName = event.payload;

            if (currentSong && 
                currentSong.song_name !== songName) return


            playNext()
        })

        return () => {
            unlisten.then((fn) => fn())
        }
    }, [currentSong])

    return(
        <div className="h-full flex flex-col w-full">
            <div className="flex-1 px-4 py-8 overflow-y-auto
            overflow-x-clip h-[80%] flex flex-col gap-6">
                <h2 className="text-2xl font-bold">Songs</h2>
                <ul className="flex flex-col gap-2">
                    {songs.map((song) => (
                        <li key={song.song_name}
                            className="flex items-center justify-between
                            hover:bg-white/5 rounded-xl px-2 py-1"
                            onDoubleClick={() => togglePlay(song)}>
                            <h3>{song.song_name}</h3>
                            {getPlayPauseButton(song)}
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