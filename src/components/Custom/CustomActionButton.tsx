import {  MouseEvent, ReactNode } from "react"

type CustomActionButtonProps = {
    children: ReactNode
    title?: string
    handleClick: (e: MouseEvent<HTMLButtonElement>) => void
}

export const CustomActionButton = ({children, handleClick, title}: CustomActionButtonProps) => {
  return (
    <button
        title={title}
        className="text-white/70 hover:text-white transition-colors p-1"
        onClick={handleClick}
    >
        {children}
    </button>
  )
}
