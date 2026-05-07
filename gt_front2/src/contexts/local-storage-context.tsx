import { createContext, Dispatch, ReactNode, SetStateAction, useState } from 'react';
import { CreateDiaryDraft } from '../hooks/useLocalStorage';

interface LocalStorageContextType {
    createDiaryDraft?: CreateDiaryDraft;
    setCreateDiaryDraft: Dispatch<SetStateAction<CreateDiaryDraft | undefined>>;
}

export const LocalStorageContext = createContext<LocalStorageContextType>({
    setCreateDiaryDraft: () => {},
});

export const LocalStorageProvider = ({ children }: { children: ReactNode }) => {
    const [createDiaryDraft, setCreateDiaryDraft] = useState<CreateDiaryDraft>();

    return <LocalStorageContext.Provider value={{ createDiaryDraft, setCreateDiaryDraft }}>{children}</LocalStorageContext.Provider>;
};
