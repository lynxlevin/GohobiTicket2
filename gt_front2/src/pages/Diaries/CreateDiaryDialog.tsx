import {
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    FormControl,
    FormGroup,
    InputLabel,
    MenuItem,
    Select,
    SelectChangeEvent,
    TextField,
} from '@mui/material';
import { MobileDatePicker } from '@mui/x-date-pickers';
import { format, parse } from 'date-fns';
import { ChangeEvent, useEffect, useState } from 'react';
import useDiaryContext from '../../hooks/useDiaryContext';
import useDiaryTagContext from '../../hooks/useDiaryTagContext';
import { IDiaryTag } from '../../types/diary';
import useLocalStorage from '../../hooks/useLocalStorage';

interface CreateDiaryDialogProps {
    userRelationId: number;
    onClose: () => void;
}

const CreateDiaryDialog = ({ userRelationId, onClose }: CreateDiaryDialogProps) => {
    const { createDiary } = useDiaryContext();
    const { diaryTags } = useDiaryTagContext();
    const { createDiaryDraft, setCreateDiaryDraft, resetCreateDiaryDraft } = useLocalStorage();

    const [date, setDate] = useState<Date>(new Date());
    const [tags, setTags] = useState<IDiaryTag[]>([]);
    const [entry, setEntry] = useState('');

    const handleSubmit = async () => {
        createDiary({
            entry,
            date: format(date, 'yyyy-MM-dd'),
            tag_ids: tags.map(tag => tag.id),
            user_relation_id: userRelationId,
        });
        resetDraft();
        onClose();
    };

    const resetDraft = () => {
        setDate(new Date());
        setTags([]);
        setEntry('');
        resetCreateDiaryDraft();
    };

    const onChangeDate = (newDate: Date | null) => {
        if (newDate) {
            setDate(newDate);
            setCreateDiaryDraft({ ...createDiaryDraft, date: format(newDate, 'yyyy-MM-dd') });
        }
    };
    const onChangeTags = (event: SelectChangeEvent<string[]>) => {
        const {
            target: { value },
        } = event;
        const tagTexts = typeof value === 'string' ? value.split(',') : value;
        const toBe = tagTexts.map((tagText: string) => {
            return diaryTags!.find(tag => tag.text === tagText)!;
        });
        setTags(toBe);
        setCreateDiaryDraft({ ...createDiaryDraft, tagIds: toBe.map(tag => tag.id), date: format(date, 'yyyy-MM-dd') });
    };
    const onChangeEntry = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const value = event.target.value;
        setEntry(value);
        setCreateDiaryDraft({ ...createDiaryDraft, entry: value, date: format(date, 'yyyy-MM-dd') });
    };

    useEffect(() => {
        if (createDiaryDraft?.date === undefined) return;
        setDate(parse(createDiaryDraft.date, 'yyyy-MM-dd', new Date()));
    }, [createDiaryDraft?.date]);
    useEffect(() => {
        if (createDiaryDraft?.tagIds === undefined) return;
        if (diaryTags === undefined) return;
        const cachedTags = createDiaryDraft.tagIds.map(id => diaryTags.find(tag => tag.id === id)).filter(tag => tag !== undefined) as IDiaryTag[];
        setTags(cachedTags);
    }, [createDiaryDraft?.tagIds, diaryTags]);
    useEffect(() => {
        if (createDiaryDraft?.entry === undefined) return;
        setEntry(createDiaryDraft.entry);
    }, [createDiaryDraft?.entry]);

    return (
        <Dialog open={true} onClose={onClose} fullWidth>
            <DialogContent>
                <FormGroup sx={{ mt: 3 }}>
                    <MobileDatePicker label="日付" value={date} onChange={onChangeDate} showDaysOutsideCurrentMonth closeOnSelect sx={{ mb: 1 }} />
                    {diaryTags !== undefined && (
                        <FormControl sx={{ width: '100%', mb: 1 }}>
                            <InputLabel id="tags-select-label">タグ</InputLabel>
                            <Select
                                labelId="tags-select-label"
                                label="tags"
                                multiple
                                value={tags.map(tag => tag.text)}
                                onChange={onChangeTags}
                                renderValue={selected => (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {selected.map(value => (
                                            <Chip key={value} label={value} />
                                        ))}
                                    </Box>
                                )}
                            >
                                {diaryTags.map(tag => (
                                    <MenuItem key={tag.id} value={tag.text}>
                                        {tag.text}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )}
                    <TextField value={entry} onChange={onChangeEntry} label="内容" multiline minRows={5} />
                </FormGroup>
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
                <Button variant="contained" onClick={handleSubmit}>
                    保存する
                </Button>
                <Button variant="contained" onClick={resetDraft} color="warning" disabled={createDiaryDraft === undefined}>
                    クリア
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CreateDiaryDialog;
