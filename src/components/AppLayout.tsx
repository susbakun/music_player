import { ComponentProps, useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { listen } from "@tauri-apps/api/event";
import { Player, CustomLoader, CreatePlaylistModal } from "@/components";
import { useAppContentStore } from "@/store/useAppContentStore";
import { Toaster } from "react-hot-toast";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { invoke } from "@tauri-apps/api/core";
import { info } from "@tauri-apps/plugin-log";

function RootLayout({ children, ...props }: ComponentProps<"main">) {
  return <main {...props}>{children}</main>;
}

function AppSideBar() {
  const [createPlaylistModalOpen, setCreatePlaylistModalOpen] = useState(false);
  const [playlists, setPlaylists] = useState<string[]>([])

  useEffect(() => {
    invoke<string[]>("get_playlists").then((res) => {
      setPlaylists(res)
    }).catch((e) => {
      info(e as string)
    })
  }, [])

  return (
    <>
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
        <ul className="flex flex-col items-start gap-2 font-light text-sm w-full">
          <button
            type="button"
            onClick={() => setCreatePlaylistModalOpen(true)}
            className="w-full text-start rounded-md px-2 py-1 hover:bg-white/5"
          >
            Create...
          </button>
          {
            playlists.map((playlist) => (
              <button
                type="button"
                onClick={() => setCreatePlaylistModalOpen(true)}
                className="w-full text-start rounded-md px-2 py-1 hover:bg-white/5"
              >
                {playlist}
              </button>
            ))
          }
        </ul>
      </section>
    </aside>
    <CreatePlaylistModal
        isOpen={createPlaylistModalOpen}
        onClose={() => setCreatePlaylistModalOpen(false)}
      />
    </>
  );
}

function AppContent() {
  const currentSong = useAppContentStore((s) => s.currentSong);
  const isLoading = useAppContentStore((s) => s.isLoading);
  const playNext = useAppContentStore((s) => s.playNext);
  const selectDirectory = useAppContentStore((s) => s.selectDirectory)
  const getSongs = useAppContentStore((s) => s.getSongs)
  const getWorkingDirectory = useAppContentStore((s) => s.getWorkingDirectory)

  useKeyboardShortcuts()

  const specifyDirectory = (force?: boolean) => {
    selectDirectory(force).then((dir) => {
      getSongs(dir);
    });
  }

  const watchWorkingDir = async () => {
    const workingDir = await getWorkingDirectory()
    
    invoke("watch_dir", {path: workingDir}).then((e) => {
      info(e as string)
    })
  }

  useEffect(() => {
    const unlistenChooseDirectory = listen<string>("choose-directory", () => {
      specifyDirectory(true)
    })

    const unlistenDirectoryChanged = listen("directory-changed", async () => {
      const workingDir = await getWorkingDirectory()
      getSongs(workingDir)
    })

    specifyDirectory()

    watchWorkingDir()

    return () => {
      unlistenChooseDirectory.then((fn) => fn())
      unlistenDirectoryChanged.then((fn) => fn())
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
    <div className="h-full flex flex-col w-full overflow-hidden">
      {isLoading ? <CustomLoader /> : <Outlet />}
      <Player />
      <Toaster />
    </div>
  );
}

export {RootLayout, AppSideBar, AppContent}