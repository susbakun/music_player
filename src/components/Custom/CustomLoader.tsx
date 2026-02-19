import { ScaleLoader } from 'react-spinners'

export const CustomLoader = () => {
    return (
        <div className="flex w-full h-full items-center
        justify-center -translate-x-6">
            <ScaleLoader width={10} color="white" />
        </div>
    )
}
