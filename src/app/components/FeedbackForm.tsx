'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';

interface FeedbackFormProps {
    sessionId: string;
    onClose: () => void;
    submitFeedback: (formData: FormData) => Promise<void>;
}

export default function FeedbackForm({ sessionId, onClose, submitFeedback }: FeedbackFormProps) {
    const [rating, setRating] = useState(5);

    return (
        <form action={async (formData) => {
            await submitFeedback(formData);
            onClose();
            alert('Takk for din tilbakemelding!');
        }} className="space-y-4">
            <input type="hidden" name="sessionId" value={sessionId} />

            <div>
                <label className="block text-sm font-medium text-gray-700">Vurdering</label>
                <div className="flex gap-2 mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className={`text-2xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                        >
                            ★
                        </button>
                    ))}
                </div>
                <input type="hidden" name="rating" value={rating} />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Kommentar</label>
                <textarea
                    name="comment"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
                    rows={3}
                    placeholder="Hva synes du?"
                />
            </div>

            <div className="flex justify-end gap-2">
                <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                >
                    Avbryt
                </button>
                <SubmitButton />
            </div>
        </form>
    );
}

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-opacity-90 disabled:opacity-50"
        >
            {pending ? 'Sender...' : 'Send'}
        </button>
    );
}
