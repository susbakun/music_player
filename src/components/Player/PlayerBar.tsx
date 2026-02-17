import { getFormattedPosition } from "@/utils";
import { Tooltip } from "../Tooltip";
import { MouseEvent, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

type PlayerBarProps = {
    progress: number,
    duration: number,
}

export const PlayerBar = ({
    progress,
    duration,
}: PlayerBarProps) => {
    const [popupPosition, setPopupPosition] = useState<null | number>(null)
    const [hoveredProgress, setHoveredProgress] = useState<null | number>(null)


    const formatted_duration = getFormattedPosition(duration)
    const formatted_progress = getFormattedPosition(progress)
    const formatted_hovered_progress = getFormattedPosition(hoveredProgress)

    const handleMouseOnBar = (e: MouseEvent<HTMLDivElement>) => {
        if (!duration) return
        const bar = e.currentTarget
        const rect = bar.getBoundingClientRect()
        const position = Math.max(0, (e.clientX - rect.left))

        setPopupPosition(position)

        let fraction = position / rect.width;
        fraction = Math.round(fraction * duration);
        setHoveredProgress(fraction)
    }


    const handleProgressBarClick = () => {
        if (!hoveredProgress) return

        invoke("change_song_position", { position: hoveredProgress })
    }

    return (
        <div className="w-full px-2 flex gap-2 items-center">
            <p className="text-sm text-white/80">{formatted_progress}</p>
            <div
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={duration}
                className="h-[6px] w-full bg-white/20 rounded-full 
                cursor-pointer flex items-center group my-anchor-element relative"
                onMouseMove={handleMouseOnBar}
                onClick={handleProgressBarClick}
                onMouseLeave={() => setHoveredProgress(null)}
            >
                <div
                style={{ width: duration ? `${(progress * 100) / duration}%` : "0%" }}
                className="h-full bg-white/80 rounded-full transition-[width] 
                duration-75 ease-linear pointer-events-none -mr-1"
                />
                <div
                    className="w-4 h-0 group-hover:h-4 
                    rounded-full bg-white transition-all 
                    duration-75 ease-linear"
                />
                <Tooltip
                style={{ left: `${popupPosition}px` }}
                innerContent={formatted_hovered_progress}
                />
            </div>
            <p className="text-sm text-white/80">{formatted_duration}</p>
        </div>
    );
};
