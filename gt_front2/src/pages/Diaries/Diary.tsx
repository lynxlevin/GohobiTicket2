import styled from '@emotion/styled';
import EditIcon from '@mui/icons-material/Edit';
import { Box, Card, CardContent, Chip, Grid, IconButton, Typography } from '@mui/material';
import { format } from 'date-fns';
import { memo, useState } from 'react';
import { IDiary } from '../../apis/DiaryAPI';
import EditDiaryDialog from './EditDiaryDialog';
import MoonPhase from './MoonPhase';

interface DiaryProps {
    diary: IDiary;
    setDiaries: React.Dispatch<React.SetStateAction<IDiary[]>>;
}

const Diary = (props: DiaryProps) => {
    const { diary, setDiaries } = props;

    const [isEditDiaryDialogOpen, setIsEditDiaryDialogOpen] = useState(false);

    const date = new Date(diary.date);

    return (
        <StyledGrid item xs={12} sm={6} md={4}>
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
