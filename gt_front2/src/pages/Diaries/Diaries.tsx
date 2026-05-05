import styled from '@emotion/styled';
import AddIcon from '@mui/icons-material/Add';
import FiberNewOutlinedIcon from '@mui/icons-material/FiberNewOutlined';
import KeyboardDoubleArrowUpIcon from '@mui/icons-material/KeyboardDoubleArrowUp';
import { CircularProgress, Container, Dialog, DialogContent, Grid, IconButton, Stack, Tab, Tabs, Typography } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import BottomNav from '../../components/BottomNav';
import useUserAPI from '../../hooks/useUserAPI';
import Diary from './Diary';
import DiaryForm from './DiaryForm';
import useDiaryContext from '../../hooks/useDiaryContext';
import useUserRelationContext from '../../hooks/useUserRelationContext';
import useDiaryTagContext from '../../hooks/useDiaryTagContext';
import usePagePath from '../../hooks/usePagePath';
import CommonAppBar from '../../components/CommonAppBar';
import { format, parse, subMonths } from 'date-fns';

const Diaries = () => {
    const firstUnreadDiaryRef = useRef<HTMLDivElement | null>(null);
    const [openedDialog, setOpenedDialog] = useState<'WriteDiary'>();
    const thisMonth = format(new Date(), 'yyyyMM');
    const [yearMonth, setYearMonth] = useState(thisMonth);

    const { getUserRelations, userRelations } = useUserRelationContext();
    const { unreadDiaries, diariesByMonth, getDiariesByMonth } = useDiaryContext();
    const { diaryTags, getDiaryTags } = useDiaryTagContext();
    const { handleLogout } = useUserAPI();
    const { userRelationId } = usePagePath();

    const currentRelation = userRelations?.find(relation => Number(relation.id) === userRelationId);

    const getTabYearMonths = () => {
        const today = new Date();
        const startDay = currentRelation !== undefined ? new Date(currentRelation.first_diary_date) : today;
        const yearMonths = [format(today, 'yyyyMM')];
        while (yearMonths[yearMonths.length - 1] !== format(startDay, 'yyyyMM')) {
            const lastMonth = subMonths(parse(yearMonths[yearMonths.length - 1], 'yyyyMM', new Date()), 1);
            yearMonths.push(format(lastMonth, 'yyyyMM'));
        }
        return yearMonths;
    };

    const getDialog = () => {
        switch (openedDialog) {
            case 'WriteDiary':
                if (userRelationId === null) return;
                return (
                    <Dialog open={true} onClose={() => setOpenedDialog(undefined)} fullWidth>
                        <DialogContent>
                            <DiaryForm userRelationId={userRelationId} onClose={() => setOpenedDialog(undefined)} />
                        </DialogContent>
                    </Dialog>
                );
        }
    };

    useEffect(() => {
        if (userRelations === undefined) getUserRelations();
    }, [getUserRelations, userRelations]);

    useEffect(() => {
        if (userRelationId === null || !currentRelation) return;
        if (diariesByMonth === undefined || diariesByMonth[yearMonth] === undefined) getDiariesByMonth(userRelationId, yearMonth);
    }, [currentRelation, diariesByMonth, getDiariesByMonth, yearMonth, userRelationId]);

    useEffect(() => {
        if (userRelationId === null || !currentRelation) return;
        if (diaryTags === undefined) getDiaryTags(userRelationId);
    }, [currentRelation, diaryTags, getDiaryTags, userRelationId]);

    return (
        <>
            <CommonAppBar handleLogout={handleLogout} currentRelation={currentRelation} />
            <BottomNav />
            {currentRelation === undefined || userRelationId === null ? (
                <CircularProgress />
            ) : (
                <main>
                    <Container maxWidth="sm" sx={{ py: 8 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" height="40px">
                            <Typography variant="body1" color="text.primary" textAlign="left" fontWeight="bold">
                                {currentRelation.related_username}との日記
                            </Typography>
                            <Stack direction="row">
                                <IconButton onClick={() => setOpenedDialog('WriteDiary')}>
                                    <AddIcon />
                                </IconButton>
                            </Stack>
                        </Stack>
                        <Tabs
                            value={yearMonth}
                            onChange={(_, newValue: string | null) => {
                                if (newValue !== null) setYearMonth(newValue);
                            }}
                            variant="scrollable"
                            scrollButtons
                            allowScrollButtonsMobile
                        >
                            {getTabYearMonths().map(yearMonth => {
                                return <Tab key={yearMonth} value={yearMonth} label={`${yearMonth.slice(0, 4)}/${yearMonth.slice(4, 6)}`} />;
                            })}
                        </Tabs>
                        {diariesByMonth === undefined || diariesByMonth[yearMonth] === undefined ? (
                            <CircularProgress />
                        ) : (
                            <Grid container spacing={2}>
                                {diariesByMonth[yearMonth].map(diary => {
                                    if (unreadDiaries[yearMonth].length > 0 && diary.id === unreadDiaries[yearMonth][0].id) {
                                        return <Diary key={diary.id} diary={diary} firstUnreadDiaryRef={firstUnreadDiaryRef} />;
                                    }
                                    return <Diary key={diary.id} diary={diary} />;
                                })}
                            </Grid>
                        )}
                        {unreadDiaries[yearMonth]?.length > 0 && (
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
                        <ToTopButton onClick={() => window.scroll({ top: 0, behavior: 'smooth' })}>
                            <KeyboardDoubleArrowUpIcon />
                        </ToTopButton>
                        {openedDialog && getDialog()}
                    </Container>
                </main>
            )}
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
const ToTopButton = styled(IconButton)`
    font-size: 30px;
    background: white !important;
    border-radius: 999px;
    position: fixed;
    right: 16px;
    bottom: 66px;
    border: 2px solid #ddd;
    width: 40px;
    height: 40px;
    z-index: 100;
`;

export default Diaries;
