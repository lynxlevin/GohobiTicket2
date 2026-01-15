import { createContext, ReactNode, useState } from 'react';
import { IDiaryTag } from './diary-tag-context';

export type DiaryStatus = "unread" | "edited" | "read"

export interface IDiary {
    id: string;
    entry: string;
    date: string;
    tags: IDiaryTag[];
    status: DiaryStatus;
}

export interface DiaryContextType {
    diaries: IDiary[] | undefined;
    setDiaries: React.Dispatch<React.SetStateAction<IDiary[] | undefined>>;
}

export const DiaryContext = createContext<DiaryContextType>({
    diaries: undefined,
    setDiaries: () => {},
});

export const DiaryProvider = ({ children }: { children: ReactNode }) => {
    const [diaries, setDiaries] = useState<IDiary[]>();

    return (
        <DiaryContext.Provider value={{ diaries, setDiaries }}>
            {children}
        </DiaryContext.Provider>
    );
};
