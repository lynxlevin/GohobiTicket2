import { createContext, ReactNode, useState } from 'react';
import { IDiaryTag } from '../types/diary';

interface DiaryTagContextType {
    diaryTags: IDiaryTag[] | undefined;
    setDiaryTags: React.Dispatch<React.SetStateAction<IDiaryTag[] | undefined>>;
}

export const DiaryTagContext = createContext<DiaryTagContextType>({
    diaryTags: undefined,
    setDiaryTags: () => {},
});

export const DiaryTagProvider = ({ children }: { children: ReactNode }) => {
    const [diaryTags, setDiaryTags] = useState<IDiaryTag[]>();

    return <DiaryTagContext.Provider value={{ diaryTags, setDiaryTags }}>{children}</DiaryTagContext.Provider>;
};
