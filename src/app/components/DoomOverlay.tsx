'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface Props {
    onClose: () => void;
}

declare global {
    interface Window {
        Dos?: (el: HTMLDivElement, opts: object) => Promise<any>;
    }
}

export default function DoomOverlay({ onClose }: Props) {
    const containerRef = useRef<HTMLDivElement>(null);
    const ciRef = useRef<any>(null);

    useEffect(() => {
        let stopped = false;

        function loadScript(src: string): Promise<void> {
            return new Promise((resolve, reject) => {
                if (document.querySelector(`script[src="${src}"]`)) {
                    resolve();
                    return;
                }
                const s = document.createElement('script');
                s.src = src;
                s.onload = () => resolve();
                s.onerror = reject;
                document.body.appendChild(s);
            });
        }

        if (!document.getElementById('jsdos-css')) {
            const link = document.createElement('link');
            link.id = 'jsdos-css';
            link.rel = 'stylesheet';
            link.href = '/js-dos/js-dos.css';
            document.head.appendChild(link);
        }

        async function startDoom() {
            await loadScript('/js-dos/emulators/emulators.js');
            await loadScript('/js-dos/js-dos.js');
            if (stopped || !containerRef.current || !window.Dos) return;
            ciRef.current = await window.Dos(containerRef.current, {
                url: '/doom.jsdos',
                emulatorsUrl: '/js-dos/emulators/',
                autoStart: true,
            });
        }

        startDoom();

        return () => {
            stopped = true;
            ciRef.current?.stop();
        };
    }, []);

    return (
        <div className="fixed inset-0 z-[200] bg-black flex flex-col">
            <div className="flex items-center justify-between px-4 py-2 bg-gray-900 shrink-0">
                <span className="text-red-500 font-bold font-mono tracking-widest text-lg">
                    ☠ DOOM ☠
                </span>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-white transition p-1"
                    aria-label="Lukk"
                >
                    <X size={22} />
                </button>
            </div>
            <div ref={containerRef} className="flex-1 w-full overflow-hidden" />
        </div>
    );
}
