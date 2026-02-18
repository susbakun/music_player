import { ScaleLoader } from 'react-spinners'

export const Loader = () => {
    return (
        <div className="flex w-full h-full items-center
        justify-center -translate-x-6">
            <ScaleLoader color="white" />
        </div>
    )
}
