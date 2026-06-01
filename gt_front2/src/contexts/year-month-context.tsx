import { format } from 'date-fns';
import { createContext, ReactNode, useState } from 'react';

interface YearMonthContextType {
    yearMonth: string;
    setYearMonth: React.Dispatch<React.SetStateAction<string>>;
}

export const YearMonthContext = createContext({
    yearMonth: undefined,
    setYearMonth: () => {},
} as unknown as YearMonthContextType);

export const YearMonthProvider = ({ children }: { children: ReactNode }) => {
    const [yearMonth, setYearMonth] = useState(format(new Date(), 'yyyyMM'));

    return <YearMonthContext.Provider value={{ yearMonth, setYearMonth }}>{children}</YearMonthContext.Provider>;
};
