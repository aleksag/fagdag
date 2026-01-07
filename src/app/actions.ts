'use server';

import { addFeedback } from '@/lib/store';
import { revalidatePath } from 'next/cache';

export async function submitFeedbackAction(formData: FormData) {
    const sessionId = formData.get('sessionId') as string;
    const rating = parseInt(formData.get('rating') as string);
    const comment = formData.get('comment') as string;

    if (!sessionId || !rating) return;

    await addFeedback(sessionId, rating, comment);
    revalidatePath('/admin'); // Revalidate admin to show new feedback
}
