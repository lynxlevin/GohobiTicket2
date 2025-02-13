import { Box, Button, Chip, FormControl, FormGroup, InputLabel, MenuItem, Select, SelectChangeEvent, TextField } from '@mui/material';
import { MobileDatePicker } from '@mui/x-date-pickers';
import { format } from 'date-fns';
import React, { useContext, useState } from 'react';
import { DiaryAPI, IDiary } from '../../apis/DiaryAPI';
import { DiaryTagContext, IDiaryTag } from '../../contexts/diary-tag-context';

interface DiaryFormProps {
    userRelationId: number;
    setDiaries: React.Dispatch<React.SetStateAction<IDiary[]>>;
}

const DiaryForm = (props: DiaryFormProps) => {
    const { userRelationId, setDiaries } = props;

    const diaryTagContext = useContext(DiaryTagContext);

    const [date, setDate] = useState<Date>(new Date());
    const [tags, setTags] = useState<IDiaryTag[]>([]);
    const [entry, setEntry] = useState('');

    const handleSubmit = async () => {
        const data = {
            entry,
            date: format(date, 'yyyy-MM-dd'),
            tag_ids: tags.map(tag => tag.id),
            user_relation_id: userRelationId,
        };

        DiaryAPI.create(data).then(({ data: diary }) => {
            setDate(new Date());
            setEntry('');
            setTags([]);
            setDiaries(prev => {
                return [diary, ...prev];
            });
        });
    };

    const onChangeDate = (newDate: Date | null) => {
        if (newDate) {
            setDate(newDate);
        }
    };

    return (
        <>
            <FormGroup sx={{ mt: 3 }}>
                <MobileDatePicker label='日付' value={date} onChange={onChangeDate} showDaysOutsideCurrentMonth closeOnSelect sx={{ mb: 1 }} />
                {diaryTagContext.diaryTags !== null && (
                    <FormControl sx={{ width: '100%', mb: 1 }}>
                        <InputLabel id='tags-select-label'>タグ</InputLabel>
                        <Select
                            labelId='tags-select-label'
                            label='tags'
                            multiple
                            value={tags.map(tag => tag.text)}
                            onChange={(event: SelectChangeEvent<string[]>) => {
                                const {
                                    target: { value },
                                } = event;
                                const tagTexts = typeof value === 'string' ? value.split(',') : value;
                                setTags(cur =>
                                    tagTexts.map((tagText: string) => {
                                        const exists = cur.find(c => c.text === tagText);
                                        if (exists) return exists;
                                        return diaryTagContext.diaryTags!.find(tag => tag.text === tagText)!;
                                    }),
                                );
                            }}
                            renderValue={selected => (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {selected.map(value => (
                                        <Chip key={value} label={value} />
                                    ))}
                                </Box>
                            )}
                        >
                            {diaryTagContext.diaryTags.map(tag => (
                                <MenuItem key={tag.id} value={tag.text}>
                                    {tag.text}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                )}
                <TextField value={entry} onChange={event => setEntry(event.target.value)} label='内容' multiline minRows={5} />
            </FormGroup>
            <Button variant='contained' onClick={handleSubmit} sx={{ mt: 2, mb: 2 }}>
                保存する
            </Button>
        </>
    );
};

export default DiaryForm;
