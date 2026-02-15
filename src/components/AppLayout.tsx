import { ComponentProps, useEffect, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import { View } from "@/shared/types";
import { Player } from "./Player";
import { ActionButton } from "./ActionButton";
import { Song } from "./Song";
import { useAppContentStore } from "@/store/useAppContentStore";




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
    const songs = useAppContentStore((s) => s.songs);
    const currentSong = useAppContentStore((s) => s.currentSong);
    const selectDirectory = useAppContentStore((s) => s.selectDirectory);
    const getSongs = useAppContentStore((s) => s.getSongs);
    const playNext = useAppContentStore((s) => s.playNext);
    const playPrev = useAppContentStore((s) => s.playPrev);
    const getPlayPauseButton = useAppContentStore((s) => s.getPlayPauseButton);
    const togglePlay = useAppContentStore((s) => s.togglePlay);

    useEffect(() => {
        selectDirectory().then((dir) => {
            getSongs(dir)
        })
    }, [selectDirectory, getSongs])

    useEffect(() => {
        const unlisten = listen<string>('finished-song', (event) => {
            const songName = event.payload;
            if (currentSong && currentSong.song_name !== songName) return;
            playNext()
        })
        return () => {
            unlisten.then((fn) => fn())
        }
    }, [currentSong, playNext])

    return(
        <div className="h-full flex flex-col w-full">
            <div className="flex-1 px-4 py-8 overflow-y-auto
            overflow-x-clip h-[80%] flex flex-col gap-6">
                <h2 className="text-2xl font-bold">Songs</h2>
                <ul className="flex flex-col gap-2">
                    {songs.map((song, index) => (
                        <Song
                            song={song}
                            number={index + 1}
                            togglePlay={togglePlay}
                            getPlayPauseButton={getPlayPauseButton}
                        />
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