import type React from "react";
import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { ReadFileType, SongType } from "@/shared/types";
import { IoPlay, IoPause } from "react-icons/io5";
import { error, info } from "@tauri-apps/plugin-log"
import { DEFAULT_PATH } from "@/shared/constants";
import toast from "react-hot-toast";


type AppContentState = {
    songs: SongType[];
    currentSong: SongType | null;
    queue: SongType[];
    isLoading: boolean,
    master_volume: number;
    shuffle: boolean;
    repeat: boolean;
};

type AppContentActions = {
    setSongs: (songs: SongType[]) => void;
    selectDirectory: (force?: boolean) => Promise<string>;
    getSongs: (dir: string) => Promise<void>;
    getWorkingDirectory: () => string;
    playSong: (song: SongType) => Promise<void>;
    pauseSong: (song: SongType) => Promise<void>;
    playNext: () => void;
    playPrev: () => void;
    getSongPosition: () => Promise<number | undefined>;
    setVolume: (volume: number) => Promise<void>,
    setSongPosition: (position: number) => Promise<void>;
    getPlayPauseButton: (song: SongType, is_player?: boolean) => React.JSX.Element;
    toggleRepeat: () => void;
    toggleShuffle: () => void;
    togglePlay: (song: SongType) => void;
    processQueue: () => void;
    muteVolume: () => void;
    addToQueue: (song: SongType) => void,
    removeFromQueue: (song: SongType) => void,
    isSongInQueue: (song: SongType) => boolean
};

export const useAppContentStore = create<AppContentState & AppContentActions>(
    (set, get) => ({
      songs: [],
      currentSong: null,
      queue: [],
      isLoading: false,
      master_volume: 1.0,
      shuffle: false,
      repeat: false,

      // tracks
      setSongs: (songs) => set({ songs }),

      selectDirectory: async (force) => {
        let selectedDir = localStorage.getItem("selected-dir");
        if (selectedDir && !force) {
          return selectedDir;
        }
        selectedDir = await open({
          multiple: false,
          directory: true,
          defaultPath: DEFAULT_PATH,
          title: "choose directory to scan",
        });
        selectedDir = selectedDir || DEFAULT_PATH;
        localStorage.setItem("selected-dir", selectedDir);
        return selectedDir;
      },

      getSongs: async (dir) => {
        set({isLoading: true})
        try {
          const res = await invoke<ReadFileType[]>("read_songs", { dir })
          info("Read the songs successfully");

          const songs: SongType[] = res.map((song) => ({...song, is_playing: false}))
          set({ songs });
  
          set({isLoading: false})
        } catch (err: unknown) {
          await error(err as string)
          
          toast.error("couldn't read the path")

          set({isLoading: false})
          localStorage.setItem("selected-dir", "")
        }

      },

      getWorkingDirectory() {
        return localStorage.getItem("selected-dir") || DEFAULT_PATH
      },

      // player
      playSong: async (song) => {
        const { songs, queue, master_volume, repeat } = get()
        
        const updatedSongs = songs.map((s) => {
          if (s.song_name === song.song_name) {
            return {...s, is_playing: true}
          }
          return {...s, is_playing: false}
        })

        const updatedQueue = queue.map((s) => {
          if (s.song_name === song.song_name) {
            return {...s, is_playing: true}
          }
          return {...s, is_playing: false}
        })

        const currentSong: SongType = {...song, is_playing: true}

        set({ currentSong})
        set({ songs: updatedSongs })
        set({ queue: updatedQueue })
        
        try {
          await invoke("play_song", { 
            song_path: song.song_path, 
            volume: master_volume,
            repeat
          });

          info("played the song successfully")

        } catch (err: unknown) {
          error(err as string)

          toast.error("couldn't play the song")
        }
      },

      pauseSong: async (song) => {
        const { songs, queue} = get()
        
        const updatedSongs = songs.map((s) => ({...s, is_playing: false}))

        const updatedQueue = queue.map((s) => ({...s, is_playing: false}))

        const updatedCurrentSong: SongType = {...song, is_playing: false}

        set({currentSong: updatedCurrentSong})
        set({songs: updatedSongs})
        set({queue: updatedQueue})

        try {
          await invoke("pause_song", { song_path: song.song_path });

          info("paused the song successfully")

        } catch (err: unknown) {
          await error(err as string)

          toast.error("coudn't pause the song")
        }
      },

      playNext: () => {
        const { 
          currentSong, 
          songs, 
          queue, 
          playSong,
          shuffle,
          processQueue,
          repeat } = get();

        // if queue wasn't empty then pick one from there
        if (queue.length > 0) {
          processQueue()
          return
        }

        if (!currentSong) return;

        let nextSong: SongType;

        if (repeat) {
          nextSong = currentSong
        } else if (shuffle) {
          const length = songs.length
          nextSong = songs[Math.floor(Math.random() * length)]
        } else {
          const currentSongIndex = songs.findIndex
            ((s) => s.song_name === currentSong.song_name)
  
          const lastSongIdx = songs.length - 1;
          nextSong =
            currentSongIndex === lastSongIdx ? 
            songs[0] : 
            songs[currentSongIndex + 1];
        }


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

      getSongPosition: async () => {;
        try {
          return await invoke<number>("get_song_position");

        } catch (err: unknown) {
          await error(err as string)

          toast.error("couldn't get the song position")
        }

      },

      setVolume: async (volume) => {
        set({master_volume: volume})
        try {
          await invoke("change_master_volume", { volume: volume })

          info("changed master volume successfully")

        } catch (err: unknown) {
          await error(err as string)

          toast.error("couldn't change the master volume")
        }
      },

      setSongPosition: async (position) => {
        try {
          await invoke("change_song_position", { position })

          info("changed song position successfully")
      } catch (err: unknown) {
          await error(err as string)

          toast.error("failed to change the song position")
      }
      },

      getPlayPauseButton: (song, is_player): React.JSX.Element => {
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

      toggleRepeat() {
        const { repeat } = get()

        set({repeat: !repeat})
      },

      toggleShuffle() {
        const { shuffle } = get()

        set({shuffle: !shuffle})
      },

      muteVolume: () => {
        const { setVolume } = get()

        setVolume(0.0)
      },

      // queue
      processQueue: () => {
        const {
          queue, 
          removeFromQueue,
          shuffle, 
          repeat, 
          currentSong,
          playSong
        } = get()

        if (!currentSong) return

        let nextSong: SongType;

        if (repeat) {
          nextSong = currentSong
        } else if (shuffle) {
          const length = queue.length
          nextSong = queue[Math.floor(Math.random() * length)]
        } else {
          nextSong = queue.shift()!
        }

        removeFromQueue(nextSong)

        playSong(nextSong)        
      },

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

      isSongInQueue(song) {
        const { queue } = get()

        return !!queue.find((queuedSong) => 
          queuedSong.song_name === song.song_name)
      },
    })
);
