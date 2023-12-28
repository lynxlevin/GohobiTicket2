import { useState } from 'react';
import {
    Button,
    FormGroup,
    FormControlLabel,
    Checkbox,
    TextField,
} from '@mui/material';
import { MobileDatePicker } from '@mui/x-date-pickers';

const TicketForm = () => {
    return (
        <FormGroup sx={{mt:3}}>
            <MobileDatePicker label="あげる日" onChange={date => console.log(date)} closeOnSelect showDaysOutsideCurrentMonth onMonthChange={date => console.log('month', date)} onYearChange={date => console.log('year', date)} sx={{mb: 1}} />
            <TextField label="内容" multiline minRows={5}/>
            <FormControlLabel label="特別チケットにする" control={<Checkbox />} />
            <Button variant="contained">チケット付与</Button>
            <Button variant="outlined" sx={{color: 'primary.dark', mt: 2}}>下書き保存</Button>
        </FormGroup>
    );
}

export default TicketForm;