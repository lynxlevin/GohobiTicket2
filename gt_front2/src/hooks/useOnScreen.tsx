import { RefObject, useEffect, useMemo, useState } from 'react';

const useOnScreen = (ref: RefObject<HTMLElement>, observeVisibility: boolean) => {
    const [isVisible, setIsVisible] = useState(false);

    const observer = useMemo(() => new IntersectionObserver(([entry]) => setIsVisible(entry.isIntersecting)), []);

    useEffect(() => {
        if (!ref.current || !observeVisibility) return;
        observer.observe(ref.current);
        return () => observer.disconnect();
    }, [observer, ref, observeVisibility]);

    return {
        isVisible,
    };
};

export default useOnScreen;
