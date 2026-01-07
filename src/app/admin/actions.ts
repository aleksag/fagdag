'use server';

import { updateSlot, deleteSlot as deleteSlotStore, Slot } from '@/lib/store';
import { revalidatePath } from 'next/cache';

export async function saveSlotAction(slot: Slot) {
    await updateSlot(slot);
    revalidatePath('/');
    revalidatePath('/admin');
}

export async function deleteSlotAction(id: string) {
    await deleteSlotStore(id);
    revalidatePath('/');
    revalidatePath('/admin');
}
