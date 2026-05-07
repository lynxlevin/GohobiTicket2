import { useContext, useEffect } from 'react';
import { LocalStorageContext } from '../contexts/local-storage-context';

export interface CreateDiaryDraft {
    date?: string;
    tagIds?: string[];
    entry?: string;
}

const LOCAL_STORAGE_KEYS = {
    createDiaryDraft: 'createDiaryDraft',
};

const useLocalStorage = () => {
    const ctx = useContext(LocalStorageContext);

    const setCreateDiaryDraft = (draft: CreateDiaryDraft) => {
        localStorage.setItem(LOCAL_STORAGE_KEYS.createDiaryDraft, JSON.stringify(draft));
        ctx.setCreateDiaryDraft(draft);
    };

    const resetCreateDiaryDraft = () => {
        localStorage.removeItem(LOCAL_STORAGE_KEYS.createDiaryDraft);
        ctx.setCreateDiaryDraft(undefined);
    };

    useEffect(() => {
        if (ctx.createDiaryDraft === undefined) {
            const value = localStorage.getItem(LOCAL_STORAGE_KEYS.createDiaryDraft);
            ctx.setCreateDiaryDraft(value === '' || value === null ? undefined : (JSON.parse(value) as CreateDiaryDraft));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        createDiaryDraft: ctx.createDiaryDraft,
        setCreateDiaryDraft,
        resetCreateDiaryDraft,
    };
};

export default useLocalStorage;
