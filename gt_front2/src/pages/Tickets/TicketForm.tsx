import { Button, Checkbox, FormControlLabel, FormGroup, TextField } from '@mui/material';
import { MobileDatePicker } from '@mui/x-date-pickers';
import { format } from 'date-fns';
import { useCallback, useEffect, useState } from 'react';
import { CreateTicketRequest } from '../../apis/TicketAPI';
import { UserRelationAPI } from '../../apis/UserRelationAPI';
import useTicketContext from '../../hooks/useTicketContext';

interface TicketFormProps {
    userRelationId: number;
}

const TicketForm = (props: TicketFormProps) => {
    const { userRelationId } = props;

    const [giftDate, setGiftDate] = useState<Date>(new Date());
    const [description, setDescription] = useState('');
    const [isSpecial, setIsSpecial] = useState(false);
    const [isSpecialTicketAvailable, setIsSpecialTicketAvailable] = useState(false);
    const [isDraft, setIsDraft] = useState(false);
    const { createTicket } = useTicketContext();

    const handleSubmit = async () => {
        const data: CreateTicketRequest = {
            gift_date: format(giftDate, 'yyyy-MM-dd'),
            description,
            is_special: isSpecial,
            user_relation_id: userRelationId,
        };
        if (isDraft) data.status = 'draft';

        createTicket(data);

        setGiftDate(new Date());
        setDescription('');
        setIsSpecial(false);
        setIsDraft(false);
    };

    const checkSpecialTicketAvailability = useCallback(
        async (date: Date) => {
            const { data: available } = await UserRelationAPI.checkSpecialTicketAvailability({
                userRelationId,
                year: date.getFullYear(),
                month: date.getMonth() + 1,
            });
            setIsSpecialTicketAvailable(available);
            if (!available) setIsSpecial(false);
        },
        [userRelationId],
    );

    const onChangeDate = (date: Date | null) => {
        if (date) {
            checkSpecialTicketAvailability(date);
            setGiftDate(date);
        }
    };

    // MYMEMO: runs twice on render
    useEffect(() => {
        checkSpecialTicketAvailability(new Date());
    }, [checkSpecialTicketAvailability]);

    return (
        <>
            <FormGroup sx={{ mt: 3 }}>
                <MobileDatePicker label='あげる日' value={giftDate} onChange={onChangeDate} showDaysOutsideCurrentMonth closeOnSelect sx={{ mb: 1 }} />
                <TextField value={description} onChange={event => setDescription(event.target.value)} label='内容' multiline minRows={5} />
                <FormControlLabel
                    disabled={!isSpecialTicketAvailable}
                    label='特別チケットにする'
                    control={<Checkbox checked={isSpecial} onChange={event => setIsSpecial(event.target.checked)} />}
                />
                <FormControlLabel label='下書きにする' control={<Checkbox checked={isDraft} onChange={event => setIsDraft(event.target.checked)} />} />
            </FormGroup>
            <Button
                variant={isDraft ? 'outlined' : 'contained'}
                onClick={handleSubmit}
                sx={isDraft ? { color: 'primary.dark', mt: 2, mb: 2 } : { mt: 2, mb: 2 }}
            >
                {isDraft ? '下書き保存' : 'チケット付与'}
            </Button>
        </>
    );
};

export default TicketForm;
