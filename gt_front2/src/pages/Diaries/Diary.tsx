import styled from '@emotion/styled';
import EditIcon from '@mui/icons-material/Edit';
import { Badge, Box, Card, CardContent, Chip, Grid, IconButton, Typography } from '@mui/material';
import { format } from 'date-fns';
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { DiaryAPI, IDiary } from '../../apis/DiaryAPI';
import EditDiaryDialog from './EditDiaryDialog';
import MoonPhase from './MoonPhase';
import useOnScreen from '../../hooks/useOnScreen';

interface DiaryProps {
    diary: IDiary;
    setDiaries: React.Dispatch<React.SetStateAction<IDiary[]>>;
    updateStatusToRead: (id: string) => void;
    firstUnreadDiaryRef?: React.MutableRefObject<HTMLDivElement | null>;
}

const Diary = (props: DiaryProps) => {
    const { diary, setDiaries, updateStatusToRead, firstUnreadDiaryRef } = props;

    const [isEditDiaryDialogOpen, setIsEditDiaryDialogOpen] = useState(false);

    const ref = useRef(null);
    const observeVisibility = diary.status !== 'read';
    const { isVisible } = useOnScreen(ref, observeVisibility);
    const [prevStatus, setPrevStatus] = useState<string | null>(null);
    const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

    const date = new Date(diary.date);

    useEffect(() => {
        if (isVisible) {
            setTimer(
                setTimeout(async () => {
                    setPrevStatus(diary.status);
                    await DiaryAPI.markRead(diary.id);
                    updateStatusToRead(diary.id);
                }, 3000),
            );
        }
        if (!isVisible && timer !== null) {
            clearTimeout(timer);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isVisible]);

    const getStatusBadge = useMemo(() => {
        let text;
        const status = prevStatus ? prevStatus : diary.status;
        switch (status) {
            case 'unread':
                text = 'NEW!!';
                break;
            case 'edited':
                text = 'EDITED!!';
                break;
        }
        return <Badge className='badge' color='primary' sx={prevStatus ? { opacity: 0.45, transition: '0.5s', zIndex: 100 } : {}} badgeContent={text} />;
    }, [prevStatus, diary.status]);

    return (
        <StyledGrid item xs={12} sm={6} md={4} ref={firstUnreadDiaryRef}>
            {diary.status !== 'read' && getStatusBadge}
            <Card className='card'>
                <CardContent>
                    <MoonPhase date={date} />
                    <div className='relative-div'>
                        <Typography className='diary-date'>{format(date, 'yyyy-MM-dd E')}</Typography>
                        <IconButton className='edit-button' onClick={() => setIsEditDiaryDialogOpen(true)}>
                            <EditIcon />
                        </IconButton>
                    </div>
                    <Box className='tags-div'>
                        {diary.tags.map(tag => (
                            <Chip key={tag.id} label={tag.text} />
                        ))}
                    </Box>
                    <Typography className='diary-description'>{diary.entry}</Typography>
                    <span ref={ref} />
                </CardContent>
            </Card>
            {isEditDiaryDialogOpen && (
                <EditDiaryDialog
                    onClose={() => {
                        setIsEditDiaryDialogOpen(false);
                    }}
                    diary={diary}
                    setDiaries={setDiaries}
                />
            )}
        </StyledGrid>
    );
};

const StyledGrid = styled(Grid)`
    .badge {
        display: block;
        margin-right: 28px;
    }
    .card {
        height: 100%;
        display: flex;
        flex-direction: column;
        position: relative;
    }

    .relative-div {
        position: relative;
    }

    .diary-date {
        padding-top: 8px;
        padding-bottom: 16px;
    }

    .edit-button {
        position: absolute;
        top: -8px;
        right: -7px;
    }

    .tags-div {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        margin-bottom: 16px;
    }

    .diary-description {
        text-align: start;
        white-space: pre-wrap;
    }
`;

export default memo(Diary);
