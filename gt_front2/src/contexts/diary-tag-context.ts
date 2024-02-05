import { createContext } from 'react';

export interface IDiaryTag {
    id: string;
    text: string;
    sort_no: number;
}

export interface DiaryTagContextType {
    diaryTags: IDiaryTag[] | null;
    setDiaryTags: React.Dispatch<React.SetStateAction<IDiaryTag[] | null>>;
}

export const DiaryTagContext = createContext({
    diaryTags: [],
    setDiaryTags: () => {},
} as unknown as DiaryTagContextType);
