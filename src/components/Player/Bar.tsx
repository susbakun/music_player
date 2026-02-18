import { MouseEvent } from "react"
import { twMerge } from "tailwind-merge"
import { Tooltip } from "../Tooltip"

type BarProps = {
    className: string,
    valueNow: number,
    minValue: number,
    maxValue: number,
    popupPosition: number | null,
    formatted_hovered_value: string | null,
    handleMouseMove: (e: MouseEvent<HTMLDivElement>) => void,
    handleMouseClick: () => void,
    handleMouseLeave: () => void
}

export const Bar = ({
    className,
    valueNow,
    minValue,
    maxValue,
    popupPosition,
    formatted_hovered_value,
    handleMouseMove,
    handleMouseClick,
    handleMouseLeave
}: BarProps) => {
    return (
        <div
            role="slider"
            aria-valuenow={valueNow}
            aria-valuemin={minValue}
            aria-valuemax={maxValue}
            className={twMerge(
            className,
            "h-[6px] bg-white/20 rounded-full",
            "cursor-pointer flex items-center group relative")}
            onMouseMove={handleMouseMove}
            onClick={handleMouseClick}
            onMouseLeave={handleMouseLeave}
        >
            <div
                    style={{ width: `${(valueNow * 100) / maxValue}%` }}
                    className="h-full bg-white/80 rounded-full transition-[width] 
                    duration-75 ease-linear pointer-events-none"
            />
            <div
                className="w-4 h-0 group-hover:h-4 
                rounded-full bg-white transition-all 
                duration-75 ease-linear absolute"
                style={{ 
                    left: `clamp(0px, calc(${(valueNow * 100) / maxValue}% - 8px), calc(100% - 8px))`
                }}
            />
            <Tooltip
                style={{ 
                    left: popupPosition !== null ? `${popupPosition}px` : undefined,
                    transform: popupPosition !== null ? 'translateX(-50%)' : undefined
                }}
                innerContent={formatted_hovered_value}
            />
        </div>
    )
}
