'use client';

import { useEffect, useState } from 'react';

export default function FormattedDate({ date }: { date: string }) {
    const [formatted, setFormatted] = useState<string>('');

    useEffect(() => {
        setFormatted(new Date(date).toLocaleTimeString());
    }, [date]);

    if (!formatted) return <span className="opacity-0">--:--:--</span>; // Skeleton/placeholder
    return <span>{formatted}</span>;
}
