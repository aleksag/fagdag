import { ConferenceData } from './types';

export interface StorageProvider {
    getData(): Promise<ConferenceData>;
    saveData(data: ConferenceData): Promise<void>;
}
