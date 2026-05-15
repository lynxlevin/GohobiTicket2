import { Button, Checkbox, CircularProgress, Dialog, DialogActions, DialogContent, FormControlLabel, FormGroup, Stack, TextField } from '@mui/material';
import { MobileDatePicker } from '@mui/x-date-pickers';
import { format, parse } from 'date-fns';
import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { CreateTicketRequest } from '../../apis/TicketAPI';
import { UserRelationAPI } from '../../apis/UserRelationAPI';
import useTicketContext from '../../hooks/useTicketContext';
import usePagePath from '../../hooks/usePagePath';
import useLocalStorage from '../../hooks/useLocalStorage';

const CreateTicketDialog = ({ onClose }: { onClose: () => void }) => {
    const [giftDate, setGiftDate] = useState<Date>(new Date());
    const [description, setDescription] = useState('');
    const [isSpecial, setIsSpecial] = useState(false);
    const [isSpecialTicketAvailable, setIsSpecialTicketAvailable] = useState(false);
    const [isDraft, setIsDraft] = useState(false);

    const { createTicket } = useTicketContext();
    const { userRelationId } = usePagePath();
    const { createTicketDraft, setCreateTicketDraft, resetCreateTicketDraft } = useLocalStorage();

    const handleSubmit = async () => {
        const data: CreateTicketRequest = {
            gift_date: format(giftDate, 'yyyy-MM-dd'),
            description,
            is_special: isSpecial,
            user_relation_id: userRelationId!,
        };
        if (isDraft) data.status = 'draft';
        createTicket(data);
        resetDraft();
        onClose();
    };

    const resetDraft = () => {
        setGiftDate(new Date());
        setDescription('');
        setIsSpecial(false);
        setIsDraft(false);
        resetCreateTicketDraft();
    };

    const checkSpecialTicketAvailability = useCallback(
        async (date: Date) => {
            const { data: available } = await UserRelationAPI.checkSpecialTicketAvailability({
                userRelationId: userRelationId!,
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
            setCreateTicketDraft({ ...createTicketDraft, giftDate: format(date, 'yyyy-MM-dd') });
        }
    };
    const onChangeDescription = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const value = event.target.value;
        setDescription(value);
        setCreateTicketDraft({ ...createTicketDraft, description: value, giftDate: format(giftDate, 'yyyy-MM-dd') });
    };
    const onChangeIsSpecial = (event: ChangeEvent<HTMLInputElement>) => {
        const checked = event.target.checked;
        setIsSpecial(checked);
    };
    const onChangeIsDraft = (event: ChangeEvent<HTMLInputElement>) => {
        const checked = event.target.checked;
        setIsDraft(checked);
    };

    useEffect(() => {
        checkSpecialTicketAvailability(new Date());
    }, [checkSpecialTicketAvailability]);
    useEffect(() => {
        if (createTicketDraft?.giftDate === undefined) return;
        setGiftDate(parse(createTicketDraft.giftDate, 'yyyy-MM-dd', new Date()));
    }, [createTicketDraft?.giftDate]);
    useEffect(() => {
        if (createTicketDraft?.description === undefined) return;
        setDescription(createTicketDraft.description);
    }, [createTicketDraft?.description]);

    return (
        <>
            {userRelationId === null ? (
                <CircularProgress />
            ) : (
                <Dialog open={true} onClose={onClose} fullWidth>
                    <DialogContent>
                        <Stack direction="row" justifyContent="flex-end" mt={-1} mr={-2}>
                            <Button variant="text" onClick={resetDraft} size="small" color="warning" disabled={createTicketDraft === undefined}>
                                クリア
                            </Button>
                        </Stack>
                        <FormGroup sx={{ mt: 1 }}>
                            <MobileDatePicker
                                label="あげる日"
                                value={giftDate}
                                onChange={onChangeDate}
                                showDaysOutsideCurrentMonth
                                closeOnSelect
                                sx={{ mb: 1 }}
                            />
                            <TextField value={description} onChange={onChangeDescription} label="内容" multiline minRows={5} />
                            <FormControlLabel
                                disabled={!isSpecialTicketAvailable}
                                label="特別チケットにする"
                                control={<Checkbox checked={isSpecial} onChange={onChangeIsSpecial} />}
                                sx={{ mr: 'auto' }}
                            />
                            <FormControlLabel label="下書きにする" control={<Checkbox checked={isDraft} onChange={onChangeIsDraft} />} sx={{ mr: 'auto' }} />
                        </FormGroup>
                    </DialogContent>
                    <DialogActions sx={{ justifyContent: 'center', mt: -2, pb: 2 }}>
                        <Button variant={isDraft ? 'outlined' : 'contained'} onClick={handleSubmit} sx={isDraft ? { color: 'primary.dark' } : {}}>
                            {isDraft ? '下書き保存' : 'チケット付与'}
                        </Button>
                    </DialogActions>
                </Dialog>
            )}
        </>
    );
};

export default CreateTicketDialog;
