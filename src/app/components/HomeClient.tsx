'use client';

import { useState } from 'react';
import { ConferenceData } from "@/lib/store";
import ScheduleView from "./ScheduleView";
import BingoView from "./BingoView";
import { Calendar, Grid3X3, Users } from 'lucide-react';

export default function HomeClient({ data }: { data: ConferenceData }) {
    const [activeTab, setActiveTab] = useState<'program' | 'bingo'>('program');

    return (
        <>
            {/* Tab Navigation */}
            <div className="bg-white border-b border-gray-100 sticky top-16 z-30 shadow-sm">
                <div className="max-w-6xl mx-auto px-4 flex">
                    <button
                        onClick={() => setActiveTab('program')}
                        className={`
              flex-1 py-4 flex items-center justify-center gap-2 border-b-2 transition-all duration-300
              ${activeTab === 'program'
                                ? 'border-primary text-primary-dark font-bold'
                                : 'border-transparent text-text-muted hover:text-gray-900 font-medium'
                            }
            `}
                    >
                        <Calendar size={18} />
                        <span>Program</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('bingo')}
                        className={`
              flex-1 py-4 flex items-center justify-center gap-2 border-b-2 transition-all duration-300
              ${activeTab === 'bingo'
                                ? 'border-primary text-primary-dark font-bold'
                                : 'border-transparent text-text-muted hover:text-gray-900 font-medium'
                            }
            `}
                    >
                        <Users size={18} />
                        <span>BINGO</span>
                    </button>
                </div>
            </div>

            <div className="flex-grow bg-gray-50/30">
                {activeTab === 'program' ? (
                    <ScheduleView data={data} />
                ) : (
                    <BingoView />
                )}
            </div>
        </>
    );
}
