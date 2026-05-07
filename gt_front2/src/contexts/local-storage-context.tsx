import { createContext, Dispatch, ReactNode, SetStateAction, useState } from 'react';
import { CreateDiaryDraft, CreateTicketDraft } from '../hooks/useLocalStorage';

interface LocalStorageContextType {
    createTicketDraft?: CreateTicketDraft;
    setCreateTicketDraft: Dispatch<SetStateAction<CreateTicketDraft | undefined>>;
    createDiaryDraft?: CreateDiaryDraft;
    setCreateDiaryDraft: Dispatch<SetStateAction<CreateDiaryDraft | undefined>>;
}

export const LocalStorageContext = createContext<LocalStorageContextType>({
    setCreateTicketDraft: () => {},
    setCreateDiaryDraft: () => {},
});

export const LocalStorageProvider = ({ children }: { children: ReactNode }) => {
    const [createTicketDraft, setCreateTicketDraft] = useState<CreateTicketDraft>();
    const [createDiaryDraft, setCreateDiaryDraft] = useState<CreateDiaryDraft>();

    return (
        <LocalStorageContext.Provider value={{ createTicketDraft, setCreateTicketDraft, createDiaryDraft, setCreateDiaryDraft }}>
            {children}
        </LocalStorageContext.Provider>
    );
};
