'use client';

import { ConferenceData, Session, Slot, Track } from '@/lib/store';
import { useState } from 'react';
import FeedbackForm from './FeedbackForm';
import { submitFeedbackAction } from '../actions';
import { Clock, MessageSquare, MapPin, User, ChevronRight } from 'lucide-react';

export default function ScheduleView({ data }: { data: ConferenceData }) {
    const [selectedSession, setSelectedSession] = useState<Session | null>(null);

    // Helper to get formatted time
    const formatTime = (time: string) => {
        // Simple pass-through if already HH:MM
        return time;
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-12">
            {/* Intro Section */}
            <div className="text-center space-y-4 max-w-2xl mx-auto">
                <h2 className="text-4xl font-extrabold tracking-tight text-gray-900">Program</h2>
                <p className="text-lg text-text-muted">
                    Utforsk dagens program og lær noe nytt.
                </p>
            </div>

            {/* Tracks Indicators (Desktop) */}
            <div className="hidden md:grid grid-cols-[100px_1fr_1fr] gap-8 border-b border-gray-200 pb-4 sticky top-20 bg-background/90 backdrop-blur z-20">
                <div className="font-semibold text-text-muted text-right">Tid</div>
                {data.tracks.map(track => (
                    <div key={track.id} className="font-bold text-lg text-primary uppercase tracking-wide">
                        {track.name}
                    </div>
                ))}
            </div>

            <div className="space-y-8 relative">
                {/* Vertical Time Line (Desktop) */}
                <div className="hidden md:block absolute left-[100px] top-0 bottom-0 w-px bg-gray-200 -z-10"></div>

                {data.slots.map((slot) => {
                    const isBreak = slot.type === 'break';
                    const isCommon = slot.type === 'common';

                    return (
                        <div key={slot.id} className={`group ${isCommon ? 'md:flex md:flex-col items-center' : 'md:grid md:grid-cols-[100px_1fr_1fr]'} gap-8`}>

                            {/* Time Column */}
                            <div className={`
                    flex md:flex-col items-center md:items-end gap-2 md:gap-0 
                    text-sm font-bold text-text-muted whitespace-nowrap
                    ${isCommon ? 'md:w-full md:justify-center md:flex-row md:mb-4' : ''}
                `}>
                                <Clock className="md:hidden" size={16} />
                                <span>{slot.startTime}</span>
                                <span className="hidden md:inline text-gray-300 mx-1">-</span>
                                <span className="text-gray-400 font-normal">{slot.endTime}</span>
                            </div>

                            {/* Sessions */}
                            {slot.sessions.map((session, idx) => {
                                return (
                                    <div
                                        key={session.id}
                                        className={`
                           relative rounded-2xl overflow-hidden transition-all duration-300
                           ${isBreak
                                                ? 'bg-primary/5 border border-primary/10 p-4 flex items-center justify-center text-center col-span-2'
                                                : 'bg-white shadow-sm border border-gray-100 card-hover p-6 md:p-8'
                                            }
                           ${isCommon && !isBreak ? 'w-full max-w-3xl text-center border-l-4 border-l-primary' : ''}
                           ${!isCommon && session.trackId === 'track2' && idx === 0 ? 'md:col-start-3' : ''} /* Fallback if missing session 1 */
                        `}
                                        style={isCommon && !isBreak ? {} : { borderLeftWidth: '4px', borderLeftColor: 'var(--color-primary)' }}
                                    >
                                        <div className="space-y-3">
                                            {/* Mobile Track Label */}
                                            {!isCommon && !isBreak && (
                                                <div className="md:hidden text-xs font-bold text-primary uppercase tracking-wider mb-1">
                                                    {data.tracks.find(t => t.id === session.trackId)?.name}
                                                </div>
                                            )}

                                            <h3 className={`font-bold text-gray-900 ${isBreak ? 'text-lg text-primary-dark' : 'text-xl md:text-2xl'}`}>
                                                {session.title}
                                            </h3>

                                            {session.speaker && (
                                                <div className={`flex items-center gap-2 text-text-muted ${isCommon ? 'justify-center' : ''}`}>
                                                    {!isBreak && <User size={18} className="text-primary" />}
                                                    <span className="font-medium">{session.speaker}</span>
                                                </div>
                                            )}

                                            {session.description && (
                                                <p className="text-gray-500 text-sm leading-relaxed max-w-prose mx-auto">
                                                    {session.description}
                                                </p>
                                            )}

                                            {!isBreak && (
                                                <div className={`pt-4 ${isCommon ? 'flex justify-center' : ''}`}>
                                                    <button
                                                        onClick={() => setSelectedSession(session)}
                                                        className="inline-flex items-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-medium transition-colors"
                                                    >
                                                        <MessageSquare size={16} />
                                                        <span>Gi tilbakemelding</span>
                                                        <ChevronRight size={14} className="opacity-50" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
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
