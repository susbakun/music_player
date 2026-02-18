import { HTMLProps } from "react"

type TooltipProps = {
    innerContent: string | null
} & HTMLProps<HTMLDivElement>

export const Tooltip = ({innerContent, style, ...props}: TooltipProps) => {
    if (innerContent !== null) return (
        <div
            className="bg-black/50 rounded-xl text-white 
            absolute bottom-full mb-2 px-4 py-2 z-20 whitespace-nowrap" 
            style={{
                ...style,
                transform: style?.transform || 'translateX(-50%)'
            }}
            {...props}>
            {innerContent}
        </div>
    )
}
