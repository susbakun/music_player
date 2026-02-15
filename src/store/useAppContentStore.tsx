import type React from "react";
import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { ReadSongType, CurrentSongType } from "@/shared/types";
import { IoPlay, IoPause } from "react-icons/io5";

type AppContentState = {
    songs: ReadSongType[];
    currentSong: CurrentSongType | null;
};

type AppContentActions = {
    setSongs: (songs: ReadSongType[]) => void;
    selectDirectory: () => Promise<string>;
    getSongs: (dir: string) => Promise<void>;
    playSong: (song: ReadSongType) => void;
    pauseSong: (song: ReadSongType) => void;
    playNext: () => void;
    playPrev: () => void;
    getPlayPauseButton: (song: ReadSongType, is_player?: boolean) => React.JSX.Element;
    togglePlay: (song: ReadSongType) => void;
};

export const useAppContentStore = create<AppContentState & AppContentActions>(
    (set, get) => ({
      songs: [],
      currentSong: null,

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
        const res = await invoke<ReadSongType[]>("read_songs", { dir });
        set({ songs: res });
      },

      playSong: (song: ReadSongType) => {
        set({ currentSong: { ...song, is_playing: true } });
        invoke("play_song", { song_path: song.song_path });
      },

      pauseSong: (song: ReadSongType) => {
        set({ currentSong: { ...song, is_playing: false } });
        invoke("pause_song", { song_path: song.song_path });
      },

      playNext: () => {
        const { currentSong, songs, playSong } = get();
        if (!currentSong) return;

        const currentSongIdx = songs.findIndex(
          (s) => s.song_name === currentSong.song_name
        );
        const lastSongIdx = songs.length - 1;
        const temp =
          currentSongIdx === lastSongIdx ? songs[0] : songs[currentSongIdx + 1];
        const nextSong: CurrentSongType = { ...temp, is_playing: false };
        playSong(nextSong);
      },

      playPrev: () => {
        const { currentSong, songs, playSong } = get();
        if (!currentSong) return;

        const currentSongIdx = songs.findIndex(
          (s) => s.song_name === currentSong.song_name
        );
        const lastSongIdx = songs.length - 1;
        const temp =
          currentSongIdx === 0 ? songs[lastSongIdx] : songs[currentSongIdx - 1];
        const prevSong: CurrentSongType = { ...temp, is_playing: false };
        playSong(prevSong);
      },

      getPlayPauseButton: (song: ReadSongType, is_player?: boolean): React.JSX.Element => {
        const { currentSong, pauseSong, playSong } = get();
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

      togglePlay: (song: ReadSongType) => {
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
    })
);
