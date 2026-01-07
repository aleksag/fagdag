import { FileStorageProvider } from './storage/FileStorageProvider';
import { ConferenceData, Slot, Feedback } from './storage/types';

// Singleton instance of the provider
// In a real app we might use dependency injection or environment vars to choose provider
const storage = new FileStorageProvider();

export * from './storage/types';

export async function getConferenceData(): Promise<ConferenceData> {
  return storage.getData();
}

export async function saveConferenceData(data: ConferenceData): Promise<void> {
  return storage.saveData(data);
}

export async function addFeedback(sessionId: string, rating: number, comment: string): Promise<void> {
  const data = await getConferenceData();
  const newFeedback: Feedback = {
    id: Date.now().toString(),
    sessionId,
    rating,
    comment,
    createdAt: new Date().toISOString(),
  };
  data.feedback.push(newFeedback);
  await saveConferenceData(data);
}

export async function updateSlot(updatedSlot: Slot): Promise<void> {
  const data = await getConferenceData();
  const index = data.slots.findIndex(s => s.id === updatedSlot.id);

  if (index !== -1) {
    data.slots[index] = updatedSlot;
  } else {
    data.slots.push(updatedSlot);
  }

  // Sort slots by start time
  data.slots.sort((a, b) => a.startTime.localeCompare(b.startTime));

  await saveConferenceData(data);
}

export async function deleteSlot(slotId: string): Promise<void> {
  const data = await getConferenceData();
  data.slots = data.slots.filter(s => s.id !== slotId);
  await saveConferenceData(data);
}
