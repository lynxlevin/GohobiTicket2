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
import { useContext, useState } from 'react';
import { DiaryAPI, IDiary } from '../../apis/DiaryAPI';
import { DiaryTagContext, IDiaryTag } from '../../contexts/diary-tag-context';

interface EditDiaryDialogProps {
    onClose: () => void;
    diary: IDiary;
    setDiaries: React.Dispatch<React.SetStateAction<IDiary[]>>;
}

const EditDiaryDialog = (props: EditDiaryDialogProps) => {
    const { onClose, diary, setDiaries } = props;

    const diaryTagContext = useContext(DiaryTagContext);

    const [date, setDate] = useState<Date>(new Date(diary.date));
    const [tags, setTags] = useState<IDiaryTag[]>(diary.tags);
    const [entry, setEntry] = useState(diary.entry);

    const handleSubmit = async () => {
        const data = {
            entry,
            date: format(date, 'yyyy-MM-dd'),
            tag_ids: tags.map(tag => tag.id),
        };

        DiaryAPI.update(diary.id, data).then(({ data: diary }) => {
            setDiaries(prev => {
                const diaries = [...prev];
                diaries[diaries.findIndex(p => p.id === diary.id)] = diary;
                return diaries;
            });
            onClose();
        });
    };

    const onChangeDate = (newDate: Date | null) => {
        if (newDate) {
            setDate(newDate);
        }
    };

    return (
        <Dialog open={true} onClose={onClose} fullWidth>
            <DialogContent>
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
                <TextField value={entry} onChange={event => setEntry(event.target.value)} label='内容' multiline fullWidth minRows={5} />
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'center', py: 2 }}>
                <Button variant='contained' onClick={handleSubmit}>
                    修正する
                </Button>
                <Button variant='outlined' onClick={onClose} sx={{ color: 'primary.dark' }}>
                    キャンセル
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default EditDiaryDialog;
