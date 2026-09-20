import { createContext, Dispatch, SetStateAction, useState, type ReactNode } from 'react';

export interface GlobalError {
    message: string;
    componentName: string;
    methodName: string;
    autoHideDurationMS?: number;
}

export interface GlobalErrorOptional {
    message?: string;
    componentName?: string;
    methodName?: string;
    autoHideDurationMS?: number;
}

interface GlobalErrorContextType {
    errors: GlobalError[];
}

interface SetGlobalErrorContextType {
    setErrors: Dispatch<SetStateAction<GlobalError[]>>;
}

export const GlobalErrorContext = createContext<GlobalErrorContextType>({
    errors: [],
});

export const SetGlobalErrorContext = createContext<SetGlobalErrorContextType>({
    setErrors: () => {},
});

export const GlobalErrorProvider = ({ children }: { children: ReactNode }) => {
    const [errors, setErrors] = useState<GlobalError[]>([]);

    return (
        <GlobalErrorContext.Provider value={{ errors }}>
            <SetGlobalErrorContext.Provider value={{ setErrors }}>{children}</SetGlobalErrorContext.Provider>
        </GlobalErrorContext.Provider>
    );
};
