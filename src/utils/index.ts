/** Creates a blob URL from image bytes (JPEG/PNG from lofty or fallback). */
export function iconBytesToBlobUrl(bytes: number[]): string | null {
    if (bytes.length === 0) return null
    const arr = new Uint8Array(bytes)
    const mime =
        arr[0] === 0xff && arr[1] === 0xd8 ? "image/jpeg" :
        arr[0] === 0x89 && arr[1] === 0x50 && arr[2] === 0x4e ? "image/png" :
        "image/png"  // lofty fallback is PNG
    const blob = new Blob([arr], { type: mime })
    return URL.createObjectURL(blob)
}