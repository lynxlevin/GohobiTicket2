import { useCallback, useContext } from 'react';
import { BulkUpdateDiaryTagRequest, DiaryTagAPI } from '../apis/DiaryTagAPI';
import { DiaryTagContext } from '../contexts/diary-tag-context';

const useDiaryTagContext = () => {
    const diaryTagContext = useContext(DiaryTagContext);

    const diaryTags = diaryTagContext.diaryTags;

    const getDiaryTags = async (userRelationId: number) => {
        const diaryTags = (await DiaryTagAPI.list(userRelationId)).data.diary_tags;
        diaryTagContext.setDiaryTags(diaryTags);
        return diaryTags;
    };

    const bulkUpdateDiaryTags = async (data: BulkUpdateDiaryTagRequest) => {
        const diaryTags = (await DiaryTagAPI.bulkUpdate(data)).data.diary_tags;
        diaryTagContext.setDiaryTags(diaryTags);
        return diaryTags;
    };

    const deleteDiaryTag = async (diaryTagId: string) => {
        await DiaryTagAPI.delete(diaryTagId);
        diaryTagContext.setDiaryTags(prev => prev!.filter(diaryTag => diaryTag.id !== diaryTagId));
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
