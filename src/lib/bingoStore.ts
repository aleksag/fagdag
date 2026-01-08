import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'PeopleBingoDB';
const STORE_NAME = 'bingoSquares';
const DB_VERSION = 1;

interface BingoSquare {
    index: number;
    imageBlob: Blob;
    capturedAt: string;
}

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB() {
    if (!dbPromise) {
        dbPromise = openDB(DB_NAME, DB_VERSION, {
            upgrade(db) {
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME, { keyPath: 'index' });
                }
            },
        });
    }
    return dbPromise;
}

export async function saveBingoSquare(index: number, imageBlob: Blob): Promise<void> {
    const db = await getDB();
    const square: BingoSquare = {
        index,
        imageBlob,
        capturedAt: new Date().toISOString(),
    };
    await db.put(STORE_NAME, square);
}

export async function getBingoSquares(): Promise<Map<number, string>> {
    const db = await getDB();
    const allSquares: BingoSquare[] = await db.getAll(STORE_NAME);
    const result = new Map<number, string>();

    for (const square of allSquares) {
        // Create URL for blob
        const url = URL.createObjectURL(square.imageBlob);
        result.set(square.index, url);
    }

    return result;
}

export async function deleteBingoSquare(index: number): Promise<void> {
    const db = await getDB();
    await db.delete(STORE_NAME, index);
}

export async function clearAllBingo(): Promise<void> {
    const db = await getDB();
    await db.clear(STORE_NAME);
}
