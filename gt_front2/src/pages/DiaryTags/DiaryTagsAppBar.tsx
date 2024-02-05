import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { AppBar, IconButton, Toolbar } from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface DiaryTagsAppBarProps {
    userRelationId: number;
}

const DiaryTagsAppBar = (props: DiaryTagsAppBarProps) => {
    const { userRelationId } = props;

    const navigate = useNavigate();

    return (
        <AppBar position='fixed' sx={{ bgcolor: 'primary.light' }}>
            <Toolbar>
                <IconButton
                    onClick={() => {
                        window.scroll({ top: 0 });
                        navigate(`/diaries?user_relation_id=${userRelationId}`);
                    }}
                    sx={{ color: 'rgba(0,0,0,0.67)' }}
                >
                    <ArrowBackIcon />
                </IconButton>
            </Toolbar>
        </AppBar>
    );
};
export default DiaryTagsAppBar;
