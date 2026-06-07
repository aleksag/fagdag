'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';

const DoomOverlay = dynamic(() => import('./DoomOverlay'), { ssr: false });

const TAPS_REQUIRED = 5;
const TAP_WINDOW_MS = 3000;

export default function LogoTapDetector() {
    const [taps, setTaps] = useState(0);
    const [lastTap, setLastTap] = useState(0);
    const [doomActive, setDoomActive] = useState(false);

    const handleTap = useCallback(() => {
        const now = Date.now();
        const fresh = now - lastTap < TAP_WINDOW_MS;
        const newCount = fresh ? taps + 1 : 1;

        setLastTap(now);
        setTaps(newCount);

        if (newCount >= TAPS_REQUIRED) {
            setTaps(0);
            setDoomActive(true);
        }
    }, [taps, lastTap]);

    return (
        <>
            <button onClick={handleTap} className="flex items-center focus:outline-none" aria-label="Systek">
                <img src="/systek-logo.svg" alt="Systek Logo" className="h-8 w-auto" />
            </button>
            {doomActive && <DoomOverlay onClose={() => setDoomActive(false)} />}
        </>
    );
}
