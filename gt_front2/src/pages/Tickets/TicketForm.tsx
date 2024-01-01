import { useState, useEffect, useCallback } from 'react';
import {
    Button,
    FormGroup,
    FormControlLabel,
    Checkbox,
    TextField,
} from '@mui/material';
import { format } from 'date-fns';
import { MobileDatePicker } from '@mui/x-date-pickers';
import { CreateTicketRequest, ITicket, TicketAPI } from '../../apis/TicketAPI';
import { UserRelationAPI } from '../../apis/UserRelationAPI';

const TicketForm = (props: {userRelationId: number, setAvailableTickets: any}) => {
    const {userRelationId, setAvailableTickets} = props;
    const [giftDate, setGiftDate] = useState<Date>(new Date());
    const [description, setDescription] = useState('');
    const [isSpecial, setIsSpecial] = useState(false);
    const [isSpecialTicketAvailable, setIsSpecialTicketAvailable] = useState(false);
    const [isDraft, setIsDraft] = useState(false);

    const createTicket = async () => {
        const data: CreateTicketRequest = {
            gift_date: format(giftDate, 'yyyy-MM-dd'),
            description,
            is_special: isSpecial,
            user_relation_id: userRelationId,
        }
        if (isDraft) data.status = 'draft';
        const ticket = (await TicketAPI.create(data)).data.ticket;
        setAvailableTickets((prev: ITicket[]) => {
            return [ticket, ...prev].sort((a, b) => a.gift_date < b.gift_date ? 1 : -1)
        });
        setGiftDate(new Date());
        setDescription('');
        setIsSpecial(false);
        setIsDraft(false);
    }

    const checkSpecialTicketAvailability = useCallback(async (date: Date) => {
        const { data: available } = await UserRelationAPI.checkSpecialTicketAvailability({userRelationId, year: date.getFullYear(), month: date.getMonth() + 1});
        setIsSpecialTicketAvailable(available);
        if (!available) setIsSpecial(false);
    }, [userRelationId])

    const onChangeDate = (date: Date | null) => {
        if (date) {
            checkSpecialTicketAvailability(date);
            setGiftDate(date);
        }
    }

    // MYMEMO: runs twice on render
    useEffect(() => {
        checkSpecialTicketAvailability(new Date());
    }, [checkSpecialTicketAvailability]);

    return (
        <FormGroup sx={{mt:3}}>
            <MobileDatePicker label="あげる日" value={giftDate} onChange={onChangeDate} showDaysOutsideCurrentMonth closeOnSelect sx={{mb: 1}} />
            <TextField value={description} onChange={event => setDescription(event.target.value)} label="内容" multiline minRows={5}/>
            <FormControlLabel disabled={!isSpecialTicketAvailable} label="特別チケットにする" control={<Checkbox checked={isSpecial} onChange={event => setIsSpecial(event.target.checked)} />} />
            <FormControlLabel label="下書きにする" control={<Checkbox checked={isDraft} onChange={event => setIsDraft(event.target.checked)} />} />
            <Button variant={isDraft ? "outlined" : "contained"} onClick={createTicket} sx={isDraft ? {color: 'primary.dark'} : {}}>{isDraft ? '下書き保存' : 'チケット付与'}</Button>
        </FormGroup>
    );
}

export default TicketForm;