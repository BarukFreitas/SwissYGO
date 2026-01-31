import { Player } from '@/types/tournament';

interface StandingsProps {
    players: Player[];
}

export function Standings({ players }: StandingsProps) {
    const sortedPlayers = [...players].sort((a, b) => {
        if (a.score !== b.score) return b.score - a.score;
        return b.omw - a.omw;
    });

    return (
        <div className="overflow-hidden bg-white/5 rounded-xl border border-white/10">
            <table className="w-full text-left text-sm text-white">
                <thead className="bg-white/5 text-white/60 uppercase font-bold text-xs">
                    <tr>
                        <th className="px-6 py-3">#</th>
                        <th className="px-6 py-3">Duelista</th>
                        <th className="px-6 py-3 text-right">Pts</th>
                        <th className="px-6 py-3 text-right">OMW%</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {sortedPlayers.map((player, index) => (
                        <tr key={player.id} className="hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4 font-mono text-white/50">{index + 1}</td>
                            <td className="px-6 py-4 font-medium">{player.name}</td>
                            <td className="px-6 py-4 text-right font-bold text-indigo-400">{player.score}</td>
                            <td className="px-6 py-4 text-right text-white/60">
                                {(player.omw * 100).toFixed(2)}%
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {players.length === 0 && (
                <div className="p-8 text-center text-white/40">
                    Nenhum dado disponível
                </div>
            )}
        </div>
    );
}
