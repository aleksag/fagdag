import fs from 'fs/promises';
import { StorageProvider } from './StorageProvider';
import { ConferenceData } from './types';
import path from 'path';

export class FileStorageProvider implements StorageProvider {
    private filePath: string;

    constructor(filePath?: string) {
        this.filePath = filePath || path.join(process.cwd(), 'data', 'conference.json');
    }

    async getData(): Promise<ConferenceData> {
        try {
            const data = await fs.readFile(this.filePath, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Error reading conference data:', error);
            return { tracks: [], slots: [], feedback: [] };
        }
    }

    async saveData(data: ConferenceData): Promise<void> {
        // Ensure directory exists
        const dir = path.dirname(this.filePath);
        try {
            await fs.access(dir);
        } catch {
            await fs.mkdir(dir, { recursive: true });
        }

        await fs.writeFile(this.filePath, JSON.stringify(data, null, 2), 'utf-8');
    }
}
