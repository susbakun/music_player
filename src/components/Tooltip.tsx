import { HTMLProps } from "react"

type TooltipProps = {
    innerContent: string | null
} & HTMLProps<HTMLDivElement>

export const Tooltip = ({innerContent, ...props}: TooltipProps) => {
    if (innerContent !== null) return (
        <div
            className="bg-black/50 rounded-xl -translate-x-8
            text-white absolute bottom-4 px-4 py-2 z-20" 
            {...props}>
            {innerContent}
        </div>
    )
}
