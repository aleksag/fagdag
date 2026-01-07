
const fs = require('fs');

const CSV_FILE = 'schedule.csv';
const OUTPUT_FILE = 'data/conference.json';

function parseCSV(text) {
    const result = [];
    let currentRow = [];
    let currentCell = '';
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const nextChar = text[i + 1];

        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                // Escaped quote
                currentCell += '"';
                i++;
            } else {
                // Toggle quote
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            currentRow.push(currentCell);
            currentCell = '';
        } else if ((char === '\r' || char === '\n') && !inQuotes) {
            // Newline outside quotes - end of row
            // Handle CRLF
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
    // Push last row
    if (currentCell || currentRow.length > 0) {
        currentRow.push(currentCell);
        result.push(currentRow);
    }
    return result;
}

function parseTime(timeStr) {
    if (!timeStr) return null;
    const match = timeStr.match(/(\d{1,2}):(\d{2})/);
    if (!match) return null;
    return parseInt(match[1]) * 60 + parseInt(match[2]);
}

async function processCsv() {
    const content = fs.readFileSync(CSV_FILE, 'utf-8');
    const rows = parseCSV(content);

    const slots = [];

    // Find header row index
    let headerIndex = -1;
    for (let i = 0; i < rows.length; i++) {
        if (rows[i].some(c => c.includes('Tid')) && rows[i].some(c => c.includes('Speaker'))) {
            headerIndex = i;
            break;
        }
    }

    if (headerIndex === -1) {
        console.error("Could not find header row");
        return;
    }

    console.log(`Found header at row ${headerIndex}. Processing data rows...`);

    const activeSpans = {
        track1: 0,
        track2: 0
    };

    for (let i = headerIndex + 1; i < rows.length; i++) {
        const parts = rows[i];

        // Parse times
        const t1Time = parts[1]?.trim();
        if (!t1Time) continue;

        const timeMatch = t1Time.match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/);
        if (!timeMatch) continue;

        const startTime = timeMatch[1].padStart(5, '0');
        const endTime = timeMatch[2].padStart(5, '0');

        const startMinutes = parseTime(startTime);
        const endMinutes = parseTime(endTime);
        const slotDuration = endMinutes - startMinutes;

        const t1Title = parts[2]?.trim();
        const t1Desc = parts[3]?.trim();
        const t1Speaker = parts[4]?.trim();

        const t2Time = parts[5]?.trim();
        const t2Title = parts[6]?.trim();
        const t2Desc = parts[7]?.trim();
        const t2Speaker = parts[8]?.trim();

        const slotId = 'slot_' + i;
        const sessions = [];

        // Track if track2 is currently spanned (before we decrement the counter)
        const isTrack2Spanned = activeSpans.track2 > 0;

        // Track 1
        if (activeSpans.track1 > 0) {
            activeSpans.track1--;
            // Don't push session for track 1 (it's spanned)
        } else if (t1Title) {
            sessions.push({
                id: 'sess_t1_' + i,
                trackId: 'track1',
                title: t1Title,
                speaker: t1Speaker || '',
                description: t1Desc || ''
            });
        }

        // Track 2
        if (activeSpans.track2 > 0) {
            activeSpans.track2--;
            // Don't push session for track 2 (it's spanned)
        } else if (t2Title) {
            let rowSpan = 1;
            if (t2Time) {
                const t2Match = t2Time.match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/);
                if (t2Match) {
                    const t2Start = parseTime(t2Match[1]);
                    const t2End = parseTime(t2Match[2]);
                    const t2Duration = t2End - t2Start;

                    // Logic: If T2 duration is significantly longer than current slot duration
                    // and it roughly matches N * slotDuration, or just extends into next row?
                    // Simple logic for this specific case:
                    // Slot 1 (15:15-15:30) = 15m. T2 (15:15-15:40) = 25m.
                    // Excess = 10m. Next Slot (15:30-15:40) = 10m.
                    // So spans 1 extra slot.
                    if (t2Duration > slotDuration + 2) { // 2 mins buffer
                        // Calculate overlaps with future slots
                        // Look ahead
                        let remainingDuration = t2Duration - slotDuration;
                        let nextRowIdx = i + 1;
                        while (remainingDuration > 5 && nextRowIdx < rows.length) {
                            // Get next slot duration
                            const nextRow = rows[nextRowIdx];
                            const nTime = nextRow[1]?.trim(); // Assuming time is driven by Track 1 col
                            if (!nTime) break;
                            const nMatch = nTime.match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/);
                            if (nMatch) {
                                const nStart = parseTime(nMatch[1]);
                                const nEnd = parseTime(nMatch[2]);
                                remainingDuration -= (nEnd - nStart);
                                rowSpan++;
                                activeSpans.track2++; // Mark next slot as spanned
                            }
                            nextRowIdx++;
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

        // Determine Type
        let type = 'parallel';

        // Check for pauses (Track 1)
        if (t1Title?.toUpperCase().includes('PAUSE') || t1Title?.toUpperCase().includes('MIDDAG') || t1Title?.toUpperCase().includes('LUNSJ')) {
            type = 'break';
            if (sessions.length > 0) {
                sessions[0].trackId = 'all';
                if (sessions.length > 1) {
                    sessions.splice(1);
                }
            }
        } else if (isTrack2Spanned && sessions.length === 1 && sessions[0].trackId === 'track1') {
            // We have Track 1, and Track 2 is spanned from above.
            // This is Parallel - keep it as parallel, don't mark as common
            type = 'parallel';
        } else if (!t2Title && sessions.length === 1 && !isTrack2Spanned) {
            // If there is ONLY track 1 session, and track 2 is NOT spanned, then it is Common.
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

    const conferenceData = {
        tracks: [
            { id: 'track1', name: 'Spor 1' },
            { id: 'track2', name: 'Spor 2' }
        ],
        slots: slots,
        feedback: []
    };

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(conferenceData, null, 2));
    console.log(`Successfully imported ${slots.length} slots from CSV.`);
}

processCsv();
