import { useContext, useEffect } from 'react';
import { LocalStorageContext } from '../contexts/local-storage-context';

export interface CreateTicketDraft {
    giftDate?: string;
    description?: string;
}

export interface CreateDiaryDraft {
    date?: string;
    tagIds?: string[];
    entry?: string;
}

const LOCAL_STORAGE_KEYS = {
    createTicketDraft: 'createTicketDraft',
    createDiaryDraft: 'createDiaryDraft',
};

const useLocalStorage = () => {
    const ctx = useContext(LocalStorageContext);

    const setCreateTicketDraft = (draft: CreateTicketDraft) => {
        localStorage.setItem(LOCAL_STORAGE_KEYS.createTicketDraft, JSON.stringify(draft));
        ctx.setCreateTicketDraft(draft);
    };
    const resetCreateTicketDraft = () => {
        localStorage.removeItem(LOCAL_STORAGE_KEYS.createTicketDraft);
        ctx.setCreateTicketDraft(undefined);
    };

    const setCreateDiaryDraft = (draft: CreateDiaryDraft) => {
        localStorage.setItem(LOCAL_STORAGE_KEYS.createDiaryDraft, JSON.stringify(draft));
        ctx.setCreateDiaryDraft(draft);
    };
    const resetCreateDiaryDraft = () => {
        localStorage.removeItem(LOCAL_STORAGE_KEYS.createDiaryDraft);
        ctx.setCreateDiaryDraft(undefined);
    };

    useEffect(() => {
        if (ctx.createTicketDraft === undefined) {
            const value = localStorage.getItem(LOCAL_STORAGE_KEYS.createTicketDraft);
            ctx.setCreateTicketDraft(value === '' || value === null ? undefined : (JSON.parse(value) as CreateTicketDraft));
        }
        if (ctx.createDiaryDraft === undefined) {
            const value = localStorage.getItem(LOCAL_STORAGE_KEYS.createDiaryDraft);
            ctx.setCreateDiaryDraft(value === '' || value === null ? undefined : (JSON.parse(value) as CreateDiaryDraft));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        createTicketDraft: ctx.createTicketDraft,
        setCreateTicketDraft,
        resetCreateTicketDraft,
        createDiaryDraft: ctx.createDiaryDraft,
        setCreateDiaryDraft,
        resetCreateDiaryDraft,
    };
};

export default useLocalStorage;
