import { css } from '@emotion/react';
import styled from '@emotion/styled';
import EditIcon from '@mui/icons-material/Edit';
import { Badge, Button, Card, CardActions, CardContent, Grid, IconButton, Typography } from '@mui/material';
import { format } from 'date-fns';
import { memo, useMemo, useState } from 'react';
import { ITicket } from '../../contexts/ticket-context';
import EditDialog from './EditDialog';
import SpecialStamp from './SpecialStamp';
import UseDetailDialog from './UseDetailDialog';

interface TicketProps {
    ticket: ITicket;
    isGivingRelation: boolean;
}

const Ticket = (props: TicketProps) => {
    const { ticket, isGivingRelation } = props;
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isUseDetailDialogOpen, setIsUseDetailDialogOpen] = useState(false);

    const getStatusBadge = useMemo(() => {
        let text;
        switch (ticket.status) {
            case 'unread':
                text = 'NEW!!';
                break;
            case 'edited':
                text = 'EDITED!!';
                break;
            case 'draft':
                text = 'DRAFT';
                break;
        }
        return <Badge className='badge' color='primary' badgeContent={text} />;
    }, [ticket.status]);

    return (
        <StyledGrid item xs={12} sm={6} md={4} status={ticket.status}>
            {ticket.status !== 'read' && getStatusBadge}
            <Card className='card'>
                <CardContent>
                    <div className='relative-div'>
                        <Typography gutterBottom variant='subtitle1' className='ticket-date'>
                            {format(new Date(ticket.gift_date), 'yyyy-MM-dd E')}
                        </Typography>
                        {/* TODO */}
                        {isGivingRelation && ticket.use_date === null && (
                            <IconButton className='edit-button' onClick={() => setIsEditDialogOpen(true)} size='small'>
                                <EditIcon />
                            </IconButton>
                        )}
                    </div>
                    <Typography className='ticket-description'>{ticket.description}</Typography>
                </CardContent>
                {!isGivingRelation && ticket.use_date === null && (
                    <CardActions className='use-button'>
                        <Button variant='contained'>このチケットを使う</Button>
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
            padding-bottom: 8px;
        }

        .edit-button {
            position: absolute;
            top: -5px;
            right: -4px;
        }

        .ticket-description {
            white-space: pre-wrap;
        }

        .use-button {
            justify-content: center;
            margin-bottom: 8px;
        }
    `;
});

export default memo(Ticket);
