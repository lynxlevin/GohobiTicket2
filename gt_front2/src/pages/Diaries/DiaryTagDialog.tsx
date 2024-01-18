import {
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    FormControl,
    FormControlLabel,
    Grid,
    InputLabel,
    List,
    ListItem,
    MenuItem,
    Select,
    SelectChangeEvent,
    TextField,
} from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import { DiaryTagContext, IDiaryTag } from '../../contexts/diary-tag-context';

interface DiaryTagDialogProps {
    onClose: () => void;
}

const DiaryTagDialog = (props: DiaryTagDialogProps) => {
    const { onClose } = props;

    const diaryTagContext = useContext(DiaryTagContext);

    const [tags, setTags] = useState<IDiaryTag[]>(JSON.parse(JSON.stringify(diaryTagContext.diaryTags)));

    const handleSubmit = () => {
        setTags(prev => {
            return [...prev].sort((a, b) => (a.sort_no > b.sort_no ? 1 : -1));
        });
    };

    return (
        <Dialog open={true} onClose={onClose} fullScreen>
            <DialogContent>
                <List>
                    {tags?.map(tag => (
                        <ListItem key={tag.id}>
                            <TextField
                                value={tag.sort_no}
                                onChange={event =>
                                    setTags(prev => {
                                        const newTags = [...prev];
                                        newTags[newTags.findIndex(p => p.id === tag.id)].sort_no = Number(event.target.value);
                                        return newTags;
                                    })
                                }
                                sx={{ maxWidth: 60 }}
                            />
                            <TextField
                                value={tag.text}
                                onChange={event =>
                                    setTags(prev => {
                                        const newTags = [...prev];
                                        newTags[newTags.findIndex(p => p.id === tag.id)].text = event.target.value;
                                        return newTags;
                                    })
                                }
                            />
                        </ListItem>
                    ))}
                </List>
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'center', py: 2 }}>
                <Button variant='contained' onClick={handleSubmit}>
                    保存する
                </Button>
                <Button variant='outlined' onClick={onClose} sx={{ color: 'primary.dark' }}>
                    キャンセル
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default DiaryTagDialog;
