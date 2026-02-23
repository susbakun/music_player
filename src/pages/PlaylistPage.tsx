import { SearchFilterBar } from "@/components/SearchFilterBar"
import { Song } from "@/components/Song"
import { AddTracksToPlaylistModal, EditPlaylistModal } from "@/components/Modal"
import { useFilterSongs } from "@/hooks/useFilterSongs"
import { PlaylistType } from "@/shared/types";
import { useAppContentStore } from "@/store/useAppContentStore";
import { useEffect, useState } from "react";
import { IoIosAddCircleOutline } from "react-icons/io";
import { useParams } from "react-router-dom";
import { GoPencil } from "react-icons/go";



export const PlaylistPage = () => {
    const [playlist, setPlaylist] = useState<PlaylistType | undefined>(undefined)
    const [addTracksModalOpen, setAddTracksModalOpen] = useState(false)
    const [editPlaylistModalOpen, setEditPlaylistModalOpen] = useState(false)

    const togglePlay = useAppContentStore((s) => s.togglePlay);
    const getPlayPauseButton = useAppContentStore((s) => s.getPlayPauseButton);
    const getPlaylist = useAppContentStore((s) => s.getPlaylist);
    const getPlaylistTracks = useAppContentStore((s) => s.getPlaylistTracks);
    const playlists = useAppContentStore((s) => s.playlists);
    const playlistTracks = useAppContentStore((s) => s.playlistTracks);

    const { id } = useParams();

    const { filteredSongs, format, setFormat, searchQuery, setSearchQuery } =
        useFilterSongs(playlistTracks);

    useEffect(() => {
        if (id) {
        getPlaylistTracks(id);
        }
    }, [id, getPlaylistTracks]);

    useEffect(() => {
        if (id) {
        setPlaylist(getPlaylist(id));
        }
    }, [id, playlists, getPlaylist]);

    if (playlist) 
        return (
            <div className="flex-1 px-4 py-8 overflow-y-auto overflow-x-clip 
                h-[80%] flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h2 className="text-2xl font-bold">{playlist.name}</h2>
                        <button
                            title="Edit playlist name"
                            onClick={() => setEditPlaylistModalOpen(true)}
                            className="p-1 rounded hover:bg-white/10 transition-colors"
                        >
                            <GoPencil className="w-5 h-5" />
                        </button>
                    </div>
                    <button
                        title="Add tracks to playlist"
                        onClick={() => setAddTracksModalOpen(true)}
                        className="p-1 rounded hover:bg-white/10 transition-colors"
                    >
                        <IoIosAddCircleOutline className="w-5 h-5" />
                    </button>
                </div>
                <AddTracksToPlaylistModal
                    isOpen={addTracksModalOpen}
                    onClose={() => setAddTracksModalOpen(false)}
                    playlistId={playlist.id}
                    playlistName={playlist.name}
                />
                <EditPlaylistModal
                    isOpen={editPlaylistModalOpen}
                    onClose={() => setEditPlaylistModalOpen(false)}
                    playlistId={playlist.id}
                    playlistName={playlist.name}
                />
                <SearchFilterBar
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    format={format}
                    onFormatChange={setFormat}
                />
                {filteredSongs.length === 0 ? (
                    <p className="text-white/60 text-sm">No songs found.</p>
                ) : (
                    <ul className="flex flex-col gap-2">
                    {filteredSongs.map((song, index) => (
                        <Song
                            song={song}
                            number={index + 1}
                            togglePlay={togglePlay}
                            getPlayPauseButton={getPlayPauseButton}
                            playlistId={playlist.id}
                        />
                    ))}
                    </ul>
                )}
            </div>
        )
}
