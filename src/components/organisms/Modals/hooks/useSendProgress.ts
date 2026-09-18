import { useEffect, useRef, useState } from 'react';

import type { SendStatus } from '@/components/organisms/types/types';

export function useSendProgress() {
    const [status, setStatus] = useState<SendStatus>('confirm');
    const [progress, setProgress] = useState(0);
    const intervalRef = useRef<number | null>(null);

    const clear = () => {
        if (intervalRef.current !== null) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    const start = () => {
        clear();
        setProgress(0);
        let current = 0;
        intervalRef.current = window.setInterval(() => {
            current = Math.min(current + 4, 90);
            setProgress(current);
        }, 120);
    };

    const finish = () => {
        clear();
        setProgress(100);
    };

    const fail = (at = 55) => {
        clear();
        setProgress(at);
        setStatus('error');
    };

    const reset = () => {
        clear();
        setStatus('confirm');
        setProgress(0);
    };

    useEffect(() => clear, []);

    return { status, setStatus, progress, start, finish, fail, reset };
}