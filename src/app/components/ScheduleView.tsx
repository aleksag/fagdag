'use client';

import { ConferenceData, Session, Slot, Track } from '@/lib/store';
import { useState } from 'react';
import FeedbackForm from './FeedbackForm';
import { submitFeedbackAction } from '../actions';
import { Clock, MessageSquare, MapPin, User, ChevronRight, Coffee, Utensils } from 'lucide-react';

export default function ScheduleView({ data }: { data: ConferenceData }) {
    const [selectedSession, setSelectedSession] = useState<Session | null>(null);

    return (
        <div className="max-w-6xl mx-auto px-2 md:px-4 py-8 space-y-8">
            {/* Intro Section */}
            <div className="text-center space-y-4 max-w-2xl mx-auto mb-8">
                <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">Program</h2>
                <p className="text-base md:text-lg text-text-muted">
                    Utforsk dagens program og lær noe nytt.
                </p>
            </div>

            {/* Sticky Header */}
            <div className="hidden md:grid grid-cols-[100px_1fr_1fr] gap-x-8 border-b border-gray-200 pb-4 sticky top-20 bg-background/95 backdrop-blur z-20 pt-2 transition-all">
                <div className="font-semibold text-text-muted text-right">Tid</div>
                {data.tracks.map(track => (
                    <div key={track.id} className="font-bold text-lg text-primary uppercase tracking-wide text-left">
                        {track.name}
                    </div>
                ))}
            </div>

            {/* Mobile Header (Simplified) */}
            <div className="grid md:hidden grid-cols-[auto_1fr_1fr] gap-x-2 border-b border-gray-200 pb-2 sticky top-16 bg-background/95 backdrop-blur z-20 pt-2">
                <div className="font-semibold text-text-muted w-[50px] text-xs">Tid</div>
                {data.tracks.map(track => (
                    <div key={track.id} className="font-bold text-sm text-primary uppercase tracking-wide text-center">
                        {track.name}
                    </div>
                ))}
            </div>

            {/* Grid Container */}
            <div className={`
                grid 
                grid-cols-[auto_1fr_1fr] /* Mobile: 3 cols (time, track1, track2) */
                md:grid-cols-[100px_1fr_1fr] /* Desktop: Time fixed, equal tracks */
                gap-x-2 gap-y-4 md:gap-x-8 md:gap-y-8
            `}>
                {data.slots.map((slot) => {
                    const isBreak = slot.type === 'break';
                    const isCommon = slot.type === 'common';

                    const track1Session = slot.sessions.find(s => s.trackId === 'track1');
                    const track2Session = slot.sessions.find(s => s.trackId === 'track2');
                    const commonSession = slot.sessions.find(s => s.trackId === 'all');

                    return (
                        <div key={slot.id} className="contents group">
                            {/* Time Column */}
                            <div
                                className="flex flex-col items-center md:items-end gap-0 text-xs md:text-sm font-bold text-text-muted whitespace-nowrap pt-2 md:pt-4"
                                style={{ gridColumn: '1' }}
                            >
                                <span>{slot.startTime}</span>
                                <span className="md:hidden text-gray-300 transform rotate-90 w-px h-2 bg-gray-300 my-0.5"></span>
                                <span className="hidden md:inline text-gray-300 mx-1">-</span>
                                <span className="text-gray-400 font-normal">{slot.endTime}</span>
                                {(isCommon || isBreak) && <Clock className="mt-2 text-primary hidden md:block" size={16} />}
                            </div>

                            {/* Common Session (Full Width spanning tracks) */}
                            {(isCommon || isBreak) && commonSession && (
                                <div
                                    className={`
                                        col-span-2 
                                        ${isBreak
                                            ? 'bg-gray-100/80 border border-gray-200 py-3 md:py-6 text-center'
                                            : 'bg-white shadow-sm border border-gray-100 card-hover p-4 md:p-8 text-center border-l-4 border-l-primary'
                                        }
                                        rounded-xl md:rounded-2xl relative overflow-hidden
                                    `}
                                    style={{ gridColumn: '2 / span 2' }}
                                >
                                    {isBreak && (
                                        <div className="absolute top-1/2 left-4 -translate-y-1/2 opacity-10 pointer-events-none">
                                            {commonSession.title.toUpperCase().includes('MIDDAG') || commonSession.title.toUpperCase().includes('LUNSJ')
                                                ? <Utensils size={48} />
                                                : <Coffee size={40} />
                                            }
                                        </div>
                                    )}
                                    <div className="space-y-1 md:space-y-2">
                                        <div className="flex items-center justify-center gap-2">
                                            {isBreak && (
                                                <span className="text-text-muted">
                                                    {commonSession.title.toUpperCase().includes('MIDDAG') || commonSession.title.toUpperCase().includes('LUNSJ')
                                                        ? <Utensils size={18} />
                                                        : <Coffee size={18} />
                                                    }
                                                </span>
                                            )}
                                            <h3 className={`font-bold text-gray-900 ${isBreak ? 'text-base md:text-lg text-gray-600' : 'text-xl md:text-2xl'}`}>
                                                {commonSession.title}
                                            </h3>
                                        </div>
                                        {commonSession.speaker && (
                                            <div className="flex items-center justify-center gap-2 text-text-muted">
                                                {!isBreak && <User size={18} className="text-primary" />}
                                                <span className="font-medium">{commonSession.speaker}</span>
                                            </div>
                                        )}
                                        {commonSession.description && (
                                            <p className="text-gray-500 text-sm max-w-prose mx-auto italic">{commonSession.description}</p>
                                        )}
                                        {!isBreak && (
                                            <div className="pt-4 flex justify-center">
                                                <button
                                                    onClick={() => setSelectedSession(commonSession)}
                                                    className="inline-flex items-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-medium transition-colors"
                                                >
                                                    <MessageSquare size={16} />
                                                    <span>Gi tilbakemelding</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Parallel Track 1 */}
                            {!isCommon && track1Session && (
                                <SessionCard
                                    session={track1Session}
                                    onClick={() => setSelectedSession(track1Session)}
                                />
                            )}

                            {/* Parallel Track 2 */}
                            {!isCommon && track2Session && (
                                <SessionCard
                                    session={track2Session}
                                    onClick={() => setSelectedSession(track2Session)}
                                />
                            )}

                            {/* Empty Placeholder if needed? 
                                CSS Grid auto-placement might shift things if we don't handle empty cells.
                                If Track 2 is spanned, track2Session is undefined. 0 elements emitted.
                                The "Time" cell took 1 slot. Track 1 took 1 slot. Track 2 should be skipped?
                                No, if we omit the div, the *next* element (next slot's time) will flow into this cell!
                                CRITICAL: We MUST allow the grid to flow correctly.
                                If track2Session is missing because it's spanned (rowSpan from above), we emit NOTHING.
                                But if track2Session is missing because it's just empty (no speaker), we SHOULD emit an empty placeholder.
                                How to distinguish?
                                Our `import-csv.js` only emits a session if it exists.
                                If it's spanned, it emits NOTHING.
                                If we emit nothing, the next grid item (the next Slot's Time cell) will jump into Track 2's column!
                                
                                Solution: 
                                We CANNOT rely on "contents" display if we have gaps.
                                actually, `grid-column` property on the items forces them to the right column.
                                SessionCard has `gridColumn: 2` or `3`.
                                Time has `gridColumn: 1`.
                                So if T2 is missing (spanned), T1 (col 2) is rendered. Time (col 1) is rendered.
                                The next item is Next Time (col 1).
                                Grid auto-placement will put Next Time in the *next available row* at col 1.
                                This SHOULD work provided we use explicit `grid-column`.
                             */}

                            {!isCommon && !track2Session && !track1Session && (
                                /* If both empty? Should not happen. */
                                <div className="col-span-2"></div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Modal */}
            {selectedSession && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95">
                        <div className="bg-primary/10 p-6 flex justify-between items-start">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">{selectedSession.title}</h3>
                                <p className="text-primary-dark font-medium">{selectedSession.speaker}</p>
                            </div>
                            <button onClick={() => setSelectedSession(null)} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-white/50 rounded-full transition">✕</button>
                        </div>

                        <div className="p-6">
                            <FeedbackForm
                                sessionId={selectedSession.id}
                                onClose={() => setSelectedSession(null)}
                                submitFeedback={submitFeedbackAction}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function SessionCard({ session, onClick }: { session: Session; onClick: () => void }) {
    return (
        <div
            className={`
                bg-white shadow-sm border border-gray-100 card-hover p-3 md:p-6 
                flex flex-col justify-between 
                rounded-xl md:rounded-2xl
                relative
            `}
            style={{
                borderLeftWidth: '3px',
                borderLeftColor: 'var(--color-primary)',
                gridRow: session.rowSpan ? `span ${session.rowSpan}` : undefined,
                gridColumn: session.trackId === 'track1' ? '2' : '3'
            }}
        >
            <div className="space-y-2">
                <h3 className="font-bold text-gray-900 text-sm md:text-xl leading-tight">
                    {session.title}
                </h3>

                {session.speaker && (
                    <div className="flex flex-wrap items-center gap-1 md:gap-2 text-text-muted text-xs md:text-sm">
                        <User size={14} className="text-primary md:w-4 md:h-4" />
                        <span className="font-medium">{session.speaker}</span>
                    </div>
                )}

                {session.description && (
                    <p className="text-gray-500 text-xs md:text-sm leading-relaxed hidden md:block line-clamp-3">
                        {session.description}
                    </p>
                )}

                <div className="pt-2 mt-auto">
                    <button
                        onClick={onClick}
                        className="inline-flex items-center gap-1 md:gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 px-3 py-1.5 md:px-4 md:py-2 rounded-full text-[10px] md:text-sm font-medium transition-colors w-full justify-center md:w-auto md:justify-start"
                    >
                        <MessageSquare size={14} className="md:w-4 md:h-4" />
                        <span className="truncate">Gi tilbakemelding</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
