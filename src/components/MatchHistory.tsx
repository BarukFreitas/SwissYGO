import { Round, Player, Match } from '@/types/tournament';

interface MatchHistoryProps {
    rounds: Round[];
    players: Player[];
}

export function MatchHistory({ rounds, players }: MatchHistoryProps) {
    const getPlayerName = (id: string) => {
        if (id === 'BYE') return 'BYE';
        return players.find(p => p.id === id)?.name || 'Desconhecido';
    };

    const getResultText = (match: Match) => {
        if (match.player2Id === 'BYE') return 'Vitória por BYE';
        if (!match.result) return 'Aguardando resultado';

        const p1Name = getPlayerName(match.player1Id);
        const p2Name = getPlayerName(match.player2Id);

        switch (match.result) {
            case 'P1_WIN':
                return `Vitória: ${p1Name}`;
            case 'P2_WIN':
                return `Vitória: ${p2Name}`;
            case 'DRAW':
                return 'Empate';
            case 'DOUBLE_LOSS':
                return 'Dupla Derrota';
            default:
                return 'Desconhecido';
        }
    };

    const getResultBadgeClass = (match: Match) => {
        if (match.player2Id === 'BYE') {
            return 'bg-green-500/10 text-green-400 border border-green-500/30';
        }
        if (!match.result) {
            return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30';
        }

        switch (match.result) {
            case 'P1_WIN':
            case 'P2_WIN':
                return 'bg-green-500/10 text-green-400 border border-green-500/30';
            case 'DRAW':
                return 'bg-blue-500/10 text-blue-400 border border-blue-500/30';
            case 'DOUBLE_LOSS':
                return 'bg-red-500/10 text-red-400 border border-red-500/30';
            default:
                return 'bg-gray-500/10 text-gray-400 border border-gray-500/30';
        }
    };

    return (
        <div className="space-y-8" data-testid="match-history-container">
            {rounds.length === 0 ? (
                <div className="p-8 text-center text-white/40 bg-white/5 rounded-xl border border-white/10 italic">
                    Nenhuma rodada iniciada ainda.
                </div>
            ) : (
                [...rounds].reverse().map((round) => (
                    <div 
                        key={round.number} 
                        data-testid="history-round-card"
                        className="bg-white/5 rounded-xl border border-white/10 p-6 space-y-4 animate-in fade-in duration-300"
                    >
                        <h3 className="text-xl font-bold text-white border-b border-white/10 pb-2">
                            Rodada {round.number}
                        </h3>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {round.matches.map((match) => {
                                const p1Name = getPlayerName(match.player1Id);
                                const p2Name = getPlayerName(match.player2Id);
                                return (
                                    <div 
                                        key={match.id}
                                        data-testid="history-match-item"
                                        className="bg-black/20 p-4 rounded-lg border border-white/5 flex flex-col justify-between gap-3"
                                    >
                                        <div className="flex justify-between items-center text-xs text-white/40">
                                            <span className="font-mono">Mesa {match.table === 0 ? '-' : match.table}</span>
                                            <span 
                                                data-testid="history-match-status"
                                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getResultBadgeClass(match)}`}
                                            >
                                                {match.player2Id === 'BYE' ? 'BYE' : (match.result ? match.result.replace('_', ' ') : 'PENDENTE')}
                                            </span>
                                        </div>
                                        <div className="text-sm font-medium space-y-1">
                                            <div className={match.result === 'P1_WIN' ? 'text-green-400 font-bold' : 'text-white'}>
                                                {p1Name}
                                            </div>
                                            {match.player2Id !== 'BYE' && (
                                                <>
                                                    <div className="text-white/20 text-xs py-0.5">VS</div>
                                                    <div className={match.result === 'P2_WIN' ? 'text-green-400 font-bold' : 'text-white'}>
                                                        {p2Name}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                        <div className="text-xs border-t border-white/5 pt-2 mt-1 font-semibold text-white/60">
                                            {getResultText(match)}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}
