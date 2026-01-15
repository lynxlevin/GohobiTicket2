import {
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    SelectChangeEvent,
    TextField,
} from '@mui/material';
import { MobileDatePicker } from '@mui/x-date-pickers';
import { format } from 'date-fns';
import { useState } from 'react';
import { IDiaryTag } from '../../contexts/diary-tag-context';
import { IDiary } from '../../contexts/diary-context';
import useDiaryContext from '../../hooks/useDiaryContext';
import useDiaryTagContext from '../../hooks/useDiaryTagContext';

interface EditDiaryDialogProps {
    onClose: () => void;
    diary: IDiary;
}

const EditDiaryDialog = ({ onClose, diary }: EditDiaryDialogProps) => {
    const { updateDiary } = useDiaryContext();
    const { diaryTags } = useDiaryTagContext();

    const [date, setDate] = useState<Date>(new Date(diary.date));
    const [tags, setTags] = useState<IDiaryTag[]>(diary.tags);
    const [entry, setEntry] = useState(diary.entry);

    const handleSubmit = async () => {
        updateDiary(diary.id, {
            entry,
            date: format(date, 'yyyy-MM-dd'),
            tag_ids: tags.map(tag => tag.id),
        });
        onClose();
    };

    const onChangeDate = (newDate: Date | null) => {
        if (newDate) {
            setDate(newDate);
        }
    };

    return (
        <Dialog open={true} onClose={onClose} fullWidth>
            <DialogContent>
                <MobileDatePicker label="日付" value={date} onChange={onChangeDate} showDaysOutsideCurrentMonth closeOnSelect sx={{ mb: 1 }} />
                {diaryTags !== undefined && (
                    <FormControl sx={{ width: '100%', mb: 1 }}>
                        <InputLabel id="tags-select-label">タグ</InputLabel>
                        <Select
                            labelId="tags-select-label"
                            label="tags"
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
                                        return diaryTags.find(tag => tag.text === tagText)!;
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
                            {diaryTags.map(tag => (
                                <MenuItem key={tag.id} value={tag.text}>
                                    {tag.text}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                )}
                <TextField value={entry} onChange={event => setEntry(event.target.value)} label="内容" multiline fullWidth minRows={5} />
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'center', py: 2 }}>
                <Button variant="contained" onClick={handleSubmit}>
                    修正する
                </Button>
                <Button variant="outlined" onClick={onClose} sx={{ color: 'primary.dark' }}>
                    キャンセル
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default EditDiaryDialog;
