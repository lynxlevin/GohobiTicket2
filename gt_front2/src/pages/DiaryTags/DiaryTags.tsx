import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { AppBar, Box, Button, Dialog, DialogContent, IconButton, List, ListItem, TextField, Toolbar } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DiaryTagAPI } from '../../apis/DiaryTagAPI';
import useDiaryTagContext from '../../hooks/useDiaryTagContext';
import { IDiaryTag } from '../../types/diary';
import useGlobalErrorContext from '../../hooks/useGlobalErrorContext';
import useCurrentUserRelationContext from '../../hooks/useCurrentUserRelationContext';

interface InnerTag extends IDiaryTag {
    isNew?: boolean;
}

const DiaryTags = () => {
    const { diaryTags: tagsMaster, getDiaryTags, bulkUpdateDiaryTags, deleteDiaryTag } = useDiaryTagContext();
    const { handleAPIError } = useGlobalErrorContext();
    const { currentUserRelation } = useCurrentUserRelationContext();
    const navigate = useNavigate();

    const [tags, setTags] = useState<InnerTag[]>(tagsMaster ?? []);
    const [diaryCountForTagToDelete, setDiaryCountForTagToDelete] = useState(0);

    const handleAdd = () => {
        setTags(prev => [...prev, { id: crypto.randomUUID(), text: '', sort_no: prev.length + 1, isNew: true }]);
    };

    const handleDelete = async (tag: InnerTag) => {
        DiaryTagAPI.get(tag.id)
            .then(res => {
                const diaryCount = res.data.diary_count;
                if (diaryCount > 0) {
                    setDiaryCountForTagToDelete(diaryCount);
                    return;
                }
                deleteDiaryTag(tag.id)
                    .then(_ => {
                        setTags(prev => prev.filter(diaryTag => diaryTag.id !== tag.id));
                    })
                    .catch(_ => {});
            })
            .catch(handleAPIError);
    };

    const handleSubmit = () => {
        const payload = tags
            .filter(tag => tag.text.trim() !== '')
            .map(tag => {
                if (tag.isNew) return { id: null, text: tag.text, sort_no: tag.sort_no };
                return tag;
            });
        bulkUpdateDiaryTags({ diary_tags: payload, user_relation_id: currentUserRelation.id })
            .then(diaryTags => {
                setTags(diaryTags);
            })
            .catch(_ => {});
    };

    const handleReset = () => {
        setTags(tagsMaster ?? []);
    };

    useEffect(() => {
        const getTags = async () => {
            const diaryTags = await getDiaryTags(currentUserRelation.id);
            setTags(diaryTags);
        };
        getTags();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUserRelation]);
    return (
        <>
            <AppBar position="fixed" sx={{ bgcolor: 'primary.light' }}>
                <Toolbar>
                    <IconButton
                        onClick={() => {
                            window.scroll({ top: 0 });
                            navigate(`/user_relations/${currentUserRelation.id}/diaries`);
                        }}
                        sx={{ color: 'rgba(0,0,0,0.67)' }}
                    >
                        <ArrowBackIcon />
                    </IconButton>
                </Toolbar>
            </AppBar>
            <main>
                <Box
                    sx={{
                        pt: 8,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
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
                                <IconButton onClick={() => handleDelete(tag)}>
                                    <DeleteIcon />
                                </IconButton>
                            </ListItem>
                        ))}
                        <ListItem>
                            <IconButton sx={{ display: 'block', ml: 'auto' }} onClick={handleAdd}>
                                <AddCircleIcon />
                            </IconButton>
                        </ListItem>
                    </List>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                    <Button variant="contained" onClick={handleSubmit}>
                        保存する
                    </Button>
                    <Button variant="outlined" onClick={handleReset} sx={{ color: 'primary.dark', ml: 1 }}>
                        リセット
                    </Button>
                </Box>
                <Dialog open={diaryCountForTagToDelete > 0} onClose={() => setDiaryCountForTagToDelete(0)}>
                    <DialogContent>このタグは {diaryCountForTagToDelete} つの日記に登録されているため、削除することができません。</DialogContent>
                </Dialog>
            </main>
        </>
    );
};

export default DiaryTags;
