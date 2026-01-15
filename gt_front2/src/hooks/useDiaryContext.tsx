import { useCallback, useContext, useMemo } from 'react';
import { DiaryContext, IDiary } from '../contexts/diary-context';
import { CreateDiaryRequest, DiaryAPI, UpdateDiaryRequest } from '../apis/DiaryAPI';

const useDiaryContext = () => {
    const diaryContext = useContext(DiaryContext);

    const diaries = diaryContext.diaries;

    const unreadDiaries = useMemo(() => {
        if (diaries === undefined || diaries.length === 0) return [];
        return diaries
            .filter(diary => diary.status !== 'read')
            .sort((a: IDiary, b: IDiary) => {
                return a.date > b.date ? -1 : 1;
            });
    }, [diaries]);

    const getDiaries = useCallback(
        async (userRelationId: number) => {
            DiaryAPI.list(userRelationId).then(({ data: diaries }) => {
                diaryContext.setDiaries(diaries);
            });
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [diaryContext.setDiaries],
    );

    const createDiary = useCallback(async (data: CreateDiaryRequest) => {
        DiaryAPI.create(data).then(({data: diary}) => {
            diaryContext.setDiaries(prev => {
                if (prev === undefined) return [diary];
                return [diary, ...prev];
            })
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const updateDiary = useCallback(async (diaryId: string, data: UpdateDiaryRequest) => {
        DiaryAPI.update(diaryId, data).then(({data: diary}) => {
            diaryContext.setDiaries(prev => {
                const diaries = [...prev!];
                diaries[diaries.findIndex(p => p.id === diary.id)] = diary;
                return diaries;
            })
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const readDiary = useCallback(async (diaryId: string) => {
        DiaryAPI.markRead(diaryId).then(() => {
            diaryContext.setDiaries(prev => {
                const diaries = [...prev!];
                diaries[diaries.findIndex(p => p.id === diaryId)].status = 'read';
                return diaries;
            })
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const clearDiaryCache = useCallback(() => {
        diaryContext.setDiaries(undefined);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        diaries,
        unreadDiaries,
        getDiaries,
        createDiary,
        updateDiary,
        readDiary,
        clearDiaryCache,
    };
};

export default useDiaryContext;
