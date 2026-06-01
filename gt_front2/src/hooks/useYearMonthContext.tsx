import { useContext } from 'react';
import { YearMonthContext } from '../contexts/year-month-context';
import { format, parse, subMonths } from 'date-fns';
import { IUserRelation } from '../types/user_relation';

type PageType = 'GivingTicket' | 'ReceivingTicket' | 'Diary';

const useYearMonthContext = () => {
    const yearMonthContext = useContext(YearMonthContext);

    const yearMonth = yearMonthContext.yearMonth;
    const setYearMonth = yearMonthContext.setYearMonth;
    const ticketServiceStart = parse('202012', 'yyyyMM', new Date());
    const diaryServiceStart = parse('202312', 'yyyyMM', new Date());
    const thisMonth = format(new Date(), 'yyyyMM');

    const getFirstDate = (page: PageType, currentRelation?: IUserRelation) => {
        switch (page) {
            case 'GivingTicket':
                if (!currentRelation?.first_giving_ticket_date) return ticketServiceStart;
                return new Date(currentRelation.first_giving_ticket_date);
            case 'ReceivingTicket':
                if (!currentRelation?.first_receiving_ticket_date) return ticketServiceStart;
                return new Date(currentRelation.first_receiving_ticket_date);
            case 'Diary':
                if (!currentRelation?.first_diary_date) return diaryServiceStart;
                return new Date(currentRelation.first_diary_date);
        }
    };

    const getTabYearMonths = (page: PageType, currentRelation?: IUserRelation) => {
        const startDay = getFirstDate(page, currentRelation);
        const yearMonths = [format(new Date(), 'yyyyMM')];
        while (startDay !== undefined && yearMonths[yearMonths.length - 1] !== format(startDay, 'yyyyMM')) {
            const lastMonth = subMonths(parse(yearMonths[yearMonths.length - 1], 'yyyyMM', new Date()), 1);
            yearMonths.push(format(lastMonth, 'yyyyMM'));
        }
        return yearMonths;
    };

    return {
        yearMonth,
        setYearMonth,
        thisMonth,
        getFirstDate,
        getTabYearMonths,
    };
};

export default useYearMonthContext;
