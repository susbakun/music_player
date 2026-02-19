import { ComponentProps, useEffect } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { listen } from "@tauri-apps/api/event";
import { Player } from "./Player";
import { useAppContentStore } from "@/store/useAppContentStore";
import { CustomLoader } from "./Custom/CustomLoader";
import { Toaster } from "react-hot-toast";

function RootLayout({ children, ...props }: ComponentProps<"main">) {
  return <main {...props}>{children}</main>;
}

function AppSideBar() {
  return (
    <aside className="border-r border-r-white/50 w-[25%] flex flex-col gap-20 px-4 py-8">
      <section className="flex flex-col items-start gap-4">
        <h2 className="font-bold text-lg">Library</h2>
        <ul className="flex flex-col items-start gap-2 font-light text-sm w-full">
          <NavLink
            to="/tracks"
            className={({ isActive }) =>
              `w-full text-start rounded-md px-2 py-1 
              ${isActive ? "bg-white/5 font-bold" : ""}`
            }
          >
            Tracks
          </NavLink>
          <NavLink
            to="/queue"
            className={({ isActive }) =>
              `w-full text-start rounded-md px-2 py-1 
              ${isActive ? "bg-white/5 font-bold" : ""}`
            }
          >
            Play Queue
          </NavLink>
        </ul>
      </section>
      <section className="flex flex-col items-start gap-4 font-light text-sm">
        <h2 className="font-bold text-lg">Playlists</h2>
        <ul className="flex flex-col items-start gap-2 font-light text-sm">
        <NavLink
            to="/playlist"
            className={({ isActive }) =>
              `w-full text-start rounded-md px-2 py-1 
              ${isActive ? "bg-white/5 font-bold" : ""}`
            }
          >
            Create...
          </NavLink>
        </ul>
      </section>
    </aside>
  );
}

function AppContent() {
  const currentSong = useAppContentStore((s) => s.currentSong);
  const isLoading = useAppContentStore((s) => s.isLoading);
  const playNext = useAppContentStore((s) => s.playNext);
  const playPrev = useAppContentStore((s) => s.playPrev);
  const getPlayPauseButton = useAppContentStore((s) => s.getPlayPauseButton);
  const selectDirectory = useAppContentStore((s) => s.selectDirectory)
  const getSongs = useAppContentStore((s) => s.getSongs)

  const specifyDirectory = (force?: boolean) => {
    selectDirectory(force).then((dir) => {
      getSongs(dir);
    });
  }

  useEffect(() => {
    const unlisten = listen<string>("change-directory", () => {
      specifyDirectory(true)
    })

    specifyDirectory()

    return () => {
      unlisten.then((fn) => fn())
    }
  }, []);

  useEffect(() => {
    const unlisten = listen<string>("finished-song", (event) => {
      const songName = event.payload;
      if (currentSong && currentSong.song_name !== songName) return;
      playNext();
    });
    return () => {
      unlisten.then((fn) => fn());
    };
  }, [currentSong, playNext]);

  return (
    <div className="h-full flex flex-col w-full">
      {isLoading ? <CustomLoader /> : <Outlet />}
      <Player
        playNext={playNext}
        playPrev={playPrev}
        getPlayPauseButton={getPlayPauseButton}
      />
      <Toaster />
    </div>
  );
}

export {RootLayout, AppSideBar, AppContent}