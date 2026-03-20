import { MatchResult, Round, Player } from '@/types/tournament';

interface PairingsProps {
    round: Round;
    players: Player[];
    onSubmitResult: (matchId: string, result: MatchResult) => void;
    isCurrentRound: boolean;
}

export function Pairings({ round, players, onSubmitResult, isCurrentRound }: PairingsProps) {
    const getPlayerName = (id: string) => {
        if (id === 'BYE') return 'BYE';
        return players.find(p => p.id === id)?.name || 'Desconhecido';
    };

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white mb-6">Rodada {round.number}</h2>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {round.matches.map((match) => {
                    const p1Name = getPlayerName(match.player1Id);
                    const p2Name = getPlayerName(match.player2Id);

                    const isBye = match.player2Id === 'BYE';

                    return (
                        <div
                            key={match.id}
                            data-testid="match-item"
                            className={`relative bg-white/5 border rounded-xl overflow-hidden transition-all ${match.result ? 'border-green-500/30 bg-green-500/5' : 'border-white/10 hover:border-white/20'
                                }`}
                        >
                            <div className="p-4">
                                <div className="flex justify-between items-center mb-4 text-sm text-white/40">
                                    <span className="font-mono">Mesa {match.table === 0 ? '-' : match.table}</span>
                                    {match.result && (
                                        <span className="text-green-400 font-bold px-2 py-0.5 bg-green-400/10 rounded text-xs uppercase">
                                            {match.result.replace('_', ' ')}
                                        </span>
                                    )}
                                </div>

                                <div data-testid="match-players-container" className="space-y-4">

                                    <div data-testid="player1-container" className={`p-3 rounded-lg flex justify-between items-center transition-all ${match.result === 'P1_WIN' ? 'bg-green-500/20 text-green-400 font-bold border border-green-500/50' : 'bg-black/20 text-white border border-transparent'}`}>
                                        <span>{p1Name}</span>
                                        {isCurrentRound && !isBye && (
                                            <button
                                                data-testid="p1-win-button"
                                                onClick={() => onSubmitResult(match.id, 'P1_WIN')}
                                                className={`text-xs px-4 py-2 rounded-lg font-bold transition-all ${match.result === 'P1_WIN'
                                                    ? 'bg-green-500 text-white shadow-lg shadow-green-900/50'
                                                    : 'bg-white/10 hover:bg-green-600 hover:text-white'
                                                    }`}
                                            >
                                                Venceu
                                            </button>
                                        )}
                                    </div>


                                    {!isBye && (
                                        <div className="flex justify-center items-center gap-4 relative">
                                            <span className="text-white/20 text-xs font-bold uppercase tracking-widest absolute left-0">VS</span>

                                            {isCurrentRound && (
                                                <button
                                                    data-testid="double-loss-button"
                                                    onClick={() => onSubmitResult(match.id, 'DOUBLE_LOSS')}
                                                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border ${match.result === 'DOUBLE_LOSS'
                                                        ? 'bg-red-500 text-white border-red-400 shadow-lg shadow-red-900/50'
                                                        : 'bg-white/5 border-white/10 text-white/40 hover:text-red-400 hover:border-red-400/50'
                                                        }`}
                                                >
                                                    DOUBLE LOSS
                                                </button>
                                            )}
                                        </div>
                                    )}


                                    <div data-testid="player2-container" className={`p-3 rounded-lg flex justify-between items-center transition-all ${match.result === 'P2_WIN' ? 'bg-green-500/20 text-green-400 font-bold border border-green-500/50' : 'bg-black/20 text-white border border-transparent'}`}>
                                        <span>{p2Name}</span>
                                        {isCurrentRound && !isBye && (
                                            <button
                                                data-testid="p2-win-button"
                                                onClick={() => onSubmitResult(match.id, 'P2_WIN')}
                                                className={`text-xs px-4 py-2 rounded-lg font-bold transition-all ${match.result === 'P2_WIN'
                                                    ? 'bg-green-500 text-white shadow-lg shadow-green-900/50'
                                                    : 'bg-white/10 hover:bg-green-600 hover:text-white'
                                                    }`}
                                            >
                                                Venceu
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
