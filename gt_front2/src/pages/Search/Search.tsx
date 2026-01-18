import { AppBar, Box, Container, Grid, IconButton, Input, InputAdornment, Toolbar } from '@mui/material';
import { useEffect, useState } from 'react';
import useUserRelationContext from '../../hooks/useUserRelationContext';
import useDiaryTagContext from '../../hooks/useDiaryTagContext';
import usePagePath from '../../hooks/usePagePath';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import SearchBottomNav from '../../components/SearchBottomNav';
import { NavItem } from '../../components/BaseBottomNav';
import { ITicket } from '../../contexts/ticket-context';
import { IDiary } from '../../contexts/diary-context';
import Ticket from '../Tickets/Ticket';
import Diary from '../Diaries/Diary';

const Search = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { userRelationId } = usePagePath();
    const { getUserRelations, userRelations } = useUserRelationContext();
    const { diaryTags, getDiaryTags } = useDiaryTagContext();

    const [pageQuery, setPageQuery] = useState<NavItem>();
    const [searchText, setSearchText] = useState('');
    const [givingTickets, setGivingTickets] = useState<ITicket[]>();
    const [receivingTickets, setReceivingTickets] = useState<ITicket[]>();
    const [diaries, setDiaries] = useState<IDiary[]>();

    const currentRelation = userRelations?.find(relation => Number(relation.id) === userRelationId);

    const getContent = () => {
        switch (pageQuery) {
            case 'giving_tickets':
                return givingTickets?.map(ticket => {
                    return <Ticket key={ticket.id} ticket={ticket} relationKind="Giving" />;
                });
            case 'receiving_tickets':
                return receivingTickets?.map(ticket => {
                    return <Ticket key={ticket.id} ticket={ticket} relationKind="Receiving" />;
                });
            case 'diaries':
                return diaries?.map(diary => {
                    return <Diary key={diary.id} diary={diary} />;
                });
        }
    };

    useEffect(() => {
        if (userRelations === undefined) getUserRelations();
    }, [getUserRelations, userRelations]);

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
                        value={searchText}
                        onChange={event => {
                            setSearchText(event.target.value);
                        }}
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
                <Container sx={{ pt: 2, pb: 4 }} maxWidth="md">
                    <Grid container spacing={4}>
                        {getContent()}
                    </Grid>
                </Container>
            </main>
        </>
    );
};

export default Search;
