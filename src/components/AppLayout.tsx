import { ComponentProps, MouseEvent, useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { listen } from "@tauri-apps/api/event";
import { Player, CustomLoader, CreatePlaylistModal } from "@/components";
import { useAppContentStore } from "@/store/useAppContentStore";
import { Toaster } from "react-hot-toast";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { invoke } from "@tauri-apps/api/core";
import { info } from "@tauri-apps/plugin-log";
import { Menu, MenuItemOptions } from "@tauri-apps/api/menu";
import { playlistRouteRegExp } from "@/shared/constants";

function RootLayout({ children, ...props }: ComponentProps<"main">) {
  return <main {...props}>{children}</main>;
}

function AppSideBar() {
  const [createPlaylistModalOpen, setCreatePlaylistModalOpen] = useState(false);
  const playlists = useAppContentStore((s) => s.playlists)
  const getPlaylists = useAppContentStore((s) => s.getPlaylists)
  const createPlaylist = useAppContentStore((s) => s.createPlaylist)
  const deletePlaylist = useAppContentStore((s) => s.deletePlaylist)

  const handleContextMenu = async (event: MouseEvent, id: string) => {
    event.preventDefault()

    const option1: MenuItemOptions = {
        id: "ctx_option1",
        text: "Delete Playlist",
        action: () => deletePlaylist(id),
    }

    const menu = await Menu.new({ items: [option1] })
    
    menu.popup()
  }

  useEffect(() => {
    const unlistenCreatePlaylist = listen("create_playlist_on_menu", () => {
      let n = playlists.length
      let name = `playlist #${n}`
      createPlaylist(name)
    })

    return () => {
      unlistenCreatePlaylist.then((fn) => fn())
    }
  }, [playlists])

  useEffect(() => {
    getPlaylists()
  }, [])

  return (
    <>
      <aside className="border-r border-r-white/50 w-[25%] 
        flex flex-col gap-20 px-4 py-8 overflow-y-scroll">
      <section className="flex flex-col items-start gap-4">
        <h2 className="font-bold text-lg">Library</h2>
        <ul className="flex flex-col items-start gap-2 font-light text-sm w-full">
          <NavLink
            to="/tracks"
            onContextMenu={(e) => {e.preventDefault()}}
            className={({ isActive }) =>
              `w-full text-start rounded-md px-2 py-1 
              ${isActive ? "bg-white/5 font-bold" : ""}`
            }
          >
            Tracks
          </NavLink>
          <NavLink
            to="/queue"
            onContextMenu={(e) => {e.preventDefault()}}
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
          {
            playlists.map((playlist) => (
              <NavLink
                onContextMenu={(e) => handleContextMenu(e, playlist.id)}
                key={playlist.id}
                to={`playlist/${playlist.id}`}
                className={({ isActive }) =>
                  `w-full text-start rounded-md px-2 py-1 
                  ${isActive ? "bg-white/5 font-bold" : ""}`
                }
              >
                {playlist.name}
            </NavLink>
            ))
          }
          <button
            type="button"
            onClick={() => setCreatePlaylistModalOpen(true)}
            className="w-full text-start rounded-md px-2 py-1 hover:bg-white/5"
          >
            Create...
          </button>
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
  const nullifyCurrentSong = useAppContentStore((s) => s.nullifyCurrentSong);
  const pauseSong = useAppContentStore((s) => s.pauseSong);
  const playNext = useAppContentStore((s) => s.playNext);
  const selectDirectory = useAppContentStore((s) => s.selectDirectory)
  const getSongs = useAppContentStore((s) => s.getSongs)
  const getWorkingDirectory = useAppContentStore((s) => s.getWorkingDirectory)
  const setPlaylistForPlayback = useAppContentStore((s) => s.setPlaylistForPlayback)

  const location = useLocation()

  useKeyboardShortcuts()

  useEffect(() => {
    setPlaylistForPlayback(playlistRouteRegExp.test(location.pathname))
    
    // dismiss the current song
    if (currentSong) pauseSong(currentSong)
    nullifyCurrentSong()
  }, [location.pathname, setPlaylistForPlayback])

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