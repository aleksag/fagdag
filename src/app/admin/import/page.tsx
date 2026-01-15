'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { parseCSVAction, saveScheduleAction } from '../actions';
import { Slot } from '@/lib/store';

export default function ImportPage() {
    const [file, setFile] = useState<File | null>(null);
    const [previewSlots, setPreviewSlots] = useState<Slot[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
            setPreviewSlots(null);
            setError(null);
        }
    };

    const handlePreview = async () => {
        if (!file) return;

        setLoading(true);
        setError(null);
        const formData = new FormData();
        formData.append('file', file);

        const result = await parseCSVAction(formData);

        if (result.success && result.slots) {
            setPreviewSlots(result.slots);
        } else {
            setError(result.error || 'Failed to parse CSV');
        }
        setLoading(false);
    };

    const handleConfirm = async () => {
        if (!previewSlots) return;

        setLoading(true);
        const result = await saveScheduleAction(previewSlots);

        if (result.success) {
            router.push('/admin');
        } else {
            setError(result.error || 'Failed to save schedule');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <header className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-900">Import Schedule</h1>
                    <a href="/admin" className="text-gray-600 hover:text-gray-900">Back to Admin</a>
                </header>

                <div className="bg-white rounded-lg shadow p-6 space-y-6">
                    <div className="space-y-4">
                        <label className="block text-sm font-medium text-gray-700">
                            Upload Schedule CSV
                        </label>
                        <div className="flex items-center gap-4">
                            <input
                                type="file"
                                accept=".csv"
                                onChange={handleFileChange}
                                className="block w-full text-sm text-gray-500
                                    file:mr-4 file:py-2 file:px-4
                                    file:rounded-full file:border-0
                                    file:text-sm file:font-semibold
                                    file:bg-blue-50 file:text-blue-700
                                    hover:file:bg-blue-100"
                            />
                            <button
                                onClick={handlePreview}
                                disabled={!file || loading}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Processing...' : 'Preview'}
                            </button>
                        </div>
                        {error && (
                            <div className="p-4 bg-red-50 text-red-700 rounded-md">
                                {error}
                            </div>
                        )}
                    </div>

                    {previewSlots && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold">Preview ({previewSlots.length} slots)</h2>
                            <div className="overflow-x-auto border rounded-lg">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sessions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {previewSlots.map((slot) => (
                                            <tr key={slot.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {slot.startTime} - {slot.endTime}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                        ${slot.type === 'break' ? 'bg-yellow-100 text-yellow-800' :
                                                            slot.type === 'common' ? 'bg-purple-100 text-purple-800' :
                                                                'bg-green-100 text-green-800'}`}>
                                                        {slot.type}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500">
                                                    <div className="space-y-2">
                                                        {slot.sessions.map(session => (
                                                            <div key={session.id} className="border-l-2 border-gray-200 pl-2">
                                                                <div className="font-medium text-gray-900">{session.title}</div>
                                                                {session.speaker && <div className="text-gray-500 text-xs">{session.speaker}</div>}
                                                                <div className="text-xs text-gray-400 capitalize">{session.trackId}</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="flex justify-end pt-4 border-t">
                                <button
                                    onClick={handleConfirm}
                                    disabled={loading}
                                    className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                                >
                                    {loading ? 'Saving...' : 'Confirm Import'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
