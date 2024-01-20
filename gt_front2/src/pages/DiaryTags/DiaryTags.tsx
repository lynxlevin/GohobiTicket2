import {
    Box,
    Button,
    Chip,
    Container,
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
import { Navigate, useSearchParams } from 'react-router-dom';
import { DiaryTagAPI } from '../../apis/DiaryTagAPI';
import { DiaryTagContext, IDiaryTag } from '../../contexts/diary-tag-context';
import { UserContext } from '../../contexts/user-context';
import useUserAPI from '../../hooks/useUserAPI';
import DiaryTagsAppBar from './DiaryTagsAppBar';

const DiaryTags = () => {
    const userContext = useContext(UserContext);
    const diaryTagContext = useContext(DiaryTagContext);

    const [tags, setTags] = useState<IDiaryTag[]>(JSON.parse(JSON.stringify(diaryTagContext.diaryTags)));
    useUserAPI();

    const [searchParams] = useSearchParams();
    const userRelationId = Number(searchParams.get('user_relation_id'));

    const handleSubmit = () => {
        setTags(prev => {
            return [...prev].sort((a, b) => (a.sort_no > b.sort_no ? 1 : -1));
        });
    };

    const handleReset = () => {
        setTags(JSON.parse(JSON.stringify(diaryTagContext.diaryTags)));
    };

    useEffect(() => {
        if (userContext.isLoggedIn !== true && userRelationId < 1) return;
        // MYMEMO: diaryTagContext にuserRelationIdを持たせて検証する必要あり
        if (diaryTagContext.diaryTags !== null) return;
        DiaryTagAPI.list(userRelationId).then(({ data: { diary_tags } }) => {
            diaryTagContext.setDiaryTags(diary_tags);
            setTags(JSON.parse(JSON.stringify(diary_tags)));
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userContext.isLoggedIn, userRelationId]);

    if (userContext.isLoggedIn === false) {
        return <Navigate to='/login' />;
    }
    return (
        <>
            <DiaryTagsAppBar userRelationId={userRelationId} />
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
                            </ListItem>
                        ))}
                    </List>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                    <Button variant='contained' onClick={handleSubmit}>
                        保存する
                    </Button>
                    <Button variant='outlined' onClick={handleReset} sx={{ color: 'primary.dark', ml: 1 }}>
                        リセット
                    </Button>
                </Box>
            </main>
        </>
    );
};

export default DiaryTags;
