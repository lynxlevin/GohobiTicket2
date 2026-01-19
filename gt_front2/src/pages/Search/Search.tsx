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
import { UserRelationAPI } from '../../apis/UserRelationAPI';

const Search = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
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

    const submit = () => {
        const text = searchText.trim();
        if (text.length === 0) return;
        UserRelationAPI.search({ userRelationId, text }).then(res => {
            const givingTicketsRes = res.data.giving_tickets;
            const receivingTicketsRes = res.data.receiving_tickets;
            const diariesRes = res.data.diaries;
            setGivingTickets(givingTicketsRes);
            setReceivingTickets(receivingTicketsRes);
            setDiaries(diariesRes);
            switch (pageQuery) {
                case 'giving_tickets':
                    if (givingTicketsRes.length === 0) {
                        if (receivingTicketsRes.length > 0) {
                            setSearchParams({ tab: 'receiving_tickets' });
                        } else if (diariesRes.length > 0) {
                            setSearchParams({ tab: 'diaries' });
                        }
                    }
                    break;
                case 'receiving_tickets':
                    if (receivingTicketsRes.length === 0) {
                        if (givingTicketsRes.length > 0) {
                            setSearchParams({ tab: 'giving_tickets' });
                        } else if (diariesRes.length > 0) {
                            setSearchParams({ tab: 'diaries' });
                        }
                    }
                    break;
                case 'diaries':
                    if (diariesRes.length === 0) {
                        if (givingTicketsRes.length > 0) {
                            setSearchParams({ tab: 'giving_tickets' });
                        } else if (receivingTicketsRes.length > 0) {
                            setSearchParams({ tab: 'receiving_tickets' });
                        }
                    }
                    break;
            }
        });
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
                                <IconButton onClick={submit}>
                                    <SearchIcon />
                                </IconButton>
                            </InputAdornment>
                        }
                    />
                    <div style={{ flexGrow: 1 }} />
                </Toolbar>
            </AppBar>
            <SearchBottomNav
                selected={pageQuery}
                setSelected={setPageQuery}
                badges={{ givingTickets: givingTickets?.length, receivingTickets: receivingTickets?.length, diaries: diaries?.length }}
            />
            <main>
                <Box sx={{ pt: 8 }}>
                    <Container maxWidth="sm"></Container>
                </Box>
                <Container sx={{ pt: 2, pb: 8 }} maxWidth="md">
                    <Grid container spacing={4}>
                        {getContent()}
                    </Grid>
                </Container>
            </main>
        </>
    );
};

export default Search;
