import styled from '@emotion/styled';
import FiberNewOutlinedIcon from '@mui/icons-material/FiberNewOutlined';
import { Box, Container, Grid, IconButton, Typography } from '@mui/material';
import { useEffect, useRef } from 'react';
import BottomNav from '../../components/BottomNav';
import useUserAPI from '../../hooks/useUserAPI';
import Diary from './Diary';
import DiaryForm from './DiaryForm';
import useDiaryContext from '../../hooks/useDiaryContext';
import useUserRelationContext from '../../hooks/useUserRelationContext';
import useDiaryTagContext from '../../hooks/useDiaryTagContext';
import usePagePath from '../../hooks/usePagePath';
import CommonAppBar from '../../components/CommonAppBar';
import { Navigate } from 'react-router-dom';

const Diaries = () => {
    const firstUnreadDiaryRef = useRef<HTMLDivElement | null>(null);

    const { getUserRelations, userRelations } = useUserRelationContext();
    const { diaries, unreadDiaries, getDiaries } = useDiaryContext();
    const { diaryTags, getDiaryTags } = useDiaryTagContext();
    const { handleLogout } = useUserAPI();
    const { userRelationId } = usePagePath();

    const currentRelation = userRelations?.find(relation => Number(relation.id) === userRelationId);

    useEffect(() => {
        if (userRelations === undefined) getUserRelations();
    }, [getUserRelations, userRelations]);

    useEffect(() => {
        if (isNaN(userRelationId) || !currentRelation) return;
        if (diaries === undefined) getDiaries(userRelationId);
    }, [currentRelation, diaries, getDiaries, userRelationId]);

    useEffect(() => {
        if (isNaN(userRelationId) || !currentRelation) return;
        if (diaryTags === undefined) getDiaryTags(userRelationId);
    }, [currentRelation, diaryTags, getDiaryTags, userRelationId]);

    if (!currentRelation) return <Navigate to="/login" />;
    return (
        <>
            <CommonAppBar handleLogout={handleLogout} currentRelation={currentRelation} />
            <BottomNav />
            <main>
                <Box sx={{ pt: 8 }}>
                    <Container maxWidth="sm">
                        <Typography variant="h4" align="center" color="text.primary" sx={{ mt: 3, fontWeight: 600 }} gutterBottom>
                            {currentRelation.related_username}との日記
                        </Typography>
                        <DiaryForm userRelationId={userRelationId} />
                    </Container>
                </Box>
                {diaries !== undefined && (
                    <Container sx={{ pt: 2, pb: 4 }} maxWidth="md">
                        <Grid container spacing={4}>
                            {diaries.map(diary => {
                                if (unreadDiaries.length > 0 && diary.id === unreadDiaries[0].id) {
                                    return <Diary key={diary.id} diary={diary} firstUnreadDiaryRef={firstUnreadDiaryRef} />;
                                }
                                return <Diary key={diary.id} diary={diary} />;
                            })}
                        </Grid>
                    </Container>
                )}
                {unreadDiaries.length > 0 && (
                    <ToUnreadDiaryButton
                        onClick={() => {
                            const current = firstUnreadDiaryRef.current!;
                            const moveTo = current.offsetTop + current.offsetHeight - window.innerHeight + 100;
                            window.scrollTo({ top: moveTo, behavior: 'smooth' });
                        }}
                    >
                        <FiberNewOutlinedIcon sx={{ fontSize: '40px' }} color="primary" />
                    </ToUnreadDiaryButton>
                )}
                <MiniLogo onClick={() => window.scroll({ top: 0, behavior: 'smooth' })} src="/apple-touch-icon.png" alt="mini-ticket" />
            </main>
        </>
    );
};

const ToUnreadDiaryButton = styled(IconButton)`
    background: white !important;
    border-radius: 999px;
    position: fixed;
    left: 16px;
    bottom: 66px;
    border: 2px solid #ddd;
    width: 40px;
    height: 40px;
    z-index: 100;
`;

const MiniLogo = styled.img`
    height: 50px;
    position: fixed;
    bottom: 64px;
    right: 13px;
    box-shadow:
        2px 2px 7px rgba(18, 47, 61, 0.5),
        -5px -5px 15px rgba(248, 253, 255, 0.9),
        inset 5px 5px 15px transparent,
        inset -5px -5px 15px transparent;
    z-index: 100;
    border-radius: 50%;

    &:hover {
        opacity: 0.95;
        filter: brightness(105%);
    }
`;

export default Diaries;
