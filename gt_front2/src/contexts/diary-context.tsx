import { createContext, ReactNode, useState } from 'react';
import { IDiary } from '../types/diary';

interface DiaryContextType {
    diaries: IDiary[] | undefined;
    setDiaries: React.Dispatch<React.SetStateAction<IDiary[] | undefined>>;
}

export const DiaryContext = createContext<DiaryContextType>({
    diaries: undefined,
    setDiaries: () => {},
});

export const DiaryProvider = ({ children }: { children: ReactNode }) => {
    const [diaries, setDiaries] = useState<IDiary[]>();

    return <DiaryContext.Provider value={{ diaries, setDiaries }}>{children}</DiaryContext.Provider>;
};
