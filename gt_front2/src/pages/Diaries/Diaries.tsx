import styled from '@emotion/styled';
import { Box, Container, Grid, Typography } from '@mui/material';
import { useCallback, useContext, useEffect, useState } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { DiaryAPI, IDiary } from '../../apis/DiaryAPI';
import { DiaryTagAPI, IDiaryTag } from '../../apis/DiaryTagAPI';
import { UserContext } from '../../contexts/user-context';
import { UserRelationContext } from '../../contexts/user-relation-context';
import useUserAPI from '../../hooks/useUserAPI';
import DiariesAppBar from './DiariesAppBar';
import Diary from './Diary';
import DiaryForm from './DiaryForm';

// Copied template from https://github.com/mui/material-ui/tree/v5.15.2/docs/data/material/getting-started/templates/album
const Diaries = () => {
    const userContext = useContext(UserContext);
    const userRelationContext = useContext(UserRelationContext);

    const [diaries, setDiaries] = useState<IDiary[]>([]);
    const [tagMaster, setTagMaster] = useState<IDiaryTag[] | null>(null);
    const { handleLogout } = useUserAPI();

    const [searchParams] = useSearchParams();
    const userRelationId = Number(searchParams.get('user_relation_id'));
    const currentRelation = userRelationContext.userRelations.find(relation => Number(relation.id) === userRelationId)!;

    const getDiaries = useCallback(() => {
        DiaryAPI.list(userRelationId).then(({ data: { diaries } }) => {
            setDiaries(diaries);
        });
    }, [userRelationId]);

    useEffect(() => {
        if (userContext.isLoggedIn !== true && userRelationId < 1) return;
        getDiaries();
        if (tagMaster !== null) return;
        DiaryTagAPI.list(userRelationId).then(({ data: { diary_tags } }) => {
            setTagMaster(diary_tags);
        });
    }, [getDiaries, tagMaster, userContext.isLoggedIn, userRelationId]);

    if (userContext.isLoggedIn === false) {
        return <Navigate to='/login' />;
    }
    if (!currentRelation) return <></>;
    return (
        <>
            <DiariesAppBar handleLogout={handleLogout} userRelationId={userRelationId} refreshDiaries={getDiaries} />
            <main>
                <Box sx={{ pt: 8 }}>
                    <Container maxWidth='sm'>
                        <Typography variant='h4' align='center' color='text.primary' sx={{ mt: 3, fontWeight: 600 }} gutterBottom>
                            {currentRelation.related_username}との日記
                        </Typography>
                        <DiaryForm userRelationId={userRelationId} setDiaries={setDiaries} tagMaster={tagMaster} />
                    </Container>
                </Box>
                <Container sx={{ pt: 2, pb: 4 }} maxWidth='md'>
                    <Grid container spacing={4}>
                        {diaries.map(diary => (
                            <Diary key={diary.id} diary={diary} tagMaster={tagMaster} setDiaries={setDiaries} />
                        ))}
                    </Grid>
                </Container>
                <MiniTicket onClick={() => window.scroll({ top: 0, behavior: 'smooth' })} src='/apple-touch-icon.png' alt='mini-ticket' />
            </main>
        </>
    );
};

const MiniTicket = styled.img`
    height: 50px;
    position: fixed;
    bottom: 13px;
    right: 13px;
    box-shadow: 2px 2px 7px rgba(18, 47, 61, 0.5), -5px -5px 15px rgba(248, 253, 255, 0.9), inset 5px 5px 15px transparent, inset -5px -5px 15px transparent;
    z-index: 100;
    border-radius: 50%;

    &:hover {
        opacity: 0.95;
        filter: brightness(105%);
    }
`;

export default Diaries;
