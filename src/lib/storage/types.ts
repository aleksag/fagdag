export interface Track {
    id: string;
    name: string;
}

export interface Session {
    id: string;
    trackId: string; // 'track1', 'track2', or 'all'
    title: string;
    speaker: string;
    description: string;
    rowSpan?: number;
}

export interface Slot {
    id: string;
    startTime: string;
    endTime: string;
    type: 'common' | 'parallel' | 'break';
    sessions: Session[];
}

export interface Feedback {
    id: string;
    sessionId: string;
    rating: number; // 1-5
    comment: string;
    createdAt: string;
}

export interface ConferenceData {
    tracks: Track[];
    slots: Slot[];
    feedback: Feedback[];
}
