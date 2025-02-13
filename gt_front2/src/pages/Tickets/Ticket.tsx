import { css } from '@emotion/react';
import styled from '@emotion/styled';
import EditIcon from '@mui/icons-material/Edit';
import { Badge, Button, Card, CardActions, CardContent, Grid, IconButton, Typography } from '@mui/material';
import { format } from 'date-fns';
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { ITicket, TicketStatus } from '../../contexts/ticket-context';
import useOnScreen from '../../hooks/useOnScreen';
import useTicketContext from '../../hooks/useTicketContext';
import EditDialog from './EditDialog';
import SpecialStamp from './SpecialStamp';
import UseDetailDialog from './UseDetailDialog';
import UseDialog from './UseDialog';

interface TicketProps {
    ticket: ITicket;
    isGivingRelation: boolean;
    lastAvailableTicketRef?: React.MutableRefObject<HTMLDivElement | null>;
}

const Ticket = (props: TicketProps) => {
    const { ticket, isGivingRelation, lastAvailableTicketRef } = props;
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isUseDialogOpen, setIsUseDialogOpen] = useState(false);
    const [isUseDetailDialogOpen, setIsUseDetailDialogOpen] = useState(false);
    const { readTicket } = useTicketContext();

    const ref = useRef(null);
    const observeVisibility = !isGivingRelation && ticket.status !== 'read';
    const { isVisible } = useOnScreen(ref, observeVisibility);
    const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
    const [prevStatus, setPrevStatus] = useState<TicketStatus | null>(null);

    useEffect(() => {
        if (isVisible) {
            setTimer(
                setTimeout(async () => {
                    setPrevStatus(ticket.status);
                    await readTicket(ticket.id);
                }, 3000),
            );
        }
        if (!isVisible && timer !== null) {
            clearTimeout(timer);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isVisible]);

    const getStatusBadge = useMemo(() => {
        const status = prevStatus ? prevStatus : ticket.status;
        if (status === 'read') return <></>;

        let text;
        if (status === 'unread') {
            text = 'NEW!!';
        } else if (status === 'edited') {
            text = 'EDITED!!';
        } else if (status === 'draft') {
            text = 'DRAFT';
        }
        return <Badge className='badge' color='primary' sx={prevStatus ? { opacity: 0.45, transition: '0.5s', zIndex: 100 } : {}} badgeContent={text} />;
    }, [prevStatus, ticket.status]);

    return (
        <StyledGrid item xs={12} sm={6} md={4} status={ticket.status} ref={lastAvailableTicketRef}>
            {isGivingRelation && ticket.status === 'draft' && getStatusBadge}
            {!isGivingRelation && ticket.status !== 'read' && getStatusBadge}
            <Card className='card'>
                <CardContent>
                    <div className='relative-div'>
                        <Typography className='ticket-date'>{format(new Date(ticket.gift_date), 'yyyy-MM-dd E')}</Typography>
                        {isGivingRelation && ticket.use_date === null && (
                            <IconButton className='edit-button' onClick={() => setIsEditDialogOpen(true)}>
                                <EditIcon />
                            </IconButton>
                        )}
                    </div>
                    <Typography className='ticket-description'>{ticket.description}</Typography>
                </CardContent>
                {!isGivingRelation && ticket.use_date === null && (
                    <CardActions ref={ref} className='use-button'>
                        <Button variant='contained' onClick={() => setIsUseDialogOpen(true)}>
                            このチケットを使う
                        </Button>
                    </CardActions>
                )}
                {ticket.use_date !== null && (
                    <CardActions className='use-button'>
                        <Button variant='outlined' onClick={() => setIsUseDetailDialogOpen(true)}>
                            おねがいの内容を見る
                        </Button>
                    </CardActions>
                )}
                {ticket.is_special && <SpecialStamp randKey={ticket.id} />}
            </Card>
            {isEditDialogOpen && (
                <EditDialog
                    onClose={() => {
                        setIsEditDialogOpen(false);
                    }}
                    ticket={ticket}
                />
            )}
            {isUseDialogOpen && (
                <UseDialog
                    onClose={() => {
                        setIsUseDialogOpen(false);
                    }}
                    ticket={ticket}
                />
            )}
            {isUseDetailDialogOpen && (
                <UseDetailDialog
                    onClose={() => {
                        setIsUseDetailDialogOpen(false);
                    }}
                    ticket={ticket}
                />
            )}
        </StyledGrid>
    );
};

const StyledGrid = styled(Grid)((props: { status: string }) => {
    const draftCardBGC =
        props.status === 'draft'
            ? css`
        background-color: rgb(245, 245, 245);
    `
            : css``;
    return css`
        .badge {
            display: block;
            margin-right: 28px;
        }
        .card {
            height: 100%;
            display: flex;
            flex-direction: column;
            position: relative;
            ${draftCardBGC};
        }

        .relative-div {
            position: relative;
        }

        .ticket-date {
            padding-top: 8px;
            padding-bottom: 16px;
        }

        .edit-button {
            position: absolute;
            top: -8px;
            right: -7px;
        }

        .ticket-description {
            text-align: start;
            white-space: pre-wrap;
        }

        .use-button {
            justify-content: center;
            margin-bottom: 8px;
        }
    `;
});

export default memo(Ticket);
