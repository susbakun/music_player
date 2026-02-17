import type React from "react";
import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { ReadFileType, SongType } from "@/shared/types";
import { IoPlay, IoPause } from "react-icons/io5";

type AppContentState = {
    songs: SongType[];
    currentSong: SongType | null;
    queue: SongType[];
};

type AppContentActions = {
    setSongs: (songs: SongType[]) => void;
    selectDirectory: () => Promise<string>;
    getSongs: (dir: string) => Promise<void>;
    playSong: (song: SongType) => void;
    pauseSong: (song: SongType) => void;
    playNext: () => void;
    playPrev: () => void;
    getPlayPauseButton: (song: SongType, is_player?: boolean) => React.JSX.Element;
    togglePlay: (song: SongType) => void;
    addToQueue: (song: SongType) => void,
    removeFromQueue: (song: SongType) => void,
    isSongInQueue: (song: SongType) => boolean
};

export const useAppContentStore = create<AppContentState & AppContentActions>(
    (set, get) => ({
      songs: [],
      currentSong: null,
      queue: [],

      // tracks
      setSongs: (songs) => set({ songs }),

      selectDirectory: async () => {
        let selectedDir = localStorage.getItem("selected-dir");
        if (selectedDir) {
          return selectedDir;
        }
        selectedDir = await open({
          multiple: false,
          directory: true,
          defaultPath: "/Users/amir/Downloads/",
          title: "choose directory to scan",
        });
        selectedDir = selectedDir || "/Users/amir/Downloads/";
        localStorage.setItem("selected-dir", selectedDir);
        return selectedDir;
      },

      getSongs: async (dir: string) => {
        const res = await invoke<ReadFileType[]>("read_songs", { dir })
        const songs: SongType[] = res.map((song) => ({...song, is_playing: false}))

        set({ songs });
      },

      // player
      playSong: (song) => {
        const { songs, queue } = get()
        
        const updatedSongs = songs.map((s) => {
          if (s.song_name === song.song_name) {
            return {...s, is_playing: true}
          }
          return s
        })

        const updatedQueue = queue.map((s) => {
          if (s.song_name === song.song_name) {
            return {...s, is_playing: true}
          }
          return s
        })

        const currentSong: SongType = {...song, is_playing: true}

        set({ currentSong})
        set({ songs: updatedSongs })
        set({ queue: updatedQueue })
        invoke("play_song", { song_path: song.song_path });
      },

      pauseSong: (song) => {
        const { songs, queue} = get()
        
        const updatedSongs = songs.map((s) => ({...s, is_playing: false}))

        const updatedQueue = queue.map((s) => ({...s, is_playing: false}))

        const updatedCurrentSong: SongType = {...song, is_playing: false}

        set({currentSong: updatedCurrentSong})
        set({songs: updatedSongs})
        set({queue: updatedQueue})
        invoke("pause_song", { song_path: song.song_path });
      },

      playNext: () => {
        const { currentSong, songs, queue, playSong } = get();

        // if queue wasn't empty then pick one from there
        if (queue.length > 0) {
          const nextSong = queue.shift()!
          playSong(nextSong)
          return
        }

        if (!currentSong) return;

        const currentSongIndex = songs.findIndex
          ((s) => s.song_name === currentSong.song_name)

        const lastSongIdx = songs.length - 1;
        const nextSong =
          currentSongIndex === lastSongIdx ? 
          songs[0] : 
          songs[currentSongIndex + 1];

        playSong(nextSong);
      },

      playPrev: () => {
        const { currentSong, songs, playSong } = get();

        if (!currentSong) return;

        const currentSongIndex = songs.findIndex
          ((s) => s.song_name === currentSong.song_name)

        const lastSongIdx = songs.length - 1;
        const prevSong =
          currentSongIndex === 0 ? 
          songs[lastSongIdx] : 
          songs[currentSongIndex - 1];

        playSong(prevSong);
      },

      getPlayPauseButton: (song, is_player?): React.JSX.Element => {
        const { pauseSong, playSong, currentSong } = get();
        const btnClass = is_player ? "bg-black/80 rounded-full px-2 py-2" : "";

        if (
          currentSong &&
          currentSong.is_playing &&
          currentSong.song_name === song.song_name
        ) {
          return (
            <button className={btnClass} onClick={() => pauseSong(song)}>
              <IoPause />
            </button>
          );
        }
        return (
          <button className={btnClass} onClick={() => playSong(song)}>
            <IoPlay />
          </button>
        );
      },

      togglePlay: (song) => {
        const { currentSong, pauseSong, playSong } = get();

        if (
          currentSong &&
          currentSong.is_playing &&
          currentSong.song_name === song.song_name
        ) {
          pauseSong(song);
        } else {
          playSong(song);
        }
      },

      // queue
      addToQueue: (song) => {
        let { queue } = get();
        queue.push({...song})

        set({ queue })
      },

      removeFromQueue(song) {
        let { queue } = get();

        const updatedQueue = queue.filter((queuedSong) => 
          queuedSong.song_name != song.song_name)

        set({ queue: updatedQueue })
      },

      isSongInQueue(song): boolean {
        const { queue } = get()

        return !!queue.find((queuedSong) => 
          queuedSong.song_name === song.song_name)
      },
    })
);
