import styled from '@emotion/styled';
import AddIcon from '@mui/icons-material/Add';
import FiberNewOutlinedIcon from '@mui/icons-material/FiberNewOutlined';
import KeyboardDoubleArrowUpIcon from '@mui/icons-material/KeyboardDoubleArrowUp';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { CircularProgress, Container, Grid, IconButton, MenuItem, Select, Stack, Typography } from '@mui/material';
import { useEffect, useMemo, useRef, useState } from 'react';
import BottomNav from '../../components/BottomNav';
import Diary from './Diary';
import useDiaryContext from '../../hooks/useDiaryContext';
import useDiaryTagContext from '../../hooks/useDiaryTagContext';
import CommonAppBar from '../../components/CommonAppBar';
import { addMonths, format, parse, subMonths } from 'date-fns';
import CreateDiaryDialog from './CreateDiaryDialog';
import useYearMonthContext from '../../hooks/useYearMonthContext';
import useCurrentUserRelationContext from '../../hooks/useCurrentUserRelationContext';

const Diaries = () => {
    const firstUnreadDiaryRef = useRef<HTMLDivElement | null>(null);
    const [openedDialog, setOpenedDialog] = useState<'WriteDiary'>();

    const { currentUserRelation } = useCurrentUserRelationContext();
    const { unreadDiaries, diariesByMonth, getDiariesByMonth } = useDiaryContext();
    const { diaryTags, getDiaryTags } = useDiaryTagContext();
    const { yearMonth, setYearMonth, thisMonth, getTabYearMonths, getFirstDate } = useYearMonthContext();

    const tabYearMonth = useMemo(() => {
        return getTabYearMonths('Diary', currentUserRelation);
    }, [currentUserRelation, getTabYearMonths]);
    const firstDate = useMemo(() => {
        return getFirstDate('Diary', currentUserRelation);
    }, [currentUserRelation, getFirstDate]);

    const getDialog = () => {
        switch (openedDialog) {
            case 'WriteDiary':
                return <CreateDiaryDialog userRelationId={currentUserRelation.id} onClose={() => setOpenedDialog(undefined)} />;
        }
    };

    useEffect(() => {
        if (!tabYearMonth.includes(yearMonth)) setYearMonth(format(firstDate, 'yyyyMM'));
    }, [firstDate, setYearMonth, tabYearMonth, yearMonth]);
    useEffect(() => {
        if (diariesByMonth === undefined || diariesByMonth[yearMonth] === undefined) getDiariesByMonth(currentUserRelation.id, yearMonth);
    }, [currentUserRelation, diariesByMonth, getDiariesByMonth, yearMonth]);
    useEffect(() => {
        if (diaryTags === undefined) getDiaryTags(currentUserRelation.id);
    }, [currentUserRelation, diaryTags, getDiaryTags]);

    return (
        <>
            <CommonAppBar currentRelation={currentUserRelation} />
            <BottomNav />
            <main>
                <Container maxWidth="sm" sx={{ py: 8 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" height="40px">
                        <Typography variant="body1" color="text.primary" textAlign="left" fontWeight="bold">
                            {currentUserRelation.related_username}との日記
                        </Typography>
                        <Stack direction="row">
                            <IconButton onClick={() => setOpenedDialog('WriteDiary')}>
                                <AddIcon />
                            </IconButton>
                        </Stack>
                    </Stack>
                    <Stack direction="row" justifyContent="center" alignItems="center">
                        <IconButton
                            onClick={() => {
                                yearMonth !== format(firstDate, 'yyyyMM') &&
                                    setYearMonth(format(subMonths(parse(yearMonth, 'yyyyMM', new Date()), 1), 'yyyyMM'));
                            }}
                            disabled={yearMonth === format(firstDate, 'yyyyMM')}
                            sx={{ marginRight: 5 }}
                        >
                            <KeyboardArrowLeftIcon />
                        </IconButton>
                        <Select value={yearMonth} onChange={event => setYearMonth(event.target.value)} variant="standard">
                            {tabYearMonth.map(yearMonth => {
                                return <MenuItem key={yearMonth} value={yearMonth}>{`${yearMonth.slice(0, 4)}/${yearMonth.slice(4, 6)}`}</MenuItem>;
                            })}
                        </Select>
                        <IconButton
                            onClick={() => {
                                yearMonth !== thisMonth && setYearMonth(format(addMonths(parse(yearMonth, 'yyyyMM', new Date()), 1), 'yyyyMM'));
                            }}
                            disabled={yearMonth === thisMonth}
                            sx={{ marginLeft: 5 }}
                        >
                            <KeyboardArrowRightIcon />
                        </IconButton>
                    </Stack>
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
