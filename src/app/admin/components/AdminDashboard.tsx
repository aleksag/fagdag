'use client';

import { ConferenceData, Slot, Session } from '@/lib/store';
import { useState } from 'react';
import { saveSlotAction, deleteSlotAction } from '../actions';
import { Edit2, Trash2, Plus, Star } from 'lucide-react';
import FormattedDate from '../../components/FormattedDate';

export default function AdminDashboard({ data }: { data: ConferenceData }) {
    const [activeTab, setActiveTab] = useState<'schedule' | 'feedback'>('schedule');
    const [editingSlot, setEditingSlot] = useState<Slot | null>(null);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingSlot) return;
        await saveSlotAction(editingSlot);
        setEditingSlot(null);
    };

    const handleDelete = async (id: string) => {
        if (confirm('Er du sikker på at du vil slette denne slotten?')) {
            await deleteSlotAction(id);
        }
    };

    const createNewSlot = () => {
        setEditingSlot({
            id: Date.now().toString(),
            startTime: '12:00',
            endTime: '13:00',
            type: 'common',
            sessions: [
                { id: Date.now().toString() + '_1', trackId: 'all', title: 'Ny sesjon', speaker: '', description: '' }
            ]
        });
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 min-h-[500px]">
            <div className="border-b border-gray-200 flex">
                <button
                    onClick={() => setActiveTab('schedule')}
                    className={`px-6 py-4 font-medium ${activeTab === 'schedule' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Program
                </button>
                <button
                    onClick={() => setActiveTab('feedback')}
                    className={`px-6 py-4 font-medium ${activeTab === 'feedback' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Tilbakemeldinger ({data.feedback.length})
                </button>
            </div>

            <div className="p-6">
                {activeTab === 'schedule' ? (
                    <div className="space-y-6">
                        <div className="flex justify-end">
                            <button onClick={createNewSlot} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-md hover:opacity-90">
                                <Plus size={16} /> Legg til slot
                            </button>
                            <a href="/admin/import" className="ml-2 flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50">
                                Import CSV
                            </a>
                        </div>

                        {editingSlot && (
                            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-8">
                                <h3 className="text-lg font-bold mb-4">Rediger Slot</h3>
                                <form onSubmit={handleSave} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Starttid</label>
                                            <input type="time" value={editingSlot.startTime} onChange={e => setEditingSlot({ ...editingSlot, startTime: e.target.value })} className="w-full p-2 border rounded" required />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Sluttid</label>
                                            <input type="time" value={editingSlot.endTime} onChange={e => setEditingSlot({ ...editingSlot, endTime: e.target.value })} className="w-full p-2 border rounded" required />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">Type</label>
                                        <select
                                            value={editingSlot.type}
                                            onChange={e => {
                                                const type = e.target.value as any;
                                                let sessions = [...editingSlot.sessions];
                                                if (type === 'parallel' && sessions.length < 2) {
                                                    sessions = [
                                                        { ...sessions[0], trackId: 'track1' },
                                                        { id: Date.now().toString() + '_2', trackId: 'track2', title: 'Sesjon 2', speaker: '', description: '' }
                                                    ];
                                                } else if (type === 'common') {
                                                    sessions = [{ ...sessions[0], trackId: 'all' }];
                                                }
                                                setEditingSlot({ ...editingSlot, type, sessions });
                                            }}
                                            className="w-full p-2 border rounded"
                                        >
                                            <option value="common">Felles (Ett spor)</option>
                                            <option value="parallel">Parallell (To spor)</option>
                                            <option value="break">Pause</option>
                                        </select>
                                    </div>

                                    <div className="space-y-4">
                                        {editingSlot.sessions.map((session, idx) => (
                                            <div key={session.id} className="bg-white p-4 rounded border">
                                                <h4 className="font-medium mb-2 text-sm text-gray-500 uppercase">
                                                    {editingSlot.type === 'parallel' ? `Spor ${idx + 1}` : 'Sesjonsdetaljer'}
                                                </h4>
                                                <div className="space-y-2">
                                                    <input
                                                        placeholder="Tittel"
                                                        value={session.title}
                                                        onChange={e => {
                                                            const newSessions = [...editingSlot.sessions];
                                                            newSessions[idx].title = e.target.value;
                                                            setEditingSlot({ ...editingSlot, sessions: newSessions });
                                                        }}
                                                        className="w-full p-2 border rounded"
                                                    />
                                                    <input
                                                        placeholder="Taler"
                                                        value={session.speaker}
                                                        onChange={e => {
                                                            const newSessions = [...editingSlot.sessions];
                                                            newSessions[idx].speaker = e.target.value;
                                                            setEditingSlot({ ...editingSlot, sessions: newSessions });
                                                        }}
                                                        className="w-full p-2 border rounded"
                                                    />
                                                    <input
                                                        placeholder="Beskrivelse"
                                                        value={session.description}
                                                        onChange={e => {
                                                            const newSessions = [...editingSlot.sessions];
                                                            newSessions[idx].description = e.target.value;
                                                            setEditingSlot({ ...editingSlot, sessions: newSessions });
                                                        }}
                                                        className="w-full p-2 border rounded"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex gap-2 justify-end">
                                        <button type="button" onClick={() => setEditingSlot(null)} className="px-4 py-2 text-gray-600">Avbryt</button>
                                        <button type="submit" className="px-4 py-2 bg-primary text-white rounded">Lagre</button>
                                    </div>
                                </form>
                            </div>
                        )}

                        <div className="divide-y">
                            {data.slots.map(slot => (
                                <div key={slot.id} className="py-4 flex items-center justify-between">
                                    <div>
                                        <div className="font-bold">{slot.startTime} - {slot.endTime} <span className="text-gray-500 text-sm font-normal">({slot.type === 'common' ? 'Felles' : slot.type === 'parallel' ? 'Parallell' : 'Pause'})</span></div>
                                        <div className="text-sm text-gray-600">
                                            {slot.sessions.map(s => s.title).join(' | ')}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => setEditingSlot(slot)} className="p-2 text-gray-400 hover:text-primary"><Edit2 size={18} /></button>
                                        <button onClick={() => handleDelete(slot.id)} className="p-2 text-gray-400 hover:text-red-500"><Trash2 size={18} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b text-gray-500 text-sm">
                                        <th className="py-2">Tid</th>
                                        <th className="py-2">Sesjon</th>
                                        <th className="py-2">Rating</th>
                                        <th className="py-2">Kommentar</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {data.feedback.length === 0 && (
                                        <tr><td colSpan={4} className="py-8 text-center text-gray-500">Ingen tilbakemeldinger ennå</td></tr>
                                    )}
                                    {[...data.feedback].reverse().map(fb => {
                                        const session = data.slots.flatMap(s => s.sessions).find(s => s.id === fb.sessionId);
                                        return (
                                            <tr key={fb.id}>
                                                <td className="py-2 text-sm text-gray-500"><FormattedDate date={fb.createdAt} /></td>
                                                <td className="py-2 font-medium">{session?.title || 'Ukjent sesjon'}</td>
                                                <td className="py-2">
                                                    <div className="flex text-yellow-500">
                                                        {Array.from({ length: fb.rating }).map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                                                    </div>
                                                </td>
                                                <td className="py-2 text-gray-600">{fb.comment}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
