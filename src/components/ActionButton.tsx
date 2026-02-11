import { View } from "@/shared/types"

type ActionButtonProps = {
    text: string,
    currentView: View,
    view: View,
    handleViewChange: (view: View) => void
}

export const ActionButton = ({
    text, 
    currentView, 
    view,
    handleViewChange
}: ActionButtonProps) => {
    const isActive = currentView === view

  return (
    <button 
        onClick={() => handleViewChange(view)}
        className={`${isActive && "bg-white/5"}
        w-full text-start rounded-md px-2 py-1`}>
        {text}
    </button>
  )
}
