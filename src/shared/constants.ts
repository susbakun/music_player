import { FileFormat } from "./types";
import { audioDir } from "@tauri-apps/api/path"

export const ICON_SIZE = 32

export const FORMAT_OPTIONS: ReadonlyArray<{ value: FileFormat; text: string }> = [
    {value: "all", text: "All formats"},
    {value: "mp3", text: "MP3"},
    {value: "wav", text: "WAV"},
    {value: "flac", text: "FLAC"}
]

export const DEFAULT_PATH = audioDir()

export const playlistRouteRegExp = /\/playlist\/?/