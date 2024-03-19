import RedeemIcon from '@mui/icons-material/Redeem';
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface DiariesBottomNavProps {
    userRelationId: number;
}

const DiariesBottomNav = (props: DiariesBottomNavProps) => {
    const { userRelationId } = props;

    const navigate = useNavigate();

    return (
        <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1100 }} elevation={3}>
            <BottomNavigation showLabels>
                <BottomNavigationAction
                    label='チケットへ'
                    icon={<RedeemIcon />}
                    onClick={() => {
                        window.scroll({ top: 0 });
                        navigate(`/tickets?user_relation_id=${userRelationId}`);
                    }}
                />
            </BottomNavigation>
        </Paper>
    );
};
export default DiariesBottomNav;
