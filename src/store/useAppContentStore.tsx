import type React from "react";
import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { PlaylistType, ReadFileType, SongType } from "@/shared/types";
import { IoPlay, IoPause } from "react-icons/io5";
import { error, info } from "@tauri-apps/plugin-log"
import { DEFAULT_PATH } from "@/shared/constants";
import toast from "react-hot-toast";


type AppContentState = {
    songs: SongType[];
    currentSong: SongType | null;
    queue: SongType[];
    isLoading: boolean,
    masterVolume: number;
    shuffle: boolean;
    repeat: boolean;
    playlists: PlaylistType[];
    playlistTracks: SongType[];
    /** When true, next/prev use playlistTracks; when false, use songs (library). Set from layout based on route. */
    usePlaylistTracksForPlayback: boolean;
};

type AppContentActions = {
    setSongs: (songs: SongType[]) => void;
    selectDirectory: (force?: boolean) => Promise<string>;
    getSongs: (dir: string) => Promise<void>;
    getWorkingDirectory: () => Promise<string>;
    nullifyCurrentSong: () => void;
    playSong: (song: SongType) => Promise<void>;
    pauseSong: (song: SongType) => Promise<void>;
    playNext: () => void;
    playPrev: () => void;
    setPlaylistForPlayback: (value: boolean) => void;
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
    isSongInQueue: (song: SongType) => boolean,
    getPlaylists: () => Promise<void>,
    getPlaylist: (id: string) => PlaylistType | undefined,
    getPlaylistTracks: (id: string) => Promise<void>;
    createPlaylist: (name: string) => Promise<string | undefined>;
    editPlaylistName: (id: string, new_name: string) => Promise<void>;
    deletePlaylist: (id: string) => Promise<void>;
    addToPlaylist: (playlistId: string, songNames: string[]) => Promise<void>;
    removeFromPlaylist: (playlistId: string, song_name: string) => Promise<void>;
};

export const useAppContentStore = create<AppContentState & AppContentActions>(
    (set, get) => ({
      songs: [],
      currentSong: null,
      queue: [],
      isLoading: false,
      masterVolume: 1.0,
      shuffle: false,
      repeat: false,
      playlists: [],
      playlistTracks: [],
      usePlaylistTracksForPlayback: false,

      setPlaylistForPlayback: (value) => set({ usePlaylistTracksForPlayback: value }),

      // tracks
      setSongs: (songs) => set({ songs }),

      selectDirectory: async (force) => {
        let selectedDir = localStorage.getItem("selected-dir");
        if (selectedDir && !force) {
          return selectedDir;
        }

        const defaultPath = await DEFAULT_PATH

        selectedDir = await open({
          multiple: false,
          directory: true,
          defaultPath,
          title: "choose directory to scan",
        });
        selectedDir = selectedDir || defaultPath;
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

      getWorkingDirectory: async () => {
        const defaultPath = await DEFAULT_PATH

        return localStorage.getItem("selected-dir") || defaultPath
      },

      nullifyCurrentSong: () => {
        set({ currentSong: null })
      },

      // player
      playSong: async (song) => {
        const { songs, queue, masterVolume, repeat } = get()
        
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
            volume: masterVolume,
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
          playlistTracks,
          repeat,
          usePlaylistTracksForPlayback } = get();

        // if queue wasn't empty then pick one from there
        if (queue.length > 0) {
          processQueue()
          return
        }

        if (!currentSong) return;

        let nextSong: SongType;

        const source = usePlaylistTracksForPlayback ? playlistTracks : songs

        if (repeat) {
          nextSong = currentSong
        } else if (shuffle) {
          const length = source.length
          nextSong = source[Math.floor(Math.random() * length)]
        } else {
          const currentSongIndex = source.findIndex
            ((s) => s.song_name === currentSong.song_name)
  
          const lastSongIdx = source.length - 1;
          nextSong =
            currentSongIndex === lastSongIdx ? 
            source[0] : 
            source[currentSongIndex + 1];
        }


        playSong(nextSong);
      },

      playPrev: () => {
        const { currentSong, songs, playSong, playlistTracks, usePlaylistTracksForPlayback } = get();

        if (!currentSong) return;

        const source = usePlaylistTracksForPlayback ? playlistTracks : songs

        const currentSongIndex = source.findIndex
          ((s) => s.song_name === currentSong.song_name)

        const lastSongIdx = source.length - 1;
        const prevSong =
          currentSongIndex === 0 ? 
          source[lastSongIdx] : 
          source[currentSongIndex - 1];

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
        set({masterVolume: volume})
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

      // playlist
      getPlaylists: async () => {
        try {
          let playlists = await invoke<PlaylistType[]>("get_playlists")
          set({ playlists })

          info("retrieved playlists successfully")
      } catch (err: unknown) {
          await error(err as string)

          toast.error("failed to retriev the playlists")
      }
      },

      getPlaylist: (id) => {
        const { playlists } = get()

        return playlists.find((playlist) => playlist.id === id)
      },

      getPlaylistTracks: async (id) => {
        try {
          const res = await invoke<ReadFileType[]>("get_playlist_tracks", { playlist_id: id })
          const tracks: SongType[] = res.map((track) => ({...track, is_playing: false}))

          set({playlistTracks: tracks})

          info("retrieved playlist tracks successfully")
        } catch (e) {
          await error(e as string)
          toast.error("couldn't retrieve playlist tracks")
        }
      },

      createPlaylist: async (name) => {
        try {
          const { getPlaylists } = get()
          const playlistId = await invoke<string>("create_playlist", {playlist_name: name})
          toast.success(`playlist ${name} created`)
          await getPlaylists()
          return playlistId
        } catch (e) {
          await error(e as string)
          toast.error("Failed to add tracks to playlist")
        }
      },

      editPlaylistName: async (id, new_name) => {
        try {
          const { getPlaylists } = get()
          await invoke("edit_playlist_name", { playlist_id: id, new_name })
          toast.success(`playlist's name updated to ${new_name}`)
          await getPlaylists()
        } catch (e) {
          await error(e as string)
          toast.error("Failed to update playlist name")
        }
      },

      deletePlaylist: async (id) => {
        try {
          const { getPlaylists } = get()
          await invoke("delete_playlist", { playlist_id: id })
          toast.success(`playlist removed successfully`)
          await getPlaylists()
        } catch (e) {
          await error(e as string)
          toast.error("Failed to remove the playlist")
        }
      },

      addToPlaylist: async (playlistId, songNames) => {
        if (songNames.length === 0) return;
        try {
          const { getPlaylistTracks } = get()
          await invoke("add_to_playlist", { playlist_id: playlistId, song_names: songNames })
          toast.success(`Added ${songNames.length} track(s) to playlist`)
          await getPlaylistTracks(playlistId)
        } catch (e) {
          await error(e as string)
          toast.error("Failed to add tracks to playlist")
        }
      },

      removeFromPlaylist: async (playlistId, song_name) => {
        info(`${song_name}: ${playlistId}`)
        try {
          const { getPlaylistTracks } = get()
          await invoke("remove_from_playlist", { playlist_id: playlistId, song_name })
          await info(`removed song ${song_name} from playlist`)
          await getPlaylistTracks(playlistId)
        } catch (e) {
          await error(e as string)
          toast.error("Failed to remove track from playlist")
        }
      },
    })
);
