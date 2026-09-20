import { useCallback, useContext } from 'react';
import { BulkUpdateDiaryTagRequest, DiaryTagAPI } from '../apis/DiaryTagAPI';
import { DiaryTagContext } from '../contexts/diary-tag-context';
import useGlobalErrorContext from './useGlobalErrorContext';

const useDiaryTagContext = () => {
    const diaryTagContext = useContext(DiaryTagContext);
    const { handleAPIErrorThrowing } = useGlobalErrorContext();

    const diaryTags = diaryTagContext.diaryTags;

    const getDiaryTags = async (userRelationId: number) => {
        const diaryTags = await DiaryTagAPI.list(userRelationId)
            .then(res => {
                const diaryTags = res.data.diary_tags;
                diaryTagContext.setDiaryTags(diaryTags);
                return diaryTags;
            })
            .catch(handleAPIErrorThrowing);
        return diaryTags;
    };

    const bulkUpdateDiaryTags = async (data: BulkUpdateDiaryTagRequest) => {
        const diaryTags = await DiaryTagAPI.bulkUpdate(data)
            .then(res => {
                const diaryTags = res.data.diary_tags;
                diaryTagContext.setDiaryTags(diaryTags);
                return diaryTags;
            })
            .catch(handleAPIErrorThrowing);
        return diaryTags;
    };

    const deleteDiaryTag = async (diaryTagId: string) => {
        await DiaryTagAPI.delete(diaryTagId)
            .then(_ => {
                diaryTagContext.setDiaryTags(prev => prev!.filter(diaryTag => diaryTag.id !== diaryTagId));
            })
            .catch(handleAPIErrorThrowing);
    };

    const clearDiaryTagCache = useCallback(() => {
        diaryTagContext.setDiaryTags(undefined);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        diaryTags,
        getDiaryTags,
        bulkUpdateDiaryTags,
        deleteDiaryTag,
        clearDiaryTagCache,
    };
};

export default useDiaryTagContext;
