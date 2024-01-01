import { useState } from 'react';
import {
    Button,
    FormGroup,
    FormControlLabel,
    Checkbox,
    TextField,
} from '@mui/material';
import { format } from 'date-fns';
import { MobileDatePicker } from '@mui/x-date-pickers';
import { ITicket, TicketAPI } from '../../apis/TicketAPI';

const TicketForm = (props: {userRelationId: number, setAvailableTickets: any}) => {
    const {userRelationId, setAvailableTickets} = props;
    const [giftDate, setGiftDate] = useState<Date>(new Date());
    const [description, setDescription] = useState('');

    const createTicket = async () => {
        const ticket = (await TicketAPI.post({gift_date: format(giftDate, 'yyyy-MM-dd'), description, user_relation_id: userRelationId})).data.ticket;
        setAvailableTickets((prev: ITicket[]) => {
            return [ticket, ...prev].sort((a, b) => a.gift_date < b.gift_date ? 1 : -1)
        });
        setGiftDate(new Date());
        setDescription('');
    }

    return (
        <FormGroup sx={{mt:3}}>
            <MobileDatePicker label="あげる日" value={giftDate} onChange={(date: Date | null) => setGiftDate(date!)} closeOnSelect showDaysOutsideCurrentMonth onMonthChange={date => console.log('month', date)} onYearChange={date => console.log('year', date)} sx={{mb: 1}} />
            <TextField value={description} onChange={event => setDescription(event.target.value)} label="内容" multiline minRows={5}/>
            <FormControlLabel label="特別チケットにする" control={<Checkbox />} />
            <Button variant="contained" onClick={createTicket}>チケット付与</Button>
            <Button variant="outlined" sx={{color: 'primary.dark', mt: 2}}>下書き保存</Button>
        </FormGroup>
    );
}

export default TicketForm;