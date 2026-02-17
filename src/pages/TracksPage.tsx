import { Song } from "@/components/Song";
import { useAppContentStore } from "@/store/useAppContentStore";

export function TracksPage() {
  const songs = useAppContentStore((s) => s.songs);
  const togglePlay = useAppContentStore((s) => s.togglePlay);
  const getPlayPauseButton = useAppContentStore((s) => s.getPlayPauseButton);

  return (
    <div className="flex-1 px-4 py-8 overflow-y-auto overflow-x-clip 
      h-[80%] flex flex-col gap-6">
      <h2 className="text-2xl font-bold">Songs</h2>
      {songs.length === 0 ? (
        <p className="text-white/60 text-sm">Your queue is empty. Add songs from Tracks.</p>
      ) : 
        <ul className="flex flex-col gap-2">
          {songs.map((song, index) => (
            <Song
              song={song}
              number={index + 1}
              togglePlay={togglePlay}
              getPlayPauseButton={getPlayPauseButton}
            />
          ))}
        </ul>
      }
    </div>
  );
}
