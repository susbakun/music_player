import { useAppContentStore } from "@/store/useAppContentStore";
import { debug } from "@tauri-apps/plugin-log";
import { useEffect } from "react";

export function useKeyboardShortcuts() {
    const currentSong = useAppContentStore((s) => s.currentSong) 
    const togglePlay = useAppContentStore((s) => s.togglePlay)
    const muteVolume = useAppContentStore((s) => s.muteVolume)

    useEffect(() => {
        debug("Setting up keyboard shortcuts");

        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore key presses if they occur in an input or textarea
            if (
                e.target instanceof HTMLInputElement ||
                e.target instanceof HTMLTextAreaElement
            ) {
                debug("Ignoring keypress in input/textarea");
                return;
            }

            switch (e.key) {
                case " ":
                    e.preventDefault()
                    if (currentSong) togglePlay(currentSong)
                    break;
                case "m":
                case "M":
                    e.preventDefault()
                    muteVolume()
                    break;
            }
        }

        window.addEventListener("keydown", handleKeyDown)

        return () => {
            debug("Removing keydown event listener");
            window.removeEventListener("keydown", handleKeyDown);
        }
    }, [
        currentSong,
        togglePlay,
        muteVolume
    ])


}