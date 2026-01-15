'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Camera, X, Check, Trash2, CameraIcon } from 'lucide-react';
import { saveBingoSquare, getBingoSquares, deleteBingoSquare } from '@/lib/bingoStore';

const BINGO_GRID = [
    // B col
    { text: 'Spiller eller har spilt Minecraft', col: 'B' },
    { text: 'Har badet i havet i 2026', col: 'B' },
    { text: 'Født i februar', col: 'B' },
    { text: 'Leser manga', col: 'B' },
    { text: 'Har en lillebror', col: 'B' },
    // I col
    { text: 'Har en storesøster', col: 'I' },
    { text: 'Har brukket et bein', col: 'I' },
    { text: 'Trener på treningssenter', col: 'I' },
    { text: 'Har holdt innlegg på Fagdagen', col: 'I' },
    { text: 'Har møtt en kjendis', col: 'I' },
    // N col
    { text: 'Vært med i et NM', col: 'N' },
    { text: 'Kan spille et instrument', col: 'N' },
    { text: 'Skal reise til USA i 2026', col: 'N' },
    { text: 'Spiller fotball', col: 'N' },
    { text: 'Liker sushi', col: 'N' },
    // G col
    { text: 'Kan skate', col: 'G' },
    { text: 'Gjør yoga', col: 'G' },
    { text: 'Har et kjæledyr', col: 'G' },
    { text: 'Har lappen på bil', col: 'G' },
    { text: 'Har krøllete hår', col: 'G' },
    // O col
    { text: 'Har tatovering', col: 'O' },
    { text: 'Har tannlegeskrekk', col: 'O' },
    { text: 'Har høydeskrekk', col: 'O' },
    { text: 'Har drevet med ekstremsport', col: 'O' },
    { text: 'Har jobbet i Systek i over 10 år', col: 'O' },
];

// Re-order to 5x5 grid (rows first for rendering)
const GRID_SIZE = 5;
const ORDERED_GRID = Array(25).fill(null);
for (let i = 0; i < 25; i++) {
    const row = i % 5;
    const col = Math.floor(i / 5);
    ORDERED_GRID[row * 5 + col] = BINGO_GRID[i];
}

export default function BingoView() {
    const [capturedPhotos, setCapturedPhotos] = useState<Map<number, string>>(new Map());
    const [selectedSquare, setSelectedSquare] = useState<number | null>(null);
    const [isBingo, setIsBingo] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        loadBingoProgress();
    }, []);

    useEffect(() => {
        checkBingo();
    }, [capturedPhotos]);

    const loadBingoProgress = async () => {
        const saved = await getBingoSquares();
        setCapturedPhotos(saved);
    };

    const handleSquareClick = (index: number) => {
        if (capturedPhotos.has(index)) {
            setSelectedSquare(index);
        } else {
            setSelectedSquare(index);
            fileInputRef.current?.click();
        }
    };

    const handleCapture = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && selectedSquare !== null) {
            await saveBingoSquare(selectedSquare, file);
            const url = URL.createObjectURL(file);
            const newMap = new Map(capturedPhotos);
            newMap.set(selectedSquare, url);
            setCapturedPhotos(newMap);
        }
        // Reset file input
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleDelete = async (index: number) => {
        await deleteBingoSquare(index);
        const newMap = new Map(capturedPhotos);
        newMap.delete(index);
        setCapturedPhotos(newMap);
        setSelectedSquare(null);
    };

    const checkBingo = () => {
        const lines = [
            // Rows
            [0, 1, 2, 3, 4], [5, 6, 7, 8, 9], [10, 11, 12, 13, 14], [15, 16, 17, 18, 19], [20, 21, 22, 23, 24],
            // Cols
            [0, 5, 10, 15, 20], [1, 6, 11, 16, 21], [2, 7, 12, 17, 22], [3, 8, 13, 18, 23], [4, 9, 14, 19, 24],
            // Diagonals
            [0, 6, 12, 18, 24], [4, 8, 12, 16, 20]
        ];

        const hasBingo = lines.some(line => line.every(idx => capturedPhotos.has(idx)));
        setIsBingo(hasBingo);
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-500">
            <div className="text-center space-y-4">
                <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900 uppercase">
                    B I N G O
                </h2>
                <p className="text-text-muted max-w-lg mx-auto">
                    Finn noen som passer beskrivelsen, ta en selfie sammen, og få bingo!
                </p>
            </div>

            {isBingo && (
                <div className="bg-primary/20 border-2 border-primary text-primary-dark p-4 rounded-2xl text-center font-bold animate-bounce shadow-lg">
                    🎉 DU HAR BINGO!, ta kontakt med Nicolina for potensiell premie 🎉
                </div>
            )}

            {/* Grid Container */}
            <div className="grid grid-cols-5 gap-2 md:gap-4 aspect-square">
                {ORDERED_GRID.map((square, idx) => {
                    const hasPhoto = capturedPhotos.has(idx);
                    const photoUrl = capturedPhotos.get(idx);

                    return (
                        <button
                            key={idx}
                            onClick={() => handleSquareClick(idx)}
                            className={`
                relative flex flex-col items-center justify-center p-1 md:p-3 rounded-lg md:rounded-xl overflow-hidden
                transition-all duration-300 text-center border-2
                ${hasPhoto
                                    ? 'border-primary bg-primary/5'
                                    : 'border-gray-200 bg-white hover:border-primary/50 hover:bg-gray-50 shadow-sm'
                                }
                aspect-square group
              `}
                        >
                            {hasPhoto ? (
                                <div className="absolute inset-0 z-0">
                                    <img src={photoUrl} alt="Selfie" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <CameraIcon className="text-white" size={24} />
                                    </div>
                                    <div className="absolute top-1 right-1 bg-primary text-white p-0.5 rounded-full z-10">
                                        <Check size={12} />
                                    </div>
                                </div>
                            ) : (
                                <div className="z-10 flex flex-col items-center justify-center gap-0.5 md:gap-1">
                                    <span className="text-[7px] md:text-xs font-bold text-gray-400 uppercase tracking-widest">{square.col}</span>
                                    <span className="text-[8.5px] min-[375px]:text-[10px] min-[425px]:text-[11px] md:text-[14px] leading-[1.1] md:leading-tight font-medium text-gray-700 break-words hyphens-auto line-clamp-4">
                                        {square.text}
                                    </span>
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            <input
                type="file"
                accept="image/*"
                capture="user"
                className="hidden"
                ref={fileInputRef}
                onChange={handleCapture}
            />

            {/* Modal for viewing/deleting photo */}
            {selectedSquare !== null && capturedPhotos.has(selectedSquare) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-3xl overflow-hidden max-w-sm w-full shadow-2xl animate-in zoom-in-95">
                        <div className="relative aspect-[3/4]">
                            <img src={capturedPhotos.get(selectedSquare)} alt="Detailed view" className="w-full h-full object-cover" />
                            <button
                                onClick={() => setSelectedSquare(null)}
                                className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-primary uppercase tracking-widest">Kriterium</p>
                                <h3 className="text-lg font-bold text-gray-900 leading-tight">
                                    {ORDERED_GRID[selectedSquare].text}
                                </h3>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition"
                                >
                                    <Camera size={18} /> Ta nytt
                                </button>
                                <button
                                    onClick={() => handleDelete(selectedSquare)}
                                    className="bg-red-50 hover:bg-red-100 text-red-600 p-3 rounded-xl transition"
                                    title="Slett bilde"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
