import { useState, useMemo } from "react";
import { CustomModal } from "@/components";
import { useAppContentStore } from "@/store/useAppContentStore";
import { SongType } from "@/shared/types";
import toast from "react-hot-toast";

type AddTracksToPlaylistModalProps = {
  isOpen: boolean;
  onClose: () => void;
  playlistId: string;
  playlistName: string;
};

export function AddTracksToPlaylistModal({
  isOpen,
  onClose,
  playlistId,
  playlistName,
}: AddTracksToPlaylistModalProps) {
  const songs = useAppContentStore((s) => s.songs);
  const addToPlaylist = useAppContentStore((s) => s.addToPlaylist);
  const playlistTracks = useAppContentStore((s) => s.playlistTracks);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  const alreadyInPlaylist = useMemo(
    () => new Set(playlistTracks.map((t) => t.song_name)),
    [playlistTracks]
  );

  const availableSongs = useMemo(
    () => songs.filter((s) => !alreadyInPlaylist.has(s.song_name)),
    [songs, alreadyInPlaylist]
  );

  const filteredSongs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return availableSongs;
    return availableSongs.filter(
      (s) =>
        s.song_name.toLowerCase().includes(q) ||
        (s.artist && s.artist.toLowerCase().includes(q))
    );
  }, [availableSongs, searchQuery]);

  const toggle = (song: SongType) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(song.song_name)) next.delete(song.song_name);
      else next.add(song.song_name);
      return next;
    });
  };

  const selectAll = () => {
    const visibleNames = new Set(filteredSongs.map((s) => s.song_name));
    const allVisibleSelected = visibleNames.size > 0 && [...visibleNames].every((name) => selected.has(name));
    if (allVisibleSelected) {
      setSelected((prev) => {
        const next = new Set(prev);
        visibleNames.forEach((name) => next.delete(name));
        return next;
      });
    } else {
      setSelected((prev) => {
        const next = new Set(prev);
        visibleNames.forEach((name) => next.add(name));
        return next;
      });
    }
  };

  const handleAdd = async () => {
    const toAdd = Array.from(selected);
    if (toAdd.length === 0) {
      toast.error("Select at least one track");
      return;
    }
    await addToPlaylist(playlistId, toAdd);
    setSelected(new Set());
    onClose();
  };

  const handleClose = () => {
    setSelected(new Set());
    setSearchQuery("");
    onClose();
  };

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Add tracks to "${playlistName}"`}
    >
      <div className="flex flex-col gap-4">
        {availableSongs.length === 0 ? (
          <p className="text-white/60 text-sm">
            No tracks to add. Scan a folder first, or all library tracks are
            already in this playlist.
          </p>
        ) : (
          <>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by song or artist..."
              className="w-full rounded-md bg-white/5 px-3 py-2 text-sm outline-none
                focus:ring-2 focus:ring-white/40 border border-white/10
                placeholder:text-white/40"
            />
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={selectAll}
                className="text-sm text-white/70 hover:text-white transition-colors"
              >
                {filteredSongs.length > 0 &&
                filteredSongs.every((s) => selected.has(s.song_name))
                  ? "Clear selection"
                  : "Select all"}
              </button>
              <span className="text-xs text-white/50">
                {selected.size} selected
                {searchQuery.trim() && ` · ${filteredSongs.length} shown`}
              </span>
            </div>
            <ul className="max-h-64 overflow-y-auto flex flex-col gap-1 
                rounded-md bg-white/5 border border-white/10 p-2">
              {filteredSongs.length === 0 ? (
                <p className="text-white/50 text-sm py-2">No matches for &quot;{searchQuery.trim()}&quot;</p>
              ) : (
                filteredSongs.map((song) => (
                <label
                  key={song.song_name}
                  className="flex items-center gap-3 py-2 px-2 rounded 
                  hover:bg-white/5 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selected.has(song.song_name)}
                    onChange={() => toggle(song)}
                    className="rounded border-white/30 bg-white/5"
                  />
                  <span className="text-sm truncate flex-1" title={song.song_name}>
                    {song.song_name}
                  </span>
                  {song.artist && (
                    <span className="text-xs text-white/50 truncate max-w-[120px]">
                      {song.artist}
                    </span>
                  )}
                </label>
              )))}
            </ul>
          </>
        )}
        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-md px-3 py-2 text-sm bg-white/5 
            hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleAdd}
            disabled={availableSongs.length === 0 || selected.size === 0}
            className="rounded-md px-3 py-2 text-sm bg-white/10 
            hover:bg-white/20 font-medium transition-colors disabled:opacity-50 
            disabled:pointer-events-none"
          >
            Add selected
          </button>
        </div>
      </div>
    </CustomModal>
  );
}
