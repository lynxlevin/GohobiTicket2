import { useCallback, useContext, useMemo } from 'react';
import { DiaryContext } from '../contexts/diary-context';
import { CreateDiaryRequest, DiaryAPI, UpdateDiaryRequest } from '../apis/DiaryAPI';
import { IDiariesForMonth, IDiary } from '../types/diary';
import { endOfMonth, format, parse, startOfMonth } from 'date-fns';

const useDiaryContext = () => {
    const diaryContext = useContext(DiaryContext);

    const diariesByMonth = diaryContext.diariesByMonth;

    const clearDiaryCache = useCallback(() => {
        diaryContext.setDiariesByMonth(undefined);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const unreadDiaries = useMemo((): IDiariesForMonth => {
        if (diariesByMonth === undefined) return {};
        const toBe: IDiariesForMonth = {};
        for (const [key, diaries] of Object.entries(diariesByMonth)) {
            toBe[key] = diaries.filter(diary => diary.status !== 'read');
        }
        return toBe;
    }, [diariesByMonth]);

    const getDiariesByMonth = useCallback(
        async (userRelationId: number, yearMonth: string) => {
            const firstOfMonth = startOfMonth(parse(yearMonth, 'yyyyMM', new Date()));
            DiaryAPI.list({ userRelationId, dateGte: firstOfMonth, dateLte: endOfMonth(firstOfMonth) }).then(({ data: diaries }) => {
                diaryContext.setDiariesByMonth(prev => {
                    const toBe = { ...prev };
                    toBe[yearMonth] = diaries;
                    return toBe;
                });
            });
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [diaryContext.setDiariesByMonth],
    );

    const createDiary = useCallback(async (data: CreateDiaryRequest) => {
        DiaryAPI.create(data).then(({ data: diary }) => {
            const yearMonth = format(new Date(diary.date), 'yyyyMM');
            diaryContext.setDiariesByMonth(prev => {
                const toBe = { ...prev };
                if (toBe[yearMonth] === undefined) {
                    toBe[yearMonth] = [diary];
                } else {
                    toBe[yearMonth] = [diary, ...toBe[yearMonth]];
                }
                return toBe;
            });
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const updateDiary = useCallback(async (diary: IDiary, data: UpdateDiaryRequest) => {
        const originalYearMonth = format(new Date(diary.date), 'yyyyMM');
        DiaryAPI.update(diary.id, data).then(({ data: newDiary }) => {
            const yearMonth = format(new Date(newDiary.date), 'yyyyMM');
            diaryContext.setDiariesByMonth(prev => {
                const toBe = { ...prev };
                if (toBe[originalYearMonth] !== undefined) {
                    const originalIndex = toBe[originalYearMonth].findIndex(d => d.id === diary.id);
                    if (originalIndex > -1) toBe[originalYearMonth].splice(originalIndex, 1);
                }
                if (toBe[yearMonth] !== undefined) {
                    toBe[yearMonth] = [newDiary, ...toBe[yearMonth]].sort((a: IDiary, b: IDiary) => {
                        return a.date > b.date ? -1 : 1;
                    });
                }
                return toBe;
            });
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const readDiary = useCallback(async (diary: IDiary) => {
        DiaryAPI.markRead(diary.id).then(() => {
            diaryContext.setDiariesByMonth(prev => {
                const yearMonth = format(new Date(diary.date), 'yyyyMM');
                const toBe = { ...prev };
                const target = toBe[yearMonth].find(d => d.id === diary.id);
                if (target !== undefined) target.status = 'read';
                return toBe;
            });
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        diariesByMonth,
        unreadDiaries,
        getDiariesByMonth,
        createDiary,
        updateDiary,
        readDiary,
        clearDiaryCache,
    };
};

export default useDiaryContext;
