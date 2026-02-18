import { FileFormat, SongType } from "@/shared/types";
import { useEffect, useMemo, useState } from "react";

export function useFilterSongs(songs: SongType[]) {
    const [searchQuery, setSearchQuery] = useState("")
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")
    const [format, setFormat] = useState<FileFormat>("all")

    // Debounce search query - wait 300ms after user stops typing
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery)
        }, 300)

        return () => clearTimeout(timer)
    }, [searchQuery])

    const filteredSongs = useMemo(() => {
        const query = debouncedSearchQuery.trim().toLowerCase()

        return songs.filter((song) => {
        const matchesSearch =
            query.length === 0 ||
            song.song_name.toLowerCase().includes(query)

        const extension = song.song_path.split(".").pop()?.toLowerCase()
        const matchesFormat =
            format === "all" || extension === format

        return matchesSearch && matchesFormat
        });
    }, [songs, debouncedSearchQuery, format])

    return {
        format, 
        setFormat, 
        searchQuery, 
        setSearchQuery, 
        filteredSongs
    }
}