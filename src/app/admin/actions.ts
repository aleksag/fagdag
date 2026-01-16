'use server';

import { updateSlot, deleteSlot as deleteSlotStore, Slot, getConferenceData, saveConferenceData, ConferenceData } from '@/lib/store';
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

export async function parseCSVAction(formData: FormData): Promise<{ success: boolean; slots?: Slot[]; error?: string }> {
    const file = formData.get('file') as File;
    if (!file) {
        return { success: false, error: 'No file uploaded' };
    }

    try {
        // fs.writeFileSync('debug.log', `[${new Date().toISOString()}] parseCSVAction started\n`, { flag: 'a' });
        console.log(`[${new Date().toISOString()}] parseCSVAction started`);

        const text = await file.text();
        console.log(`[${new Date().toISOString()}] Text read. Length: ${text.length}`);

        const rows = parseCSVInternal(text);
        console.log(`[${new Date().toISOString()}] Rows parsed: ${rows.length}`);

        const slots = processRowsToSlots(rows);
        console.log(`[${new Date().toISOString()}] Slots processed: ${slots.length}`);

        return { success: true, slots };
    } catch (error: any) {
        console.error('Error parsing CSV:', error);
        console.error(`[${new Date().toISOString()}] Error: ${error.message}\n${error.stack}`);
        return { success: false, error: error.message || 'Failed to parse CSV' };
    }
}

export async function saveScheduleAction(slots: Slot[]): Promise<{ success: boolean; error?: string }> {
    try {
        const data: ConferenceData = await getConferenceData();
        // Preserve tracks and feedback, replace slots
        const newData: ConferenceData = {
            ...data,
            slots: slots
        };
        await saveConferenceData(newData);
        revalidatePath('/');
        revalidatePath('/admin');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message || 'Failed to save schedule' };
    }
}

export async function shiftScheduleAction(minutes: number): Promise<{ success: boolean; error?: string }> {
    try {
        const data: ConferenceData = await getConferenceData();
        const updatedSlots = data.slots.map(slot => {
            return {
                ...slot,
                startTime: shiftTime(slot.startTime, minutes),
                endTime: shiftTime(slot.endTime, minutes)
            };
        });

        const newData: ConferenceData = {
            ...data,
            slots: updatedSlots
        };
        await saveConferenceData(newData);
        revalidatePath('/');
        revalidatePath('/admin');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message || 'Failed to shift schedule' };
    }
}

function shiftTime(time: string, minutesToAdd: number): string {
    const [hours, mins] = time.split(':').map(Number);
    const totalMinutes = (hours * 60) + mins + minutesToAdd;

    // Handle day wrap (optional but good to have)
    const normalizedMinutes = (totalMinutes % (24 * 60) + (24 * 60)) % (24 * 60);

    const newHours = Math.floor(normalizedMinutes / 60);
    const newMins = normalizedMinutes % 60;

    return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
}

// --- Helper Functions (Ported from import-csv.js) ---

function parseCSVInternal(text: string): string[][] {
    const result: string[][] = [];
    let currentRow: string[] = [];
    let currentCell = '';
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const nextChar = text[i + 1];

        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                currentCell += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            currentRow.push(currentCell);
            currentCell = '';
        } else if ((char === '\r' || char === '\n') && !inQuotes) {
            if (char === '\r' && nextChar === '\n') i++;

            currentRow.push(currentCell);
            if (currentRow.length > 0 && currentRow.some(c => c.trim() !== '')) {
                result.push(currentRow);
            }
            currentRow = [];
            currentCell = '';
        } else {
            currentCell += char;
        }
    }
    if (currentCell || currentRow.length > 0) {
        currentRow.push(currentCell);
        result.push(currentRow);
    }
    return result;
}

function parseTime(timeStr: string | undefined): number | null {
    if (!timeStr) return null;
    const match = timeStr.match(/(\d{1,2}):(\d{2})/);
    if (!match) return null;
    return parseInt(match[1]) * 60 + parseInt(match[2]);
}

function processRowsToSlots(rows: string[][]): Slot[] {
    const slots: Slot[] = [];
    let headerIndex = -1;

    for (let i = 0; i < rows.length; i++) {
        if (rows[i].some(c => c.includes('Tid')) && rows[i].some(c => c.includes('Speaker'))) {
            headerIndex = i;
            break;
        }
    }

    if (headerIndex === -1) {
        throw new Error("Could not find header row (looking for 'Tid' and 'Speaker')");
    }

    const activeSpans = { track1: 0, track2: 0 };

    for (let i = headerIndex + 1; i < rows.length; i++) {
        const parts = rows[i];
        const t1Time = parts[1]?.trim();
        if (!t1Time) continue;

        const timeMatch = t1Time.match(/(\d{1,2}:\d{2})\s*[-:]\s*(\d{1,2}:\d{2})/);
        if (!timeMatch) continue;

        const startTime = timeMatch[1].padStart(5, '0');
        const endTime = timeMatch[2].padStart(5, '0');
        const startMinutes = parseTime(startTime);
        const endMinutes = parseTime(endTime);

        if (startMinutes === null || endMinutes === null) continue;

        const slotDuration = endMinutes - startMinutes;

        const t1Title = parts[2]?.trim();
        const t1Desc = parts[3]?.trim();
        const t1Speaker = parts[4]?.trim();

        const t2Time = parts[5]?.trim();
        const t2Title = parts[6]?.trim();
        const t2Desc = parts[7]?.trim();
        const t2Speaker = parts[8]?.trim();

        const slotId = 'slot_' + i;
        const sessions: any[] = [];
        const isTrack2Spanned = activeSpans.track2 > 0;

        if (activeSpans.track1 > 0) {
            activeSpans.track1--;
        } else if (t1Title) {
            sessions.push({
                id: 'sess_t1_' + i,
                trackId: 'track1',
                title: t1Title,
                speaker: t1Speaker || '',
                description: t1Desc || ''
            });
        }

        if (activeSpans.track2 > 0) {
            activeSpans.track2--;
        } else if (t2Title) {
            let rowSpan = 1;
            if (t2Time) {
                const t2Match = t2Time.match(/(\d{1,2}:\d{2})\s*[-:]\s*(\d{1,2}:\d{2})/);
                if (t2Match) {
                    const t2Start = parseTime(t2Match[1]);
                    const t2End = parseTime(t2Match[2]);
                    if (t2Start !== null && t2End !== null) {
                        const t2Duration = t2End - t2Start;
                        if (t2Duration > slotDuration + 2) {
                            let remainingDuration = t2Duration - slotDuration;
                            let nextRowIdx = i + 1;
                            while (remainingDuration > 5 && nextRowIdx < rows.length) {
                                const nextRow = rows[nextRowIdx];
                                const nTime = nextRow[1]?.trim();
                                if (!nTime) break;
                                const nMatch = nTime.match(/(\d{1,2}:\d{2})\s*[-:]\s*(\d{1,2}:\d{2})/);
                                if (nMatch) {
                                    const nStart = parseTime(nMatch[1]);
                                    const nEnd = parseTime(nMatch[2]);
                                    if (nStart !== null && nEnd !== null) {
                                        remainingDuration -= (nEnd - nStart);
                                        rowSpan++;
                                        activeSpans.track2++;
                                    }
                                }
                                nextRowIdx++;
                            }
                        }
                    }
                }
            }

            sessions.push({
                id: 'sess_t2_' + i,
                trackId: 'track2',
                title: t2Title,
                speaker: t2Speaker || '',
                description: t2Desc || '',
                rowSpan: rowSpan > 1 ? rowSpan : undefined
            });
        }

        let type: 'parallel' | 'common' | 'break' = 'parallel';

        if (t1Title?.toUpperCase().includes('PAUSE') || t1Title?.toUpperCase().includes('MIDDAG') || t1Title?.toUpperCase().includes('LUNSJ')) {
            type = 'break';
            if (sessions.length > 0) {
                sessions[0].trackId = 'all';
                if (sessions.length > 1) {
                    sessions.splice(1);
                }
            }
        } else if (isTrack2Spanned && sessions.length === 1 && sessions[0].trackId === 'track1') {
            type = 'parallel';
        } else if (!t2Title && sessions.length === 1 && !isTrack2Spanned) {
            type = 'common';
            sessions[0].trackId = 'all';
        }

        slots.push({
            id: slotId,
            startTime,
            endTime,
            type,
            sessions
        });
    }
    return slots;
}
