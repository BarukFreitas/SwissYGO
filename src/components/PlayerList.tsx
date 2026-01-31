import React, { useState } from 'react';
import { Player } from '@/types/tournament';

interface PlayerListProps {
    players: Player[];
    onAdd: (name: string) => void;
    onRemove: (id: string) => void;
    readOnly?: boolean;
}

export function PlayerList({ players, onAdd, onRemove, readOnly = false }: PlayerListProps) {
    const [name, setName] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            onAdd(name.trim());
            setName('');
        }
    };

    return (
        <div className="bg-white/5 p-6 rounded-xl border border-white/10">
            <h2 className="text-xl font-bold mb-4 text-white">Jogadores ({players.length})</h2>

            {!readOnly && (
                <form onSubmit={handleSubmit} className="mb-4 flex gap-2">
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Nome do Duelista"
                        className="flex-1 bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                    <button
                        type="submit"
                        disabled={!name.trim()}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Adicionar
                    </button>
                </form>
            )}

            <ul className="space-y-2 max-h-[400px] overflow-y-auto">
                {players.map((player) => (
                    <li
                        key={player.id}
                        className="flex items-center justify-between bg-white/5 px-4 py-3 rounded-lg border border-white/5 hover:border-white/20 transition-all"
                    >
                        <span className="text-white font-medium">{player.name}</span>
                        {!readOnly && (
                            <button
                                onClick={() => onRemove(player.id)}
                                className="text-red-400 hover:text-red-300 p-2 hover:bg-red-400/10 rounded-lg transition-colors"
                                title="Remover jogador"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </button>
                        )}
                    </li>
                ))}
                {players.length === 0 && (
                    <li className="text-white/40 text-center py-4 italic">
                        Nenhum jogador registrado
                    </li>
                )}
            </ul>
        </div>
    );
}
