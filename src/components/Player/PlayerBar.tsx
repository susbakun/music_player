import { getFormattedPosition } from "@/utils";
import { MouseEvent, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Bar } from "./Bar";

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
            <Bar
                valueNow={progress}
                minValue={0}
                maxValue={duration}
                className="w-full"
                handleMouseMove={handleMouseOnBar}
                handleMouseClick={handleProgressBarClick}
                handleMouseLeave={() => setHoveredProgress(null)}
                popupPosition={popupPosition}
                formatted_hovered_value={formatted_hovered_progress}
                />
            <p className="text-sm text-white/80">{formatted_duration}</p>
        </div>
    );
};
