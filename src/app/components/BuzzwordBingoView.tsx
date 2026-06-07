'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Session, Slot } from '@/lib/storage/types';

const BUZZWORDS = [
    'AI', 'Agent', 'Skalering', 'Cloud', 'DevOps',
    'Autonomt team', 'Tech debt', 'MVP', 'Microservices', 'Kubernetes',
    'Machine learning', 'Shift left', 'LLM', 'Pipeline', 'RAG',
    'Prompt engineering', 'Bærekraft', 'Innkjøring', 'CI/CD', 'Pair programming',
    'Psychological safety', 'Refaktor', 'Single source of truth', 'Context window', 'Hallusinasjon',
];

const STORAGE_KEY = 'buzzword_bingo_v2';

interface MarkedSquare {
    sessionTitle: string;
    speaker: string;
}

function loadMarked(): Map<number, MarkedSquare> {
    if (typeof window === 'undefined') return new Map();
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return new Map();
        const entries: [number, MarkedSquare][] = JSON.parse(raw);
        return new Map(entries);
    } catch {
        return new Map();
    }
}

function saveMarked(marked: Map<number, MarkedSquare>) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...marked.entries()]));
}

interface Props {
    slots: Slot[];
}

export default function BuzzwordBingoView({ slots }: Props) {
    const [marked, setMarked] = useState<Map<number, MarkedSquare>>(new Map());
    const [isBingo, setIsBingo] = useState(false);
    const [picking, setPicking] = useState<number | null>(null);

    const sessions: Session[] = slots
        .flatMap(s => s.sessions)
        .filter(s => s.speaker && s.title && s.trackId !== 'all');

    useEffect(() => {
        setMarked(loadMarked());
    }, []);

    useEffect(() => {
        checkBingo(marked);
    }, [marked]);

    const checkBingo = (m: Map<number, MarkedSquare>) => {
        const lines = [
            [0, 1, 2, 3, 4], [5, 6, 7, 8, 9], [10, 11, 12, 13, 14], [15, 16, 17, 18, 19], [20, 21, 22, 23, 24],
            [0, 5, 10, 15, 20], [1, 6, 11, 16, 21], [2, 7, 12, 17, 22], [3, 8, 13, 18, 23], [4, 9, 14, 19, 24],
            [0, 6, 12, 18, 24], [4, 8, 12, 16, 20],
        ];
        setIsBingo(lines.some(line => line.every(i => m.has(i))));
    };

    const handleSquareClick = (idx: number) => {
        if (marked.has(idx)) {
            // Unmark on click if already marked
            const next = new Map(marked);
            next.delete(idx);
            setMarked(next);
            saveMarked(next);
        } else {
            setPicking(idx);
        }
    };

    const handleSessionPick = (session: Session) => {
        if (picking === null) return;
        const next = new Map(marked);
        next.set(picking, { sessionTitle: session.title, speaker: session.speaker });
        setMarked(next);
        saveMarked(next);
        setPicking(null);
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-500">
            <div className="text-center space-y-4">
                <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900 uppercase">
                    Buzzword Bingo
                </h2>
                <p className="text-text-muted max-w-lg mx-auto">
                    Hør et buzzword under et foredrag? Trykk på ruten, velg foredraget, og få bingo!
                </p>
            </div>

            {isBingo && (
                <div className="bg-primary/20 border-2 border-primary text-primary-dark p-4 rounded-2xl text-center font-bold animate-bounce shadow-lg">
                    🎉 BINGO! Du har buzzword-bingo! 🎉
                </div>
            )}

            <div className="grid grid-cols-5 gap-2 md:gap-4 aspect-square">
                {BUZZWORDS.map((word, idx) => {
                    const entry = marked.get(idx);
                    const isMarked = !!entry;

                    return (
                        <button
                            key={idx}
                            onClick={() => handleSquareClick(idx)}
                            className={`
                                relative flex flex-col items-center justify-center p-1 md:p-2 rounded-lg md:rounded-xl
                                transition-all duration-300 text-center border-2 aspect-square overflow-hidden
                                ${isMarked
                                    ? 'border-primary bg-primary/10 shadow-inner'
                                    : 'border-gray-200 bg-white hover:border-primary/50 hover:bg-gray-50 shadow-sm'
                                }
                            `}
                        >
                            {isMarked ? (
                                <div className="flex flex-col items-center justify-center gap-0.5 w-full">
                                    <span className="text-primary text-lg md:text-2xl font-black leading-none">✓</span>
                                    <span className="text-[6px] min-[375px]:text-[7px] md:text-[9px] font-bold text-primary-dark leading-tight line-clamp-2 break-words hyphens-auto">
                                        {entry.speaker}
                                    </span>
                                </div>
                            ) : (
                                <span className="text-[8px] min-[375px]:text-[9px] min-[425px]:text-[10px] md:text-xs leading-tight font-medium text-gray-700 break-words hyphens-auto line-clamp-4">
                                    {word}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Session picker modal */}
            {picking !== null && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl animate-in slide-in-from-bottom-4 sm:zoom-in-95 overflow-hidden">
                        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
                            <div>
                                <p className="text-xs font-bold text-primary uppercase tracking-widest">Buzzord hørt</p>
                                <h3 className="text-lg font-extrabold text-gray-900">{BUZZWORDS[picking]}</h3>
                            </div>
                            <button
                                onClick={() => setPicking(null)}
                                className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition"
                            >
                                <X size={18} />
                            </button>
                        </div>
                        <p className="px-6 pt-4 text-sm text-text-muted">Velg hvilket foredrag du hørte det i:</p>
                        <ul className="px-4 py-3 space-y-1 max-h-72 overflow-y-auto">
                            {sessions.map(session => (
                                <li key={session.id}>
                                    <button
                                        onClick={() => handleSessionPick(session)}
                                        className="w-full text-left px-4 py-3 rounded-xl hover:bg-primary/10 transition group"
                                    >
                                        <div className="text-sm font-semibold text-gray-900 group-hover:text-primary-dark leading-tight line-clamp-2">
                                            {session.title}
                                        </div>
                                        <div className="text-xs text-text-muted mt-0.5">{session.speaker}</div>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
}
