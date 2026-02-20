import { SongType } from '@/shared/types';
import { useAppContentStore } from '@/store/useAppContentStore';
import { MdOutlineRepeat, MdOutlineRepeatOn, MdOutlineShuffle, MdOutlineShuffleOn, MdOutlineSkipNext, MdOutlineSkipPrevious } from 'react-icons/md'
import { CustomActionButton } from '../Custom/CustomActionButton';

type ButtonsRowProps = {
    currentSong: SongType
}

export const ButtonsRow = ({currentSong}: ButtonsRowProps) => {
    const playNext = useAppContentStore((s) => s.playNext);
    const playPrev = useAppContentStore((s) => s.playPrev);
    const getPlayPauseButton = useAppContentStore((s) => s.getPlayPauseButton);
    const toggleRepeat = useAppContentStore((s) => s.toggleRepeat)
    const toggleShuffle = useAppContentStore((s) => s.toggleShuffle)

    const shuffle = useAppContentStore((s) => s.shuffle)
    const repeat = useAppContentStore((s) => s.repeat)


    return (
        <div className="flex justify-center items-center gap-2">
            <CustomActionButton
                title='shuffle'
                handleClick={toggleShuffle}
            >
                {shuffle ? 
                <MdOutlineShuffleOn className="w-4 h-4" /> : 
                <MdOutlineShuffle className="w-4 h-4" />
                }
            </CustomActionButton>
            <CustomActionButton
                handleClick={playPrev}
            >
                <MdOutlineSkipPrevious className="w-5 h-5" />
            </CustomActionButton>
            {getPlayPauseButton(currentSong, true)}
            <CustomActionButton
                handleClick={playNext}
            >
                <MdOutlineSkipNext className="w-5 h-5" />
            </CustomActionButton>
            <CustomActionButton
                title='repeat'
                handleClick={toggleRepeat}
            >
                {repeat ? 
                <MdOutlineRepeatOn className="w-4 h-4" /> : 
                <MdOutlineRepeat className="w-4 h-4" />
                }
            </CustomActionButton>
        </div>
    )
}
