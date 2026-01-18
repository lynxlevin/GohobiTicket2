import { AppBar, Box, Container, Grid, IconButton, Input, InputAdornment, Toolbar, Typography } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import useUserAPI from '../../hooks/useUserAPI';
import useDiaryContext from '../../hooks/useDiaryContext';
import useUserRelationContext from '../../hooks/useUserRelationContext';
import useDiaryTagContext from '../../hooks/useDiaryTagContext';
import usePagePath from '../../hooks/usePagePath';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import Diary from '../Diaries/Diary';
import SearchBottomNav from '../../components/SearchBottomNav';
import { NavItem } from '../../components/BaseBottomNav';

const Search = () => {
    const firstUnreadDiaryRef = useRef<HTMLDivElement | null>(null);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [pageQuery, setPageQuery] = useState<NavItem>();

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

    useEffect(() => {
        const tab = searchParams.get('tab');
        setPageQuery(tab === null ? undefined : (tab as NavItem));
    }, [searchParams]);

    if (!currentRelation) return <Navigate to="/login" />;
    return (
        <>
            {/* <CommonAppBar handleLogout={handleLogout} currentRelation={currentRelation} /> */}
            <AppBar position="fixed" sx={{ bgcolor: 'primary.light' }}>
                <Toolbar>
                    <IconButton
                        onClick={() => {
                            window.scroll({ top: 0 });
                            navigate(`/user_relations/${userRelationId}/${pageQuery ?? 'receiving_tickets'}`);
                        }}
                        sx={{ color: 'rgba(0,0,0,0.67)' }}
                    >
                        <ArrowBackIcon />
                    </IconButton>
                    <div style={{ flexGrow: 1 }} />
                    <Input
                        type="text"
                        endAdornment={
                            <InputAdornment position="end">
                                <IconButton
                                    onClick={() => {
                                        console.log('hi');
                                    }}
                                >
                                    <SearchIcon />
                                </IconButton>
                            </InputAdornment>
                        }
                    />
                    <div style={{ flexGrow: 1 }} />
                </Toolbar>
            </AppBar>
            <SearchBottomNav selected={pageQuery} setSelected={setPageQuery} />
            <main>
                <Box sx={{ pt: 8 }}>
                    <Container maxWidth="sm"></Container>
                </Box>
                {/* {diaries !== undefined && (
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
                )} */}
            </main>
        </>
    );
};

export default Search;
