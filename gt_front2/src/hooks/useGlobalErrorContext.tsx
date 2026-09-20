import { useContext } from 'react';
import { GlobalError, GlobalErrorContext, GlobalErrorOptional, SetGlobalErrorContext } from '../contexts/global-error-context';
import { AxiosError } from 'axios';

const useGlobalErrorContext = () => {
    const globalErrorContext = useContext(GlobalErrorContext);
    const setGlobalErrorContext = useContext(SetGlobalErrorContext);

    const globalErrors = globalErrorContext.errors;
    const clearGlobalErrorsCache = () => {
        setGlobalErrorContext.setErrors([]);
    };

    const pushGlobalError = (error: GlobalError) => {
        setGlobalErrorContext.setErrors(prev => [...prev, error]);
    };

    const removeGlobalErrors = (error: GlobalErrorOptional) => {
        setGlobalErrorContext.setErrors(prev =>
            [...prev].filter(e => {
                let isSame = true;
                if (error.message !== undefined) isSame = isSame && e.message === error.message;
                if (error.componentName !== undefined) isSame = isSame && e.componentName === error.componentName;
                if (error.methodName !== undefined) isSame = isSame && e.methodName === error.methodName;
                return !isSame;
            }),
        );
    };

    const handleAPIError = (error: AxiosError<{ error?: string }, any>) => {
        const message = error.response?.data.error !== undefined ? error.response.data.error : error.message;
        pushGlobalError({ message, componentName: 'APICall', methodName: 'APICall', autoHideDurationMS: 7000 });
    };

    const handleAPIErrorThrowing = (error: AxiosError<{ error?: string }, any>) => {
        handleAPIError(error);
        throw error;
    };

    return {
        globalErrors,
        clearGlobalErrorsCache,
        pushGlobalError,
        removeGlobalErrors,
        handleAPIError,
        handleAPIErrorThrowing,
    };
};

export default useGlobalErrorContext;
