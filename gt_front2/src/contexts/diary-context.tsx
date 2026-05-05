import { createContext, Dispatch, ReactNode, SetStateAction, useState } from 'react';
import { IDiariesForMonth } from '../types/diary';

interface DiaryContextType {
    diariesByMonth: IDiariesForMonth | undefined;
    setDiariesByMonth: Dispatch<SetStateAction<IDiariesForMonth | undefined>>;
}

export const DiaryContext = createContext<DiaryContextType>({
    diariesByMonth: undefined,
    setDiariesByMonth: () => {},
});

export const DiaryProvider = ({ children }: { children: ReactNode }) => {
    const [diariesByMonth, setDiariesByMonth] = useState<IDiariesForMonth>();

    return <DiaryContext.Provider value={{ diariesByMonth, setDiariesByMonth }}>{children}</DiaryContext.Provider>;
};
