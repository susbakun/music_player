import { Song } from "@/components/Song";
import { SearchFilterBar } from "@/components/SearchFilterBar";
import { useAppContentStore } from "@/store/useAppContentStore";
import { useFilterSongs } from "@/hooks/useFilterSongs";

export function TracksPage() {
  const songs = useAppContentStore((s) => s.songs);
  const togglePlay = useAppContentStore((s) => s.togglePlay);
  const getPlayPauseButton = useAppContentStore((s) => s.getPlayPauseButton);

  const {filteredSongs, format, setFormat, searchQuery, setSearchQuery} = 
    useFilterSongs(songs)

  return (
    <div className="flex-1 px-4 py-8 overflow-y-auto overflow-x-clip 
      h-[80%] flex flex-col gap-6">
      <h2 className="text-2xl font-bold">Tracks</h2>
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
            />
          ))}
        </ul>
      )}
    </div>
  );
}
