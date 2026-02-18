import { useAppContentStore } from '@/store/useAppContentStore'
import { MouseEvent, useState } from 'react'
import { MdVolumeUp } from 'react-icons/md'
import { Tooltip } from '../Tooltip'
import { invoke } from '@tauri-apps/api/core'
import { Bar } from './Bar'

export const VolumeBar = () => {
    const [popupPosition, setPopupPosition] = useState<null | number>(null)
    const [hoveredVolume, setHoveredVolume] = useState<null | number>(null)

    const volume = useAppContentStore((s) => s.master_volume)
    const setVolume = useAppContentStore((s) => s.setVolume)

    const formatted_hovered_volume = hoveredVolume ? `${hoveredVolume}%` : null

    const handleMouseOnBar = (e: MouseEvent<HTMLDivElement>) => {
        const bar = e.currentTarget
        const rect = bar.getBoundingClientRect()
        const position = Math.max(0, (e.clientX - rect.left))

        setPopupPosition(position)

        let fraction = position / rect.width;
        fraction = Math.ceil(fraction * 100);
        setHoveredVolume(fraction)
    }

    const handleBarClick = () => {
        if (!hoveredVolume) return

        const fraction_volume = hoveredVolume / 100

        setVolume(fraction_volume)

        invoke("change_master_volume", { volume: fraction_volume })
    }

    return (
        <div
        className="flex items-center gap-2 min-w-[180px] max-w-[30%]
        justify-end shrink-0"
        >
            <button className="text-white/70 hover:text-white transition-colors">
                <MdVolumeUp className="w-5 h-5" />
            </button>
            <Bar
                minValue={0}
                valueNow={volume}
                maxValue={1.0}
                className='w-24'
                handleMouseMove={handleMouseOnBar}
                handleMouseClick={handleBarClick}
                handleMouseLeave={() => setHoveredVolume(null)}
                popupPosition={popupPosition}
                formatted_hovered_value={formatted_hovered_volume}
                />
        </div>
    )
}
